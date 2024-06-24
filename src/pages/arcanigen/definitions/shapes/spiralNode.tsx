import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodePather, GraphGlobals } from "../types";
import { PositionMode, StrokeCapMode, STROKECAP_MODE_OPTIONS, RadialMode, RADIAL_MODE_OPTIONS, RadialModes, StrokeCapModes, NodeTypes, SocketTypes, PositionModes } from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import RotaryInput from "!/components/inputs/RotaryInput";
import lodash from "lodash";
import CheckBox from "!/components/buttons/Checkbox";
import { TextInput } from "!/components/inputs/TextInput";
import useMarkers from "!/utility/useMarkers";
import { nodeIcons } from "../icons";

interface ISpiralNode extends INodeDefinition {
    inputs: {
        radius: Length;
        deviation: Length;
        minorRadius: Length;
        majorRadius: Length;
        thetaStart: number;
        thetaEnd: number;

        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        fillColor: Color;
        strokeMarkStart: NodeRenderer;
        strokeMarkMid: NodeRenderer;
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
        radialMode: RadialMode;
        radius: Length;
        deviation: Length;
        minorRadius: Length;
        majorRadius: Length;
        thetaStart: number;
        thetaEnd: number;

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

const nodeHooks = ArcaneGraph.nodeHooks<ISpiralNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [deviation, setDeviation] = nodeHooks.useValueState(nodeId, "deviation");
    const [radialMode, setRadialMode] = nodeHooks.useValueState(nodeId, "radialMode");
    const [minorRadius, setMinorRadius] = nodeHooks.useValueState(nodeId, "minorRadius");
    const [majorRadius, setMajorRadius] = nodeHooks.useValueState(nodeId, "majorRadius");

    const [thetaStart, setThetaStart] = nodeHooks.useValueState(nodeId, "thetaStart");
    const [thetaEnd, setThetaEnd] = nodeHooks.useValueState(nodeId, "thetaEnd");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

    const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

    const hasThetaStart = nodeHooks.useHasLink(nodeId, "thetaStart");
    const hasThetaEnd = nodeHooks.useHasLink(nodeId, "thetaEnd");

    const hasMinorRadius = nodeHooks.useHasLink(nodeId, "minorRadius");
    const hasMajorRadius = nodeHooks.useHasLink(nodeId, "majorRadius");
    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasDeviation = nodeHooks.useHasLink(nodeId, "deviation");

    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

    return (
        <BaseNode<ISpiralNode> nodeId={nodeId} helper={SpiralNodeHelper} hooks={nodeHooks}>
            <SocketOut<ISpiralNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <BaseNode.Input label={"Radial Mode"}>
                <ToggleList value={radialMode} onSelect={setRadialMode} options={RADIAL_MODE_OPTIONS} />
            </BaseNode.Input>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"majorRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Major Radius"}>
                    <LengthInput value={majorRadius} onValidValue={setMajorRadius} disabled={hasMajorRadius || radialMode === RadialModes.DEVIATION} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"minorRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Minor Radius"}>
                    <LengthInput value={minorRadius} onValidValue={setMinorRadius} disabled={hasMinorRadius || radialMode === RadialModes.DEVIATION} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === RadialModes.MAJORMINOR} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"deviation"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Deviation"}>
                    <LengthInput value={deviation} onValidValue={setDeviation} disabled={hasDeviation || radialMode === RadialModes.MAJORMINOR} />
                </BaseNode.Input>
            </SocketIn>
            <hr />
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
                <BaseNode.Input label={"Start θ"}>
                    <RotaryInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart} wrap />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
                <BaseNode.Input label={"End θ"}>
                    <RotaryInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd} wrap />
                </BaseNode.Input>
            </SocketIn>
            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
                    Marker Start
                </SocketIn>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeMarkMid"} type={SocketTypes.SHAPE}>
                    Marker Mid
                </SocketIn>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
                    Marker End
                </SocketIn>
                <CheckBox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
                    Align Markers
                </CheckBox>
                <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<ISpiralNode> nodeId={nodeId} hooks={nodeHooks} />
            <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"path"} nodeId={nodeId}>
                <SocketOut<ISpiralNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                    Conformal Path
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<ISpiralNode>();

