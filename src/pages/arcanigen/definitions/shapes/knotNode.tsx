import { memo, useEffect, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, Interpolator } from "../types";
import {
    PositionMode,
    ScribeMode,
    SCRIBE_MODE_OPTIONS,
    StrokeJoinMode,
    STROKEJOIN_MODE_OPTIONS,
    ExpandMode,
    SpanMode,
    SpreadAlignMode,
    EXPAND_MODE_OPTIONS,
    SPAN_MODE_OPTIONS,
    SPREAD_ALIGN_MODE_OPTIONS,
    STROKECAP_MODE_OPTIONS,
    StrokeCapMode,
    CrossScribeModes,
    ScribeModes,
    CrossScribeMode,
    SpanModes,
    SpreadAlignModes,
    ExpandModes,
    StrokeCapModes,
    NodeTypes,
    SocketTypes,
    PositionModes,
    StrokeJoinModes,
} from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import { TextInput } from "!/components/inputs/TextInput";
import { nodeIcons } from "../icons";
import SliderInput from "!/components/inputs/SliderInput";

interface IKnotNode extends INodeDefinition {
    inputs: {
        pointCount: number;
        skipCount: number;
        radius: Length;
        spread: Length;
        innerRadius: Length;
        outerRadius: Length;
        thetaCurve: Interpolator;
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
        rTangents: Length;
        rPoints: Length;
        rMiddle: Length;
    };
    values: {
        spanMode: SpanMode;
        radius: Length;
        spread: Length;
        spreadAlignMode: SpreadAlignMode;
        expandMode: ExpandMode;
        innerRadius: Length;
        outerRadius: Length;

        strokeWidth: Length;
        strokeJoin: StrokeJoinMode;
        strokeDash: string;
        strokeCap: StrokeCapMode;
        strokeOffset: Length;
        pointCount: number;
        skipCount: number;
        rScribeMode: ScribeMode;
        iScribeMode: ScribeMode;
        oScribeMode: ScribeMode;
        strokeColor: Color;
        fillColor: Color;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        positionMode: PositionMode;
        rotation: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IKnotNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [spread, setSpread] = nodeHooks.useValueState(nodeId, "spread");
    const [spreadAlignMode, setSpreadAlignMode] = nodeHooks.useValueState(nodeId, "spreadAlignMode");
    const [expandMode, setExpandMode] = nodeHooks.useValueState(nodeId, "expandMode");
    const [spanMode, setSpanMode] = nodeHooks.useValueState(nodeId, "spanMode");
    const [innerRadius, setInnerRadius] = nodeHooks.useValueState(nodeId, "innerRadius");
    const [outerRadius, setOuterRadius] = nodeHooks.useValueState(nodeId, "outerRadius");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
    const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
    const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
    const [skipCount, setSkipCount] = nodeHooks.useValueState(nodeId, "skipCount");
    const [rScribeMode, setRScribeMode] = nodeHooks.useValueState(nodeId, "rScribeMode");
    const [iScribeMode, setIScribeMode] = nodeHooks.useValueState(nodeId, "iScribeMode");
    const [oScribeMode, setOScribeMode] = nodeHooks.useValueState(nodeId, "oScribeMode");

    const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
    const hasSkipCount = nodeHooks.useHasLink(nodeId, "skipCount");

    const hasInnerRadius = nodeHooks.useHasLink(nodeId, "innerRadius");
    const hasOuterRadius = nodeHooks.useHasLink(nodeId, "outerRadius");
    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasSpread = nodeHooks.useHasLink(nodeId, "spread");

    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");

    useEffect(() => {
        setSkipCount((p) => {
            const n = Math.ceil(pointCount / 2) - 2;
            if (n <= 0) {
                return 0;
            }
            if (p > n) {
                return n;
            }
            return p;
        });
    }, [pointCount, setSkipCount]);

    return (
        <BaseNode<IKnotNode> nodeId={nodeId} helper={KnotNodeHelper} hooks={nodeHooks}>
            <SocketOut<IKnotNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
                <BaseNode.Input label={"Points"}>
                    <SliderInput value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"skipCount"} type={SocketTypes.INTEGER}>
                <BaseNode.Input label={"Skip Count"}>
                    <SliderInput value={skipCount} onValidValue={setSkipCount} min={0} max={Math.ceil(pointCount / 2) - 2} step={1} disabled={Math.ceil(pointCount / 2) - 2 <= 0 || hasSkipCount} />
                </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Span Mode"}>
                <ToggleList value={spanMode} onSelect={setSpanMode} options={SPAN_MODE_OPTIONS} />
            </BaseNode.Input>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Outer Radius"}>
                    <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || spanMode === SpanModes.SPREAD} />
                    <NativeDropdown value={oScribeMode} onSelect={setOScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.SPREAD} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Inner Radius"}>
                    <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || spanMode === SpanModes.SPREAD} />
                    <NativeDropdown value={iScribeMode} onSelect={setIScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.SPREAD} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || spanMode === SpanModes.INOUT} />
                    <NativeDropdown value={rScribeMode} onSelect={setRScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Spread"}>
                    <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || spanMode === SpanModes.INOUT} />
                </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Spread Align Mode"}>
                <ToggleList value={spreadAlignMode} onSelect={setSpreadAlignMode} options={SPREAD_ALIGN_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
            </BaseNode.Input>
            <BaseNode.Input label={"Expand Mode"}>
                <ToggleList value={expandMode} onSelect={setExpandMode} options={EXPAND_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
            </BaseNode.Input>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
                θ Distribution
            </SocketIn>

            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
                <SocketIn<IKnotNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IKnotNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
                <SocketIn<IKnotNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IKnotNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
                    <BaseNode.Input label={"Fill Color"}>
                        <HexColorInput nullable alpha value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
                    </BaseNode.Input>
                </SocketIn>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<IKnotNode> nodeId={nodeId} hooks={nodeHooks} />
            <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"rTangents rPoints rMiddle"} nodeId={nodeId}>
                <SocketOut<IKnotNode> nodeId={nodeId} socketId={"rTangents"} type={SocketTypes.LENGTH}>
                    Tangents Radius
                </SocketOut>
                <SocketOut<IKnotNode> nodeId={nodeId} socketId={"rPoints"} type={SocketTypes.LENGTH}>
                    Points Radius
                </SocketOut>
                <SocketOut<IKnotNode> nodeId={nodeId} socketId={"rMiddle"} type={SocketTypes.LENGTH}>
                    Middle Radius
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
    const spanMode = nodeHooks.useValue(nodeId, "spanMode");
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const spread = nodeHooks.useCoalesce(nodeId, "spread", "spread", globals);
    const innerRadius = nodeHooks.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
    const outerRadius = nodeHooks.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);
    const spreadAlignMode = nodeHooks.useValue(nodeId, "spreadAlignMode");
    const expandMode = nodeHooks.useValue(nodeId, "expandMode");

    const pointCount = nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals);
    const rScribeMode = nodeHooks.useValue(nodeId, "rScribeMode");
    const iScribeMode = nodeHooks.useValue(nodeId, "iScribeMode");
    const oScribeMode = nodeHooks.useValue(nodeId, "oScribeMode");

    const theMax = Math.ceil(pointCount / 2) - 2;

    const skipCount = Math.min(theMax, Math.max(0, nodeHooks.useCoalesce(nodeId, "skipCount", "skipCount", globals)));

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

    const points = useMemo(() => {
        //const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);
        const angles = lodash.range(0, pointCount).map((i) => MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR));

        const theSpread = expandMode === ExpandModes.POINT ? MathHelper.lengthToPx(spread) : (1 / Math.cos(Math.PI / (pointCount / (skipCount + 1)))) * MathHelper.lengthToPx(spread);

        const tIMod = spanMode === SpanModes.INOUT ? 0 : spreadAlignMode === SpreadAlignModes.CENTER ? theSpread / 2 : spreadAlignMode === SpreadAlignModes.INWARD ? theSpread : 0;
        const tOMod = spanMode === SpanModes.INOUT ? 0 : spreadAlignMode === SpreadAlignModes.CENTER ? theSpread / 2 : spreadAlignMode === SpreadAlignModes.OUTWARD ? theSpread : 0;

        const tI =
            (spanMode === SpanModes.INOUT ? getTrueRadius(MathHelper.lengthToPx(innerRadius), iScribeMode, pointCount) : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) - tIMod;
        const tO =
            (spanMode === SpanModes.INOUT ? getTrueRadius(MathHelper.lengthToPx(outerRadius), oScribeMode, pointCount) : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) + tOMod;

        const numShapes = MathHelper.gcd(pointCount, skipCount + 1);
        const numLines = pointCount / numShapes;

        return lodash
            .range(0, numShapes)
            .map((a, startIndex) => {
                const tmpO: string[] = [];
                const tmpI: string[] = [];
                lodash.range(0, numLines).forEach((a, eachCount) => {
                    //const i = angles[(a * (skipCount + 1)) % angles.length];
                    const i = angles[(startIndex + eachCount * (skipCount + 1)) % angles.length];
                    //return `${tR * Math.cos(MathHelper.deg2rad(i - 90))},${tR * Math.sin(MathHelper.deg2rad(i - 90))}`;
                    tmpO.push(`${tO * Math.cos(MathHelper.deg2rad(i - 90))},${tO * Math.sin(MathHelper.deg2rad(i - 90))}`);
                    tmpI.push(`${tI * Math.cos(MathHelper.deg2rad(i - 90))},${tI * Math.sin(MathHelper.deg2rad(i - 90))}`);
                });

                tmpI.reverse();

                return `M ${tmpO[0]} ${tmpO
                    .slice(1)
                    .map((e) => `L ${e}`)
                    .join(" ")} Z M ${tmpI[0]} ${tmpI
                    .slice(1)
                    .map((e) => `L ${e}`)
                    .join(" ")} Z`;
            })
            .join(" ");
    }, [pointCount, expandMode, spread, spanMode, spreadAlignMode, innerRadius, radius, rScribeMode, iScribeMode, oScribeMode, outerRadius, thetaCurve, skipCount]);

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

