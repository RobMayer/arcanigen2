import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodePather, NodePatherProps } from "../types";
import { PositionMode, StrokeCapMode, STROKECAP_MODE_OPTIONS, POSITION_MODE_OPTIONS, StrokeCapModes, NodeTypes, SocketTypes, PositionModes } from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import RotaryInput from "!/components/inputs/RotaryInput";

import CheckBox from "!/components/buttons/Checkbox";
import { TextInput } from "!/components/inputs/TextInput";
import useMarkers from "!/utility/useMarkers";
import { nodeIcons } from "../icons";

interface ISegmentNode extends INodeDefinition {
    inputs: {
        startX: Length;
        startY: Length;
        startRadius: Length;
        startTheta: number;

        endX: Length;
        endY: Length;
        endRadius: Length;
        endTheta: number;

        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        fillColor: Color;
        strokeMarkStart: NodeRenderer;
        strokeMarkEnd: NodeRenderer;

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
        startMode: PositionMode;
        endMode: PositionMode;

        startX: Length;
        startY: Length;
        startRadius: Length;
        startTheta: number;

        endX: Length;
        endY: Length;
        endRadius: Length;
        endTheta: number;

        strokeColor: Color;
        strokeWidth: Length;
        fillColor: Color;
        strokeDash: string;
        strokeCap: StrokeCapMode;
        strokeOffset: Length;
        strokeMarkAlign: boolean;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        positionMode: PositionMode;
        rotation: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<ISegmentNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [startX, setStartX] = nodeHooks.useValueState(nodeId, "startX");
    const [startY, setStartY] = nodeHooks.useValueState(nodeId, "startY");
    const [startRadius, setStartRadius] = nodeHooks.useValueState(nodeId, "startRadius");
    const [startTheta, setStartTheta] = nodeHooks.useValueState(nodeId, "startTheta");

    const [endX, setEndX] = nodeHooks.useValueState(nodeId, "endX");
    const [endY, setEndY] = nodeHooks.useValueState(nodeId, "endY");
    const [endRadius, setEndRadius] = nodeHooks.useValueState(nodeId, "endRadius");
    const [endTheta, setEndTheta] = nodeHooks.useValueState(nodeId, "endTheta");

    const [startMode, setStartMode] = nodeHooks.useValueState(nodeId, "startMode");
    const [endMode, setEndMode] = nodeHooks.useValueState(nodeId, "endMode");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");

    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
    const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

    const hasStartX = nodeHooks.useHasLink(nodeId, "startX");
    const hasStartY = nodeHooks.useHasLink(nodeId, "startY");
    const hasStartRadius = nodeHooks.useHasLink(nodeId, "startRadius");
    const hasStartTheta = nodeHooks.useHasLink(nodeId, "startTheta");
    const hasEndX = nodeHooks.useHasLink(nodeId, "endX");
    const hasEndY = nodeHooks.useHasLink(nodeId, "endY");
    const hasEndRadius = nodeHooks.useHasLink(nodeId, "endRadius");
    const hasEndTheta = nodeHooks.useHasLink(nodeId, "endTheta");

    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

    return (
        <BaseNode<ISegmentNode> nodeId={nodeId} helper={SegmentNodeHelper} hooks={nodeHooks}>
            <SocketOut<ISegmentNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />

            <BaseNode.Foldout panelId={"startPoint"} label={"Start Point"} nodeId={nodeId} inputs={"startX startY startTheta startRadius"} outputs={""} startOpen>
                <BaseNode.Input label={"Position Mode"}>
                    <ToggleList value={startMode} onSelect={setStartMode} options={POSITION_MODE_OPTIONS} />
                </BaseNode.Input>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startX"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"X Coordinate"}>
                        <LengthInput value={startX} onCommit={setStartX} disabled={hasStartX || startMode === PositionModes.POLAR} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startY"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Y Coordinate"}>
                        <LengthInput value={startY} onCommit={setStartY} disabled={hasStartY || startMode === PositionModes.POLAR} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startRadius"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Radius"}>
                        <LengthInput value={startRadius} onCommit={setStartRadius} disabled={hasStartRadius || startMode === PositionModes.CARTESIAN} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startTheta"} type={SocketTypes.ANGLE}>
                    <BaseNode.Input label={"θ Angle"}>
                        <RotaryInput value={startTheta} onValidValue={setStartTheta} disabled={hasStartTheta || startMode === PositionModes.CARTESIAN} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>

