import { memo, useLayoutEffect, useRef } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodePather, NodeRenderer, NodeRendererProps } from "../types";
import {
    STROKECAP_MODE_OPTIONS,
    StrokeCapMode,
    StrokeCapModes,
    StrokeJoinMode,
    StrokeJoinModes,
    TEXT_ALIGN_MODE_OPTIONS,
    TEXT_ANCHOR_MODE_OPTIONS,
    TextAlignMode,
    TextAlignModes,
    TextAnchorMode,
    TextAnchorModes,
    NodeTypes,
    SocketTypes,
} from "../../../../utility/enums";
import { Color, Length } from "!/utility/types/units";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { TextInput } from "!/components/inputs/TextInput";
import ToggleList from "!/components/selectors/ToggleList";
import TextArea from "!/components/inputs/TextArea";
import { FONT, FONT_NAMES } from "../fonts";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import RotaryInput from "!/components/inputs/RotaryInput";
import styled from "styled-components";
import { Icon } from "!/components/icons";
import { nodeIcons } from "../icons";
import { iconNoticeWarning } from "../../../../components/icons/notice/warning";

interface ITextPathNode extends INodeDefinition {
    inputs: {
        path: NodePather;
        fontSize: Length;
        fontSpacing: Length;

        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        fillColor: Color;
        textRotation: number;
    };
    outputs: {
        output: NodeRenderer;
    };
    values: {
        text: string;
        fontSize: Length;
        fontSpacing: Length;
        fontFamily: FONT | "default";
        textAlign: TextAlignMode;
        textAnchor: TextAnchorMode;
        textRotation: number;

        strokeWidth: Length;
        strokeColor: Color;
        strokeCap: StrokeCapMode;
        strokeJoin: StrokeJoinMode;
        strokeDash: string;
        strokeOffset: Length;
        fillColor: Color;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<ITextPathNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [text, setText] = nodeHooks.useValueState(nodeId, "text");
    const [fontFamily, setFontFamily] = nodeHooks.useValueState(nodeId, "fontFamily");
    const [fontSize, setFontSize] = nodeHooks.useValueState(nodeId, "fontSize");
    const [fontSpacing, setFontSpacing] = nodeHooks.useValueState(nodeId, "fontSpacing");
    const [textAlign, setTextAlign] = nodeHooks.useValueState(nodeId, "textAlign");
    const [textAnchor, setTextAnchor] = nodeHooks.useValueState(nodeId, "textAnchor");

    const hasFontSize = nodeHooks.useHasLink(nodeId, "fontSize");
    const hasFontSpacing = nodeHooks.useHasLink(nodeId, "fontSpacing");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
    const [textRotation, setTextRotation] = nodeHooks.useValueState(nodeId, "textRotation");

    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");
    const hasTextRotation = nodeHooks.useHasLink(nodeId, "textRotation");

    return (
        <BaseNode<ITextPathNode> nodeId={nodeId} helper={TextPathNodeHelper} hooks={nodeHooks}>
            <SocketOut<ITextPathNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                Conformal Path
            </SocketIn>
            <hr />
            <BaseNode.Foldout panelId={"text"} label={"Text"} inputs={""} nodeId={nodeId} outputs={""}>
                <TextArea className={"auto tall"} value={text} onValidCommit={setText} />
                <Warning>
                    <Icon value={iconNoticeWarning} className={"flavour-emphasis"} /> Caution: fonts are not embeded into any exported SVGs.
                </Warning>
            </BaseNode.Foldout>
            <hr />
            <BaseNode.Foldout panelId={"font"} label={"Font"} nodeId={nodeId} inputs={""} outputs={""}>
                <BaseNode.Input label={"Font Family"}>
                    <NativeDropdown value={fontFamily} options={FONT_OPTIONS} onSelect={setFontFamily} />
                </BaseNode.Input>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"fontSize"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Font Size"}>
                        <LengthInput value={fontSize} onValidValue={setFontSize} disabled={hasFontSize} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <BaseNode.Input label={"Align"}>
                    <ToggleList value={textAlign} onSelect={setTextAlign} options={TEXT_ALIGN_MODE_OPTIONS} />
                </BaseNode.Input>
                <BaseNode.Input label={"Anchor"}>
                    <ToggleList value={textAnchor} onSelect={setTextAnchor} options={TEXT_ANCHOR_MODE_OPTIONS} />
                </BaseNode.Input>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"fontSpacing"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Font Spacing"}>
                        <LengthInput value={fontSpacing} onValidValue={setFontSpacing} disabled={hasFontSpacing} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"textRotation"} type={SocketTypes.ANGLE}>
                    <BaseNode.Input label={"Text Rotation"}>
                        <RotaryInput value={textRotation} onValidValue={setTextRotation} disabled={hasTextRotation} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor strokeOffset fillColor"} outputs={""}>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Stroke Color"}>
                        <HexColorInput nullable alpha value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
                    </BaseNode.Input>
                </SocketIn>
                <BaseNode.Input label={"Stroke Cap"}>
                    <ToggleList value={strokeCap} onSelect={setStrokeCap} options={STROKECAP_MODE_OPTIONS} disabled={strokeDash === ""} />
                </BaseNode.Input>
                <BaseNode.Input label={"Stroke Dash"}>
                    <TextInput value={strokeDash} onCommit={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
                </BaseNode.Input>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ITextPathNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, globals, depth, overrides = {} }: NodeRendererProps) => {
    const text = nodeHooks.useValue(nodeId, "text");
    const fontFamily = nodeHooks.useValue(nodeId, "fontFamily");
    const textAlign = nodeHooks.useValue(nodeId, "textAlign");
    const textAnchor = nodeHooks.useValue(nodeId, "textAnchor");

    const fontSize = nodeHooks.useCoalesce(nodeId, "fontSize", "fontSize", globals);
    const fontSpacing = nodeHooks.useCoalesce(nodeId, "fontSpacing", "fontSpacing", globals);
    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
    const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
    const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
    const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");
    const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);
    const textRotation = nodeHooks.useCoalesce(nodeId, "textRotation", "textRotation", globals);

    const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);

    const [ConformalPath, pId] = nodeHooks.useInputNode(nodeId, "path", globals);

    const ref = useRef<SVGTextPathElement>(null);

    useLayoutEffect(() => {
        if (ref && ref.current) {
            const n = ref.current;
            n.style.display = "none";
            const r = setTimeout(() => {
                n.style.display = "initial";
            }, 0);
            return () => {
                clearTimeout(r);
            };
        }
    });

    return (
        <>
            <g
                stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
                strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
                strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
                strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
                strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
                    .map(MathHelper.lengthToPx)
                    .join(" ")}
            >
                <defs>
                    {ConformalPath && pId && (
                        <ConformalPath nodeId={pId} depth={(depth ?? "") + `_${nodeId}.conformpath`} globals={globals} pathId={`conformpath_${nodeId}_lyr-${depth ?? ""}`} pathLength={100} />
                    )}
                </defs>
                <text
                    vectorEffect={"non-scaling-stroke"}
                    fontFamily={fontFamily === "default" ? undefined : FONT_NAMES[fontFamily]}
                    fontSize={`${MathHelper.lengthToPx(fontSize)}`}
                    dominantBaseline={textAnchor}
                    letterSpacing={MathHelper.lengthToPx(fontSpacing)}
                    spacing={"spacingAndGlyphs"}
                    rotate={textRotation}
                >
                    <textPath href={`#conformpath_${nodeId}_lyr-${depth ?? ""}`} startOffset={OFFSET[textAlign]} textAnchor={textAlign} ref={ref}>
                        {text}
                    </textPath>
                </text>
                {/* <circle cx={0} cy={0} r={Math.max(0, MathHelper.lengthToPx(radius ?? { value: 100, unit: "px" }))} vectorEffect={"non-scaling-stroke"} /> */}
            </g>
        </>
    );
});