const nodeMethods = ArcaneGraph.nodeMethods<IKnotNode>();

const KnotNodeHelper: INodeHelper<IKnotNode> = {
    name: "Knot",
    buttonIcon: nodeIcons.knotShape.buttonIcon,
    nodeIcon: nodeIcons.knotShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_KNOT,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IKnotNode["outputs"], globals: GraphGlobals) => {
        if (socket === "output") {
            return Renderer;
        }
        const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
        const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
        const skipCount = nodeMethods.getValue(graph, nodeId, "skipCount");
        const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");

        const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount);

        switch (socket) {
            case "rTangents":
                return MathHelper.pxToLength(getPassedRadius(tR, CrossScribeModes.TANGENTS, pointCount, skipCount));
            case "rPoints":
                return MathHelper.pxToLength(getPassedRadius(tR, CrossScribeModes.POINTS, pointCount, skipCount));
            case "rMiddle":
                return MathHelper.pxToLength(getPassedRadius(tR, CrossScribeModes.MIDDLE, pointCount, skipCount));
        }
    },
    initialize: () => ({
        radius: { value: 150, unit: "px" },
        spread: { value: 20, unit: "px" },
        spreadAlignMode: SpreadAlignModes.CENTER,
        expandMode: ExpandModes.POINT,
        spanMode: SpanModes.INOUT,
        innerRadius: { value: 140, unit: "px" },
        outerRadius: { value: 160, unit: "px" },
        strokeWidth: { value: 1, unit: "px" },
        pointCount: 5,
        skipCount: 1,
        strokeJoin: StrokeJoinModes.MITER,
        rScribeMode: ScribeModes.INSCRIBE,
        iScribeMode: ScribeModes.INSCRIBE,
        oScribeMode: ScribeModes.INSCRIBE,
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
        rotation: 0,
    }),
    controls: Controls,
};

export default KnotNodeHelper;

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

const getPassedRadius = (r: number, desired: CrossScribeMode, pointCount: number, skipCount: number) => {
    if (desired === CrossScribeModes.POINTS) {
        return r;
    }

    const start = {
        x: r * Math.cos(MathHelper.deg2rad(-90)),
        y: r * Math.sin(MathHelper.deg2rad(-90)),
    };
    const end = {
        x: r * Math.cos(MathHelper.deg2rad(MathHelper.lerp(MathHelper.delerp((skipCount + 1) % pointCount, 0, pointCount), 0, 360) - 90)),
        y: r * Math.sin(MathHelper.deg2rad(MathHelper.lerp(MathHelper.delerp((skipCount + 1) % pointCount, 0, pointCount), 0, 360) - 90)),
    };

    const tR = Math.sqrt(((start.x + end.x) / 2) * ((start.x + end.x) / 2) + ((start.y + end.y) / 2) * ((start.y + end.y) / 2));

    switch (desired) {
        case CrossScribeModes.MIDDLE:
            return (r + tR) / 2;
        case CrossScribeModes.TANGENTS:
            return tR;
    }
};
