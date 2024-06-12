import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, GraphGlobals, Interpolator, NodePather } from "../types";
import {
    PositionMode,
    StrokeJoinMode,
    STROKEJOIN_MODE_OPTIONS,
    SCRIBE_MODE_OPTIONS,
    ScribeMode,
    RadialMode,
    RADIAL_MODE_OPTIONS,
    STROKECAP_MODE_OPTIONS,
    StrokeCapMode,
    ScribeModes,
    RadialModes,
    NodeTypes,
    SocketTypes,
    PositionModes,
    StrokeCapModes,
    StrokeJoinModes,
} from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import { TextInput } from "!/components/inputs/TextInput";
import { nodeIcons } from "../icons";
import SliderInput from "!/components/inputs/SliderInput";

interface IStarNode extends INodeDefinition {
    inputs: {
        pointCount: number;
        majorRadius: Length;
        minorRadius: Length;
        radius: Length;
        deviation: Length;
        thetaCurve: Interpolator;
        strokeWidth: Length;
        strokeOffset: Length;
        strokeColor: Color;
        fillColor: Color;

        smoothing: number;
        cusping: number;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        rotation: number;
    };
    outputs: {
        output: NodeRenderer;
        path: NodePather;

        cInscribe: Length;
        cCircumscribe: Length;
        cMiddle: Length;

        oInscribe: Length;
        oCircumscribe: Length;
        oMiddle: Length;

        iInscribe: Length;
        iCircumscribe: Length;
        iMiddle: Length;
    };
    values: {
        radius: Length;
        deviation: Length;
        radialMode: RadialMode;
        minorRadius: Length;
        majorRadius: Length;
        pointCount: number;
        rScribeMode: ScribeMode;
        majorScribeMode: ScribeMode;
        minorScribeMode: ScribeMode;

        smoothing: number;
        cusping: number;

        strokeWidth: Length;
        strokeJoin: StrokeJoinMode;
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
        rotation: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IStarNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [deviation, setDeviation] = nodeHooks.useValueState(nodeId, "deviation");
    const [radialMode, setRadialMode] = nodeHooks.useValueState(nodeId, "radialMode");
    const [minorRadius, setMinorRadius] = nodeHooks.useValueState(nodeId, "minorRadius");
    const [majorRadius, setMajorRadius] = nodeHooks.useValueState(nodeId, "majorRadius");
    const [rScribeMode, setRScribeMode] = nodeHooks.useValueState(nodeId, "rScribeMode");
    const [majorScribeMode, setMajorScribeMode] = nodeHooks.useValueState(nodeId, "majorScribeMode");
    const [minorScribeMode, setMinorScribeMode] = nodeHooks.useValueState(nodeId, "minorScribeMode");
    const [smoothing, setSmoothing] = nodeHooks.useValueState(nodeId, "smoothing");
    const [cusping, setCusping] = nodeHooks.useValueState(nodeId, "cusping");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

    const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
    const hasMinorRadius = nodeHooks.useHasLink(nodeId, "minorRadius");
    const hasMajorRadius = nodeHooks.useHasLink(nodeId, "majorRadius");
    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasDeviation = nodeHooks.useHasLink(nodeId, "deviation");
    const hasCusping = nodeHooks.useHasLink(nodeId, "cusping");
    const hasSmoothing = nodeHooks.useHasLink(nodeId, "smoothing");

    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

    return (
        <BaseNode<IStarNode> nodeId={nodeId} helper={StarNodeHelper} hooks={nodeHooks}>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
                <BaseNode.Input label={"Points"}>
                    <SliderInput value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
                </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Radial Mode"}>
                <ToggleList value={radialMode} onSelect={setRadialMode} options={RADIAL_MODE_OPTIONS} />
            </BaseNode.Input>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"majorRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Major Radius"}>
                    <LengthInput value={majorRadius} onValidValue={setMajorRadius} disabled={hasMajorRadius || radialMode === RadialModes.DEVIATION} />
                    <NativeDropdown value={majorScribeMode} onSelect={setMajorScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={radialMode === RadialModes.DEVIATION} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"minorRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Minor Radius"}>
                    <LengthInput value={minorRadius} onValidValue={setMinorRadius} disabled={hasMinorRadius || radialMode === RadialModes.DEVIATION} />
                    <NativeDropdown value={minorScribeMode} onSelect={setMinorScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={radialMode === RadialModes.DEVIATION} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === RadialModes.MAJORMINOR} />
                    <NativeDropdown value={rScribeMode} onSelect={setRScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={radialMode === RadialModes.MAJORMINOR} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"deviation"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Deviation"}>
                    <LengthInput value={deviation} onValidValue={setDeviation} disabled={hasDeviation || radialMode === RadialModes.MAJORMINOR} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"smoothing"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Smoothing"}>
                    <SliderInput value={smoothing} min={0} max={1} onValidValue={setSmoothing} disabled={hasSmoothing} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"cusping"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Cusping"}>
                    <SliderInput value={cusping} min={0} max={1} onValidValue={setCusping} disabled={hasCusping} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
                θ Distribution
            </SocketIn>

            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
                <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Stroke Color"}>
                        <HexColorInput nullable alpha value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
                    </BaseNode.Input>
                </SocketIn>
                <BaseNode.Input label={"Stroke Join"}>
                    <ToggleList value={strokeJoin} onSelect={setStrokeJoin} options={STROKEJOIN_MODE_OPTIONS} />
                </BaseNode.Input>
                <BaseNode.Input label={"Stroke Cap"}>
                    <ToggleList value={strokeCap} onSelect={setStrokeCap} options={STROKECAP_MODE_OPTIONS} />
                </BaseNode.Input>
                <BaseNode.Input label={"Stroke Dash"}>
                    <TextInput value={strokeDash} onCommit={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
                </BaseNode.Input>
                <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IStarNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<IStarNode> nodeId={nodeId} hooks={nodeHooks} />
            <BaseNode.Foldout
                panelId={"moreOutputs"}
                label={"Additional Outputs"}
                inputs={""}
                outputs={"path cInscribe cCircumscribe cMiddle oInscribe oCircumscribe oMiddle iInscribe iCircumscribe iMiddle"}
                nodeId={nodeId}
            >
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                    Conformal Path
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"cInscribe"} type={SocketTypes.LENGTH}>
                    Inscribe Center
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"cCircumscribe"} type={SocketTypes.LENGTH}>
                    Circumscribe Center
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"cMiddle"} type={SocketTypes.LENGTH}>
                    Middle Center
                </SocketOut>

