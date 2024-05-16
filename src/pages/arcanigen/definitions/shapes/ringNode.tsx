import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps } from "../types";
import {
    PositionMode,
    SpanMode,
    SPAN_MODE_OPTIONS,
    SPREAD_ALIGN_MODE_OPTIONS,
    SpreadAlignMode,
    STROKECAP_MODE_OPTIONS,
    StrokeCapMode,
    SpanModes,
    SpreadAlignModes,
    StrokeCapModes,
    NodeTypes,
    SocketTypes,
    PositionModes,
} from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import { TextInput } from "!/components/inputs/TextInput";
import { nodeIcons } from "../icons";

interface IRingNode extends INodeDefinition {
    inputs: {
        radius: Length;
        spread: Length;
        innerRadius: Length;
        outerRadius: Length;
        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        fillColor: Color;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
    };
    outputs: {
        output: NodeRenderer;
    };
    values: {
        spanMode: SpanMode;
        radius: Length;
        spread: Length;
        spreadAlignMode: SpreadAlignMode;
        innerRadius: Length;
        outerRadius: Length;
        strokeWidth: Length;
        strokeColor: Color;
        strokeDash: string;
        strokeCap: StrokeCapMode;
        strokeOffset: Length;
        fillColor: Color;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        positionMode: PositionMode;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IRingNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [spread, setSpread] = nodeHooks.useValueState(nodeId, "spread");
    const [spreadAlignMode, setSpreadAlignMode] = nodeHooks.useValueState(nodeId, "spreadAlignMode");
    const [spanMode, setSpanMode] = nodeHooks.useValueState(nodeId, "spanMode");
    const [innerRadius, setInnerRadius] = nodeHooks.useValueState(nodeId, "innerRadius");
    const [outerRadius, setOuterRadius] = nodeHooks.useValueState(nodeId, "outerRadius");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

    const hasInnerRadius = nodeHooks.useHasLink(nodeId, "innerRadius");
    const hasOuterRadius = nodeHooks.useHasLink(nodeId, "outerRadius");
    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasSpread = nodeHooks.useHasLink(nodeId, "spread");
    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

    return (
        <BaseNode<IRingNode> nodeId={nodeId} helper={RingNodeHelper} hooks={nodeHooks}>
            <SocketOut<IRingNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <BaseNode.Input label={"Span Mode"}>
                <ToggleList value={spanMode} onSelect={setSpanMode} options={SPAN_MODE_OPTIONS} />
            </BaseNode.Input>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Outer Radius"}>
                    <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || spanMode === SpanModes.SPREAD} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Inner Radius"}>
                    <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || spanMode === SpanModes.SPREAD} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || spanMode === SpanModes.INOUT} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Spread"}>
                    <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || spanMode === SpanModes.INOUT} />
                </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Spread Align Mode"}>
                <ToggleList value={spreadAlignMode} onSelect={setSpreadAlignMode} options={SPREAD_ALIGN_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
            </BaseNode.Input>
            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
                <SocketIn<IRingNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IRingNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Stroke Color"}>
                        <HexColorInput nullable alpha value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
                    </BaseNode.Input>
                </SocketIn>
                <BaseNode.Input label={"Stroke Cap"}>
                    <ToggleList value={strokeCap} onSelect={setStrokeCap} options={STROKECAP_MODE_OPTIONS} />
                </BaseNode.Input>
                <BaseNode.Input label={"Stroke Dash"}>
                    <TextInput value={strokeDash} onCommit={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
                </BaseNode.Input>
                <SocketIn<IRingNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IRingNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Position<IRingNode> nodeId={nodeId} hooks={nodeHooks} />
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
    const spanMode = nodeHooks.useValue(nodeId, "spanMode");
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const spread = nodeHooks.useCoalesce(nodeId, "spread", "spread", globals);
    const spreadAlignMode = nodeHooks.useValue(nodeId, "spreadAlignMode");
    const innerRadius = nodeHooks.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
    const outerRadius = nodeHooks.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

    const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
    const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
    const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);
    const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);

    const positionMode = nodeHooks.useValue(nodeId, "positionMode");
    const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
    const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);

    const tIMod =
        spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? MathHelper.lengthToPx(spread) / 2
            : spreadAlignMode === SpreadAlignModes.INWARD
            ? MathHelper.lengthToPx(spread)
            : 0;
    const tOMod =
        spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? MathHelper.lengthToPx(spread) / 2
            : spreadAlignMode === SpreadAlignModes.OUTWARD
            ? MathHelper.lengthToPx(spread)
            : 0;

    const rI = spanMode === SpanModes.INOUT ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - tIMod;
    const rO = spanMode === SpanModes.INOUT ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + tOMod;

    return (
        <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)}`}>
            <g
                stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
                strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
                strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
                strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
                    .map(MathHelper.lengthToPx)
                    .join(" ")}
            >
                <path d={`M ${rO},0 A 1,1 0 0,0 ${-rO},0 A 1,1 0 0,0 ${rO},0 M ${rI},0 A 1,1 0 0,1 ${-rI},0 A 1,1 0 0,1 ${rI},0`} vectorEffect={"non-scaling-stroke"} />
            </g>
        </g>
    );
});

const RingNodeHelper: INodeHelper<IRingNode> = {
    name: "Ring",
    buttonIcon: nodeIcons.ringShape.buttonIcon,
    nodeIcon: nodeIcons.ringShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_RING,
    getOutput: () => Renderer,
    initialize: () => ({
        radius: { value: 150, unit: "px" },
        spread: { value: 20, unit: "px" },
        spreadAlignMode: SpreadAlignModes.CENTER,
        spanMode: SpanModes.INOUT,
        innerRadius: { value: 140, unit: "px" },
        outerRadius: { value: 160, unit: "px" },
        strokeWidth: { value: 1, unit: "px" },
        strokeColor: { r: 0, g: 0, b: 0, a: 1 },
        strokeDash: "",
        strokeOffset: { value: 0, unit: "px" },
        strokeCap: StrokeCapModes.BUTT,
        fillColor: null as Color,

        positionX: { value: 0, unit: "px" },
        positionY: { value: 0, unit: "px" },
        positionRadius: { value: 0, unit: "px" },
        positionTheta: 0,
        positionMode: PositionModes.CARTESIAN,
    }),
    controls: Controls,
};

export default RingNodeHelper;