            <BaseNode.Foldout panelId={"endPoint"} label={"End Point"} nodeId={nodeId} inputs={"endX endY endTheta endRadius"} outputs={""} startOpen>
                <BaseNode.Input label={"Position Mode"}>
                    <ToggleList value={endMode} onSelect={setEndMode} options={POSITION_MODE_OPTIONS} />
                </BaseNode.Input>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endX"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"X Coordinate"}>
                        <LengthInput value={endX} onCommit={setEndX} disabled={hasEndX || endMode === PositionModes.POLAR} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endY"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Y Coordinate"}>
                        <LengthInput value={endY} onCommit={setEndY} disabled={hasEndY || endMode === PositionModes.POLAR} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endRadius"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Radius"}>
                        <LengthInput value={endRadius} onCommit={setEndRadius} disabled={hasEndRadius || endMode === PositionModes.CARTESIAN} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endTheta"} type={SocketTypes.ANGLE}>
                    <BaseNode.Input label={"θ Angle"}>
                        <RotaryInput value={endTheta} onValidValue={setEndTheta} disabled={hasEndTheta || endMode === PositionModes.CARTESIAN} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>

            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
                    Marker Start
                </SocketIn>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
                    Marker End
                </SocketIn>
                <CheckBox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
                    Align Markers
                </CheckBox>
                <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<ISegmentNode> nodeId={nodeId} hooks={nodeHooks} />
            <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"path"} nodeId={nodeId}>
                <SocketOut<ISegmentNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                    Conformal Path
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Pather = memo(({ nodeId, depth, globals, pathId, pathLength }: NodePatherProps) => {
    const startMode = nodeHooks.useValue(nodeId, "startMode");

    const startX = nodeHooks.useCoalesce(nodeId, "startX", "startX", globals);
    const startY = nodeHooks.useCoalesce(nodeId, "startY", "startY", globals);
    const startRadius = nodeHooks.useCoalesce(nodeId, "startRadius", "startRadius", globals);
    const startTheta = nodeHooks.useCoalesce(nodeId, "startTheta", "startTheta", globals);

    const endMode = nodeHooks.useValue(nodeId, "endMode");
    const endX = nodeHooks.useCoalesce(nodeId, "endX", "endX", globals);
    const endY = nodeHooks.useCoalesce(nodeId, "endY", "endY", globals);
    const endRadius = nodeHooks.useCoalesce(nodeId, "endRadius", "endRadius", globals);
    const endTheta = nodeHooks.useCoalesce(nodeId, "endTheta", "endTheta", globals);

    const positionMode = nodeHooks.useValue(nodeId, "positionMode");
    const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
    const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

    const x1 = useMemo(
        () => (startMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(startX) : MathHelper.lengthToPx(startRadius) * Math.cos(((startTheta - 90) * Math.PI) / 180)),
        [startMode, startRadius, startTheta, startX]
    );
    const y1 = useMemo(
        () => (startMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(startY) : MathHelper.lengthToPx(startRadius) * Math.sin(((startTheta - 90) * Math.PI) / 180)),
        [startMode, startRadius, startTheta, startY]
    );

    const x2 = useMemo(
        () => (endMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(endX) : MathHelper.lengthToPx(endRadius) * Math.cos(((endTheta - 90) * Math.PI) / 180)),
        [endMode, endRadius, endTheta, endX]
    );
    const y2 = useMemo(
        () => (endMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(endY) : MathHelper.lengthToPx(endRadius) * Math.sin(((endTheta - 90) * Math.PI) / 180)),
        [endMode, endRadius, endTheta, endY]
    );

    return (
        <path
            d={`M ${x1},${y1} L ${x2},${y2}`}
            transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}
            pathLength={pathLength}
            id={pathId}
        />
    );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
    const startMode = nodeHooks.useValue(nodeId, "startMode");

    const startX = nodeHooks.useCoalesce(nodeId, "startX", "startX", globals);
    const startY = nodeHooks.useCoalesce(nodeId, "startY", "startY", globals);
    const startRadius = nodeHooks.useCoalesce(nodeId, "startRadius", "startRadius", globals);
    const startTheta = nodeHooks.useCoalesce(nodeId, "startTheta", "startTheta", globals);

    const endMode = nodeHooks.useValue(nodeId, "endMode");
    const endX = nodeHooks.useCoalesce(nodeId, "endX", "endX", globals);
    const endY = nodeHooks.useCoalesce(nodeId, "endY", "endY", globals);
    const endRadius = nodeHooks.useCoalesce(nodeId, "endRadius", "endRadius", globals);
    const endTheta = nodeHooks.useCoalesce(nodeId, "endTheta", "endTheta", globals);

    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
    const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
    const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
    const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
    const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);

    const positionMode = nodeHooks.useValue(nodeId, "positionMode");
    const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
    const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

    const x1 = useMemo(
        () => (startMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(startX) : MathHelper.lengthToPx(startRadius) * Math.cos(((startTheta - 90) * Math.PI) / 180)),
        [startMode, startRadius, startTheta, startX]
    );
    const y1 = useMemo(
        () => (startMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(startY) : MathHelper.lengthToPx(startRadius) * Math.sin(((startTheta - 90) * Math.PI) / 180)),
        [startMode, startRadius, startTheta, startY]
    );

    const x2 = useMemo(
        () => (endMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(endX) : MathHelper.lengthToPx(endRadius) * Math.cos(((endTheta - 90) * Math.PI) / 180)),
        [endMode, endRadius, endTheta, endX]
    );
    const y2 = useMemo(
        () => (endMode === PositionModes.CARTESIAN ? MathHelper.lengthToPx(endY) : MathHelper.lengthToPx(endRadius) * Math.sin(((endTheta - 90) * Math.PI) / 180)),
        [endMode, endRadius, endTheta, endY]
    );

    const [Markers, mStartId, mMidId, mEndId] = useMarkers(nodeHooks, nodeId, globals, overrides, depth);

    return (
        <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
            <Markers />
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
                markerStart={mStartId}
                markerMid={mMidId}
                markerEnd={mEndId}
            >
                <path d={`M ${x1},${y1} L ${x2},${y2}`} vectorEffect={"non-scaling-stroke"} />
            </g>
        </g>
    );
});