const TextPathNodeHelper: INodeHelper<ITextPathNode> = {
    name: "Text Path",
    buttonIcon: nodeIcons.textShape.buttonIcon,
    nodeIcon: nodeIcons.textShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_TEXTPATH,
    getOutput: () => Renderer,
    initialize: () => ({
        text: "Hello World",
        fontFamily: "default",
        fontSize: { value: 12, unit: "pt" },
        fontSpacing: { value: 0, unit: "pt" },
        textAlign: TextAlignModes.START,
        textAnchor: TextAnchorModes.MIDDLE,
        textRotation: 0,

        strokeWidth: { value: 0, unit: "px" },
        strokeDash: "",
        strokeOffset: { value: 0, unit: "px" },
        strokeCap: StrokeCapModes.BUTT,
        strokeJoin: StrokeJoinModes.MITER,
        fillColor: { r: 0, g: 0, b: 0, a: 1 },
        strokeColor: null as Color,
    }),
    controls: Controls,
};

export default TextPathNodeHelper;

const FONT_OPTIONS = { default: "Default", ...FONT_NAMES };

const OFFSET: { [key in TextAlignMode]: number } = {
    start: 0,
    middle: 50,
    end: 100,
};

const Warning = styled.div`
    padding-inline: 0.25em;
`;
