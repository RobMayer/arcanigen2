import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import MathHelper from "!/utility/mathhelper";
import { Color, Length } from "!/utility/types/units";
import { useMemo } from "react";
import ArcaneGraph from "../graph";
import BaseNode from "../../nodeView/node";
import { SocketIn } from "../../nodeView/socket";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodeRenderer } from "../types";
import { FONT, FONT_DEFINITIONS } from "../fonts";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IResultNode extends INodeDefinition {
    inputs: {
        input: NodeRenderer;
        canvasColor: Color;
        canvasWidth: Length;
        canvasHeight: Length;
        originOffsetX: Length;
        originOffsetY: Length;
    };
    values: {
        canvasColor: Color;
        canvasWidth: Length;
        canvasHeight: Length;
        originOffsetX: Length;
        originOffsetY: Length;
    };
}

const nodeHelper = ArcaneGraph.nodeHooks<IResultNode>();

const Controls = ({ nodeId, globals }: ControlRendererProps) => {
    const [canvasColor, setCanvasColor] = nodeHelper.useValueState(nodeId, "canvasColor");
    const [canvasWidth, setCanvasWidth] = nodeHelper.useValueState(nodeId, "canvasWidth");
    const [canvasHeight, setCanvasHeight] = nodeHelper.useValueState(nodeId, "canvasHeight");

    const [originOffsetX, setOriginOffsetX] = nodeHelper.useValueState(nodeId, "originOffsetX");
    const [originOffsetY, setOriginOffsetY] = nodeHelper.useValueState(nodeId, "originOffsetY");

    const hasCanvasColor = nodeHelper.useHasLink(nodeId, "canvasColor");
    const hasCanvasWidth = nodeHelper.useHasLink(nodeId, "canvasWidth");
    const hasCanvasHeight = nodeHelper.useHasLink(nodeId, "canvasHeight");

    const hasOriginOffsetX = nodeHelper.useHasLink(nodeId, "originOffsetX");
    const hasOriginOffsetY = nodeHelper.useHasLink(nodeId, "originOffsetY");

    return (
        <BaseNode<IResultNode> nodeId={nodeId} helper={ResultNodeHelper} hooks={nodeHelper} noRemove>
            <SocketIn<IResultNode> type={SocketTypes.SHAPE} nodeId={nodeId} socketId={"input"}>
                Input
            </SocketIn>
            <hr />
            <SocketIn<IResultNode> type={SocketTypes.COLOR} nodeId={nodeId} socketId={"canvasColor"}>
                <BaseNode.Input label={"Canvas Color"}>
                    <HexColorInput value={canvasColor} onValue={setCanvasColor} disabled={hasCanvasColor} alpha />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasWidth"}>
                <BaseNode.Input label={"Canvas Width"}>
                    <LengthInput value={canvasWidth} onValidValue={setCanvasWidth} disabled={hasCanvasWidth} min={0} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasHeight"}>
                <BaseNode.Input label={"Canvas Height"}>
                    <LengthInput value={canvasHeight} onValidValue={setCanvasHeight} disabled={hasCanvasHeight} min={0} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"originOffsetX"}>
                <BaseNode.Input label={"Origin Offset X"}>
                    <LengthInput value={originOffsetX} onValidValue={setOriginOffsetX} disabled={hasOriginOffsetX} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"originOffsetY"}>
                <BaseNode.Input label={"Origin Offset Y"}>
                    <LengthInput value={originOffsetY} onValidValue={setOriginOffsetY} disabled={hasOriginOffsetY} />
                </BaseNode.Input>
            </SocketIn>
        </BaseNode>
    );
};

const ResultNodeHelper: INodeHelper<IResultNode> = {
    name: "Result",
    buttonIcon: null,
    flavour: "confirm",
    nodeIcon: nodeIcons.result.nodeIcon,
    type: NodeTypes.META_RESULT,
    getOutput: () => undefined as never,
    initialize: () => ({
        canvasColor: { r: 1, g: 1, b: 1, a: 1 },
        canvasWidth: { value: 800, unit: "px" },
        canvasHeight: { value: 800, unit: "px" },
        originOffsetX: { value: 0, unit: "px" },
        originOffsetY: { value: 0, unit: "px" },
    }),
    controls: Controls,
};

export default ResultNodeHelper;

const nodeId = "ROOT";

export const RootNodeRenderer = () => {
    const globals = useMemo(() => ({ sequenceData: START_SEQUENCE, portalData: START_PORTAL }), []);

    const canvasColor = nodeHelper.useCoalesce(nodeId, "canvasColor", "canvasColor", globals);
    const canvasHeight = nodeHelper.useCoalesce(nodeId, "canvasHeight", "canvasHeight", globals);
    const canvasWidth = nodeHelper.useCoalesce(nodeId, "canvasWidth", "canvasWidth", globals);

    const originOffsetX = nodeHelper.useCoalesce(nodeId, "originOffsetX", "originOffsetX", globals);
    const originOffsetY = nodeHelper.useCoalesce(nodeId, "originOffsetY", "originOffsetY", globals);

    const x = useMemo(() => MathHelper.lengthToPx(originOffsetX ?? { value: 0, unit: "px" }), [originOffsetX]);
    const y = useMemo(() => MathHelper.lengthToPx(originOffsetY ?? { value: 0, unit: "px" }), [originOffsetY]);
    const h = useMemo(() => Math.max(0, MathHelper.lengthToPx(canvasHeight ?? { value: 800, unit: "px" })), [canvasHeight]);
    const w = useMemo(() => Math.max(0, MathHelper.lengthToPx(canvasWidth ?? { value: 800, unit: "px" })), [canvasWidth]);

    const [OutputRenderer, childNodeId] = nodeHelper.useInputNode(nodeId, "input", globals);

    const theStyle = useMemo(() => {
        return { backgroundColor: canvasColor === null ? "rgb(255, 255, 255)" : MathHelper.colorToHTML(canvasColor) };
    }, [canvasColor]);

    return (
        <svg width={`${w}px`} height={`${h}px`} viewBox={`${w / -2} ${h / -2} ${w} ${h}`} style={theStyle} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <defs>
                <style>
                    {`text.font-default { font-family: inherit; }`}
                    {Object.keys(FONT_DEFINITIONS)
                        .map(
                            (k: FONT) => `
                  @font-face {
                     font-family: '${FONT_DEFINITIONS[k].family}';
                     src: url('${FONT_DEFINITIONS[k].url}') format('${FONT_DEFINITIONS[k].format}');
                  }
                  text.font-${k} { font-family: '${FONT_DEFINITIONS[k].family}'; }
                  `
                        )
                        .join("")}
                </style>
            </defs>
            <g transform={`translate(${x}, ${y})`}>{OutputRenderer && childNodeId && <OutputRenderer nodeId={childNodeId} depth={nodeId} globals={globals} />}</g>
        </svg>
    );
};

const START_SEQUENCE = {
    ROOT: 0,
};

const START_PORTAL = {};
