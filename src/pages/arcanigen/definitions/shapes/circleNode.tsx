import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, NodePather, NodeRenderer, NodeRendererProps } from "../types";
import { PositionMode, STROKECAP_MODE_OPTIONS, StrokeCapMode, StrokeCapModes, NodeTypes, SocketTypes, PositionModes } from "../../../../utility/enums";
import { Color, Length } from "!/utility/types/units";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import { TextInput } from "!/components/inputs/TextInput";
import ToggleList from "!/components/selectors/ToggleList";
import { nodeIcons } from "../icons";

interface ICircleNode extends INodeDefinition {
    inputs: {
        radius: Length;
        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        fillColor: Color;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        rotation: number;
    };
    outputs: {
        output: NodeRenderer;
        path: NodePather;
    };
    values: {
        radius: Length;
        strokeWidth: Length;
        strokeColor: Color;
        strokeCap: StrokeCapMode;
        strokeDash: string;
        strokeOffset: Length;
        fillColor: Color;

        rotation: number;
        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        positionMode: PositionMode;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<ICircleNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

    return (
        <BaseNode<ICircleNode> nodeId={nodeId} helper={CircleNodeHelper} hooks={nodeHooks}>
            <SocketOut<ICircleNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} min={0} />
                </BaseNode.Input>
            </SocketIn>
            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor strokeOffset fillColor"} outputs={""}>
                <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
                <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ICircleNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<ICircleNode> nodeId={nodeId} hooks={nodeHooks} />
            <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"path"} nodeId={nodeId}>
                <SocketOut<ICircleNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                    Conformal Path
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<ICircleNode>();

const getPath = (graph: IArcaneGraph, nodeId: string, globals: GraphGlobals) => {
    const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
    const positionMode = nodeMethods.getValue(graph, nodeId, "positionMode");
    const positionX = nodeMethods.coalesce(graph, nodeId, "positionX", "positionX", globals);
    const positionY = nodeMethods.coalesce(graph, nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeMethods.coalesce(graph, nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeMethods.coalesce(graph, nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeMethods.coalesce(graph, nodeId, "rotation", "rotation", globals);

    const r = MathHelper.lengthToPx(radius);

    return {
        transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation ?? 0})`,
        d: `M 0,${-1 * r} A ${r},${r} 0 0 1 0,${r} A ${r},${r} 0 0 1 0,${r * -1}`,
    };
};

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
    const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
    const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
    const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);

    const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);

    const positionMode = nodeHooks.useValue(nodeId, "positionMode");
    const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
    const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

    return (
        <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation ?? 0})`}>
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
                <circle cx={0} cy={0} r={Math.max(0, MathHelper.lengthToPx(radius ?? { value: 100, unit: "px" }))} vectorEffect={"non-scaling-stroke"} />
            </g>
        </g>
    );
});

const CircleNodeHelper: INodeHelper<ICircleNode> = {
    name: "Circle",
    buttonIcon: nodeIcons.circleShape.buttonIcon,
    nodeIcon: nodeIcons.circleShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_CIRCLE,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ICircleNode["outputs"], globals: GraphGlobals) => {
        switch (socket) {
            case "output":
                return Renderer;
            case "path":
                return getPath(graph, nodeId, globals);
        }
    },
    initialize: () => ({
        radius: { value: 100, unit: "px" },
        strokeWidth: { value: 1, unit: "px" },
        strokeDash: "",
        strokeOffset: { value: 0, unit: "px" },
        strokeCap: StrokeCapModes.BUTT,
        strokeColor: { r: 0, g: 0, b: 0, a: 1 },
        fillColor: null as Color,

        positionX: { value: 0, unit: "px" },
        positionY: { value: 0, unit: "px" },
        positionRadius: { value: 0, unit: "px" },
        positionTheta: 0,
        positionMode: PositionModes.CARTESIAN,
        rotation: 0,
    }),
    controls: Controls,
};

export default CircleNodeHelper;