                <SocketOut<IStarNode> nodeId={nodeId} socketId={"oInscribe"} type={SocketTypes.LENGTH}>
                    Inscribe Major
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"oCircumscribe"} type={SocketTypes.LENGTH}>
                    Circumscribe Major
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"oMiddle"} type={SocketTypes.LENGTH}>
                    Middle Major
                </SocketOut>

                <SocketOut<IStarNode> nodeId={nodeId} socketId={"iInscribe"} type={SocketTypes.LENGTH}>
                    Inscribe Minor
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"iCircumscribe"} type={SocketTypes.LENGTH}>
                    Circumscribe Minor
                </SocketOut>
                <SocketOut<IStarNode> nodeId={nodeId} socketId={"iMiddle"} type={SocketTypes.LENGTH}>
                    Middle Minor
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const getPath = (graph: IArcaneGraph, nodeId: string, globals: GraphGlobals) => {
    const radialMode = nodeMethods.getValue(graph, nodeId, "radialMode");
    const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");
    const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
    const deviation = nodeMethods.coalesce(graph, nodeId, "deviation", "deviation", globals);
    const minorRadius = nodeMethods.coalesce(graph, nodeId, "minorRadius", "minorRadius", globals);
    const majorRadius = nodeMethods.coalesce(graph, nodeId, "majorRadius", "majorRadius", globals);
    const minorScribeMode = nodeMethods.getValue(graph, nodeId, "minorScribeMode");
    const majorScribeMode = nodeMethods.getValue(graph, nodeId, "majorScribeMode");
    const pointCount = Math.min(24, Math.max(3, nodeMethods.coalesce(graph, nodeId, "pointCount", "pointCount", globals)));

    const positionMode = nodeMethods.getValue(graph, nodeId, "positionMode");
    const positionX = nodeMethods.coalesce(graph, nodeId, "positionX", "positionX", globals);
    const positionY = nodeMethods.coalesce(graph, nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeMethods.coalesce(graph, nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeMethods.coalesce(graph, nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeMethods.coalesce(graph, nodeId, "rotation", "rotation", globals);
    const thetaCurve = nodeMethods.getInput(graph, nodeId, "thetaCurve", globals);

    const smoothing = nodeMethods.coalesce(graph, nodeId, "smoothing", "smoothing", globals);
    const cusping = nodeMethods.coalesce(graph, nodeId, "cusping", "cusping", globals);

    const rI =
        radialMode === RadialModes.MAJORMINOR
            ? getTrueRadius(MathHelper.lengthToPx(minorRadius), minorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation), rScribeMode, pointCount);
    const rO =
        radialMode === RadialModes.MAJORMINOR
            ? getTrueRadius(MathHelper.lengthToPx(majorRadius), majorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation), rScribeMode, pointCount);

    const d = lodash
        .range(pointCount)
        .map((n, i, ary) => {
            const ang = MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

            const nextAng = MathHelper.lerp(MathHelper.delerp(i + 1, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

            const th = Math.abs(nextAng - ang) / 2;
            // const rad = i % 2 === 0 ? rO : rI;
            // return `${rad * Math.cos(MathHelper.deg2rad(coeff - 90))},${rad * Math.sin(MathHelper.deg2rad(coeff - 90))}`;

            // const ang = (360 / pointCount) * n;
            // const nextAng = (360 / pointCount) * (n + 1);

            const sTan = rO * Math.tan(MathHelper.deg2rad(th));
            const eTan = rI * Math.tan(MathHelper.deg2rad(th));
            const outerTanR = Math.sqrt(sTan * sTan + rO * rO);
            const innerTanR = Math.sqrt(eTan * eTan + rI * rI);

            const endX = rO * Math.cos(MathHelper.deg2rad(nextAng - 90));
            const endY = rO * Math.sin(MathHelper.deg2rad(nextAng - 90));

            const midX = rI * Math.cos(MathHelper.deg2rad((ang + nextAng) / 2 - 90));
            const midY = rI * Math.sin(MathHelper.deg2rad((ang + nextAng) / 2 - 90));

            const startX = rO * Math.cos(MathHelper.deg2rad(ang - 90));
            const startY = rO * Math.sin(MathHelper.deg2rad(ang - 90));

            // const rTO = rO * Math.tan(MathHelper.deg2rad(th));
            // const rTI = rI * Math.cos(MathHelper.deg2rad(ang + th));
            const startTangentX = MathHelper.lerp(cusping, startX, outerTanR * Math.cos(MathHelper.deg2rad(ang + th - 90)));
            const startTangentY = MathHelper.lerp(cusping, startY, outerTanR * Math.sin(MathHelper.deg2rad(ang + th - 90)));

            const midInX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(ang - 90)));
            const midInY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(ang - 90)));
            const midOutX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(nextAng - 90)));
            const midOutY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(nextAng - 90)));

            const endTangentX = MathHelper.lerp(cusping, endX, outerTanR * Math.cos(MathHelper.deg2rad(nextAng - th - 90)));
            const endTangentY = MathHelper.lerp(cusping, endY, outerTanR * Math.sin(MathHelper.deg2rad(nextAng - th - 90)));

            return `${
                i === 0 ? `M ${startX}, ${startY}` : ""
            } C ${startTangentX},${startTangentY} ${midInX},${midInY} ${midX},${midY} C ${midOutX},${midOutY} ${endTangentX},${endTangentY} ${endX},${endY} ${i === ary.length - 1 ? "Z" : ""}`;
        })
        .join(" ");

    return {
        transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`,
        d,
    };
};

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
    const radialMode = nodeHooks.useValue(nodeId, "radialMode");
    const rScribeMode = nodeHooks.useValue(nodeId, "rScribeMode");
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const deviation = nodeHooks.useCoalesce(nodeId, "deviation", "deviation", globals);
    const minorRadius = nodeHooks.useCoalesce(nodeId, "minorRadius", "minorRadius", globals);
    const majorRadius = nodeHooks.useCoalesce(nodeId, "majorRadius", "majorRadius", globals);
    const minorScribeMode = nodeHooks.useValue(nodeId, "minorScribeMode");
    const majorScribeMode = nodeHooks.useValue(nodeId, "majorScribeMode");
    const pointCount = Math.min(24, Math.max(3, nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals)));

    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");
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
    const thetaCurve = nodeHooks.useInput(nodeId, "thetaCurve", globals);

    const smoothing = nodeHooks.useCoalesce(nodeId, "smoothing", "smoothing", globals);
    const cusping = nodeHooks.useCoalesce(nodeId, "cusping", "cusping", globals);

    const points = useMemo(() => {
        const rI =
            radialMode === RadialModes.MAJORMINOR
                ? getTrueRadius(MathHelper.lengthToPx(minorRadius), minorScribeMode, pointCount)
                : getTrueRadius(MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation), rScribeMode, pointCount);
        const rO =
            radialMode === RadialModes.MAJORMINOR
                ? getTrueRadius(MathHelper.lengthToPx(majorRadius), majorScribeMode, pointCount)
                : getTrueRadius(MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation), rScribeMode, pointCount);

        //const th = 360 / (pointCount * 2);

        return lodash
            .range(pointCount)
            .map((n, i, ary) => {
                const ang = MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

                const nextAng = MathHelper.lerp(MathHelper.delerp(i + 1, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

                const th = Math.abs(nextAng - ang) / 2;
                // const rad = i % 2 === 0 ? rO : rI;
                // return `${rad * Math.cos(MathHelper.deg2rad(coeff - 90))},${rad * Math.sin(MathHelper.deg2rad(coeff - 90))}`;

                // const ang = (360 / pointCount) * n;
                // const nextAng = (360 / pointCount) * (n + 1);

                const sTan = rO * Math.tan(MathHelper.deg2rad(th));
                const eTan = rI * Math.tan(MathHelper.deg2rad(th));
                const outerTanR = Math.sqrt(sTan * sTan + rO * rO);
                const innerTanR = Math.sqrt(eTan * eTan + rI * rI);

                const endX = rO * Math.cos(MathHelper.deg2rad(nextAng - 90));
                const endY = rO * Math.sin(MathHelper.deg2rad(nextAng - 90));

                const midX = rI * Math.cos(MathHelper.deg2rad((ang + nextAng) / 2 - 90));
                const midY = rI * Math.sin(MathHelper.deg2rad((ang + nextAng) / 2 - 90));

                const startX = rO * Math.cos(MathHelper.deg2rad(ang - 90));
                const startY = rO * Math.sin(MathHelper.deg2rad(ang - 90));

                // const rTO = rO * Math.tan(MathHelper.deg2rad(th));
                // const rTI = rI * Math.cos(MathHelper.deg2rad(ang + th));
                const startTangentX = MathHelper.lerp(cusping, startX, outerTanR * Math.cos(MathHelper.deg2rad(ang + th - 90)));
                const startTangentY = MathHelper.lerp(cusping, startY, outerTanR * Math.sin(MathHelper.deg2rad(ang + th - 90)));

                const midInX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(ang - 90)));
                const midInY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(ang - 90)));
                const midOutX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(nextAng - 90)));
                const midOutY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(nextAng - 90)));

                const endTangentX = MathHelper.lerp(cusping, endX, outerTanR * Math.cos(MathHelper.deg2rad(nextAng - th - 90)));
                const endTangentY = MathHelper.lerp(cusping, endY, outerTanR * Math.sin(MathHelper.deg2rad(nextAng - th - 90)));

                return `${
                    i === 0 ? `M ${startX}, ${startY}` : ""
                } C ${startTangentX},${startTangentY} ${midInX},${midInY} ${midX},${midY} C ${midOutX},${midOutY} ${endTangentX},${endTangentY} ${endX},${endY} ${i === ary.length - 1 ? "Z" : ""}`;
            })
            .join(" ");
    }, [minorRadius, smoothing, majorRadius, cusping, pointCount, radialMode, deviation, radius, rScribeMode, minorScribeMode, majorScribeMode, thetaCurve]);

    return (
        <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
            <g
                stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
                strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
                strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
                strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
                strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
                strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
                    .map(MathHelper.lengthToPx)
                    .join(" ")}
            >
                <path d={points} vectorEffect={"non-scaling-stroke"} />
            </g>
        </g>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IStarNode>();

const StarNodeHelper: INodeHelper<IStarNode> = {
    name: "Star",
    buttonIcon: nodeIcons.starShape.buttonIcon,
    nodeIcon: nodeIcons.starShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_STAR,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IStarNode["outputs"], globals: GraphGlobals) => {
        if (socket === "output") {
            return Renderer;
        }
        if (socket === "path") {
            return getPath(graph, nodeId, globals);
        }

        const deviation = nodeMethods.getValue(graph, nodeId, "deviation");
        const radialMode = nodeMethods.getValue(graph, nodeId, "radialMode");
        const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
        const minorRadius = nodeMethods.coalesce(graph, nodeId, "minorRadius", "minorRadius", globals);
        const majorRadius = nodeMethods.coalesce(graph, nodeId, "majorRadius", "majorRadius", globals);

        const minorScribeMode = nodeMethods.getValue(graph, nodeId, "minorScribeMode");
        const majorScribeMode = nodeMethods.getValue(graph, nodeId, "majorScribeMode");
        const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");

        const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");

        const tI =
            radialMode === RadialModes.MAJORMINOR
                ? getTrueRadius(MathHelper.lengthToPx(minorRadius), minorScribeMode, pointCount)
                : getTrueRadius(MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation), rScribeMode, pointCount);
        const tO =
            radialMode === RadialModes.MAJORMINOR
                ? getTrueRadius(MathHelper.lengthToPx(majorRadius), majorScribeMode, pointCount)
                : getTrueRadius(MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation), rScribeMode, pointCount);

        const tR = (tI + tO) / 2;

        switch (socket) {
            case "cInscribe":
                return MathHelper.pxToLength(getPassedRadius(tR, ScribeModes.INSCRIBE, pointCount));
            case "cCircumscribe":
                return MathHelper.pxToLength(getPassedRadius(tR, ScribeModes.CIRCUMSCRIBE, pointCount));
            case "cMiddle":
                return MathHelper.pxToLength(getPassedRadius(tR, ScribeModes.MIDDLE, pointCount));
            case "oInscribe":
                return MathHelper.pxToLength(getPassedRadius(tO, ScribeModes.INSCRIBE, pointCount));
            case "oCircumscribe":
                return MathHelper.pxToLength(getPassedRadius(tO, ScribeModes.CIRCUMSCRIBE, pointCount));
            case "oMiddle":
                return MathHelper.pxToLength(getPassedRadius(tO, ScribeModes.MIDDLE, pointCount));
            case "iInscribe":
                return MathHelper.pxToLength(getPassedRadius(tI, ScribeModes.INSCRIBE, pointCount));
            case "iCircumscribe":
                return MathHelper.pxToLength(getPassedRadius(tI, ScribeModes.CIRCUMSCRIBE, pointCount));
            case "iMiddle":
                return MathHelper.pxToLength(getPassedRadius(tI, ScribeModes.MIDDLE, pointCount));
        }
    },
    initialize: () => ({
        radius: { value: 110, unit: "px" },
        deviation: { value: 50, unit: "px" },
        radialMode: RadialModes.MAJORMINOR,
        pointCount: 5,
        minorRadius: { value: 60, unit: "px" },
        majorRadius: { value: 160, unit: "px" },
        smoothing: 0,
        cusping: 0,
        rScribeMode: ScribeModes.INSCRIBE,
        minorScribeMode: ScribeModes.INSCRIBE,
        majorScribeMode: ScribeModes.INSCRIBE,

        strokeWidth: { value: 1, unit: "px" },
        strokeJoin: StrokeJoinModes.MITER,
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

export default StarNodeHelper;

const getTrueRadius = (r: number, scribe: ScribeMode, sides: number) => {
    switch (scribe) {
        case ScribeModes.MIDDLE:
            return (r + r / Math.cos(Math.PI / sides)) / 2;
        case ScribeModes.CIRCUMSCRIBE:
            return r / Math.cos(Math.PI / sides);
        case ScribeModes.INSCRIBE:
            return r;
    }
};

const getPassedRadius = (r: number, desired: ScribeMode, sides: number) => {
    switch (desired) {
        case ScribeModes.MIDDLE:
            return (r + r * Math.cos(Math.PI / sides)) / 2;
        case ScribeModes.CIRCUMSCRIBE:
            return r;
        case ScribeModes.INSCRIBE:
            return r * Math.cos(Math.PI / sides);
    }
};