const SegmentNodeHelper: INodeHelper<ISegmentNode> = {
    name: "Segment",
    buttonIcon: nodeIcons.segmentShape.buttonIcon,
    nodeIcon: nodeIcons.segmentShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_SEGMENT,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISegmentNode["outputs"]) => {
        switch (socket) {
            case "output":
                return Renderer;
            case "path":
                return Pather;
        }
    },
    initialize: () => ({
        startX: { value: 0, unit: "px" },
        startY: { value: 0, unit: "px" },
        endX: { value: 100, unit: "px" },
        endY: { value: 100, unit: "px" },

        startRadius: { value: 0, unit: "px" },
        startTheta: 0,
        endRadius: { value: 100, unit: "px" },
        endTheta: 180,

        startMode: PositionModes.CARTESIAN,
        endMode: PositionModes.CARTESIAN,

        strokeWidth: { value: 1, unit: "px" },
        strokeDash: "",
        strokeOffset: { value: 0, unit: "px" },
        strokeCap: StrokeCapModes.BUTT,
        strokeColor: { r: 0, g: 0, b: 0, a: 1 },
        fillColor: null as Color,
        strokeMarkAlign: true,
        thetaStart: 0,
        thetaEnd: 90,

        positionX: { value: 0, unit: "px" },
        positionY: { value: 0, unit: "px" },
        positionRadius: { value: 0, unit: "px" },
        positionTheta: 0,
        positionMode: PositionModes.CARTESIAN,
        rotation: 0,
    }),
    controls: Controls,
};

export default SegmentNodeHelper;