const getPath = (graph: IArcaneGraph, nodeId: string, globals: GraphGlobals) => {
    const radialMode = nodeMethods.getValue(graph, nodeId, "radialMode");
    const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
    const deviation = nodeMethods.coalesce(graph, nodeId, "deviation", "deviation", globals);
    const minorRadius = nodeMethods.coalesce(graph, nodeId, "minorRadius", "minorRadius", globals);
    const majorRadius = nodeMethods.coalesce(graph, nodeId, "majorRadius", "majorRadius", globals);
    const thetaStart = nodeMethods.coalesce(graph, nodeId, "thetaStart", "thetaStart", globals);
    const thetaEnd = nodeMethods.coalesce(graph, nodeId, "thetaEnd", "thetaEnd", globals);
    const positionMode = nodeMethods.getValue(graph, nodeId, "positionMode");
    const positionX = nodeMethods.coalesce(graph, nodeId, "positionX", "positionX", globals);
    const positionY = nodeMethods.coalesce(graph, nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeMethods.coalesce(graph, nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeMethods.coalesce(graph, nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeMethods.coalesce(graph, nodeId, "rotation", "rotation", globals);

    const rI = radialMode === RadialModes.MAJORMINOR ? MathHelper.lengthToPx(minorRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation) / 2;
    const rO = radialMode === RadialModes.MAJORMINOR ? MathHelper.lengthToPx(majorRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation) / 2;

    const c = 2 + Math.floor(Math.abs(thetaEnd - thetaStart) / 10);
    const pathD = lodash
        .range(c)
        .map((n) => {
            const coeff = MathHelper.delerp(n, 0, c - 1);
            const rad = MathHelper.lerp(coeff, rI, rO);
            const ang = MathHelper.lerp(coeff, thetaStart, thetaEnd);

            const x = rad * Math.cos(((ang - 90) * Math.PI) / 180);
            const y = rad * Math.sin(((ang - 90) * Math.PI) / 180);

            return [x, y];
        })
        .reduce((acc, each, i, ary) => {
            return i === 0 ? `M ${each[0]},${each[1]}` : `${acc} ${bezierCommand(each, i, ary)}`;
        }, "");

    return {
        d: pathD,
        transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`,
    };
};

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
    const radialMode = nodeHooks.useValue(nodeId, "radialMode");
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const deviation = nodeHooks.useCoalesce(nodeId, "deviation", "deviation", globals);
    const minorRadius = nodeHooks.useCoalesce(nodeId, "minorRadius", "minorRadius", globals);
    const majorRadius = nodeHooks.useCoalesce(nodeId, "majorRadius", "majorRadius", globals);

    const thetaStart = nodeHooks.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
    const thetaEnd = nodeHooks.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
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

    const rI = radialMode === RadialModes.MAJORMINOR ? MathHelper.lengthToPx(minorRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation) / 2;
    const rO = radialMode === RadialModes.MAJORMINOR ? MathHelper.lengthToPx(majorRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation) / 2;

    const pathD = useMemo(() => {
        const c = 2 + Math.floor(Math.abs(thetaEnd - thetaStart) / 10);
        return lodash
            .range(c)
            .map((n) => {
                const coeff = MathHelper.delerp(n, 0, c - 1);
                const rad = MathHelper.lerp(coeff, rI, rO);
                const ang = MathHelper.lerp(coeff, thetaStart, thetaEnd);

                const x = rad * Math.cos(((ang - 90) * Math.PI) / 180);
                const y = rad * Math.sin(((ang - 90) * Math.PI) / 180);

                return [x, y];
            })
            .reduce((acc, each, i, ary) => {
                return i === 0 ? `M ${each[0]},${each[1]}` : `${acc} ${bezierCommand(each, i, ary)}`;
            }, "");
    }, [rI, rO, thetaEnd, thetaStart]);

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
                <path d={pathD} vectorEffect={"non-scaling-stroke"} />
            </g>
        </g>
    );
});

const SpiralNodeHelper: INodeHelper<ISpiralNode> = {
    name: "Spiral",
    buttonIcon: nodeIcons.spiralShape.buttonIcon,
    nodeIcon: nodeIcons.spiralShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_SPIRAL,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISpiralNode["outputs"], globals: GraphGlobals) => {
        switch (socket) {
            case "output":
                return Renderer;
            case "path":
                return getPath(graph, nodeId, globals);
        }
    },
    initialize: () => ({
        radius: { value: 150, unit: "px" },
        minorRadius: { value: 120, unit: "px" },
        majorRadius: { value: 180, unit: "px" },
        deviation: { value: 20, unit: "px" },
        radialMode: RadialModes.MAJORMINOR,
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

export default SpiralNodeHelper;

const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse: boolean = false) => {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;
    // The smoothing ratio
    const smoothing = 0.2;
    // Properties of the opposed-line
    const o = line(p, n);
    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
    // start control point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    // end control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};
