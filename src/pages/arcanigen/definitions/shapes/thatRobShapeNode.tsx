import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, Interpolator } from "../types";
import {
    PositionMode,
    StrokeCapMode,
    STROKECAP_MODE_OPTIONS,
    StrokeJoinMode,
    STROKEJOIN_MODE_OPTIONS,
    StrokeCapModes,
    StrokeJoinModes,
    NodeTypes,
    SocketTypes,
    PositionModes,
} from "../../../../utility/enums";
import MathHelper, { seededRandom } from "!/utility/mathhelper";

import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import { LengthInput } from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import { TextInput } from "!/components/inputs/TextInput";
import lodash from "lodash";
import { NumericInput } from "!/components/inputs/NumericInput";
import SliderInputOld from "!/components/inputs/SliderInput";
import CheckBox from "!/components/buttons/Checkbox";
import useMarkers from "!/utility/useMarkers";
import { nodeIcons } from "../icons";

interface IThatRobShapeNode extends INodeDefinition {
    inputs: {
        radius: Length;
        seed: number;
        weight: number;
        weightCurve: Interpolator;
        count: number;

        strokeWidth: Length;
        strokeColor: Color;
        strokeOffset: Length;
        strokeMarkStart: NodeRenderer;
        strokeMarkEnd: NodeRenderer;
        strokeMarkMid: NodeRenderer;

        positionX: Length;
        positionY: Length;
        positionRadius: Length;
        positionTheta: number;
        rotation: number;

        midpoint: number;
        midpointSpread: number;
    };
    outputs: {
        output: NodeRenderer;
    };
    values: {
        radius: Length;
        seed: number;
        weight: number;
        count: number;

        strokeColor: Color;
        strokeWidth: Length;
        strokeJoin: StrokeJoinMode;
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

        midpoint: number;
        midpointSpread: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IThatRobShapeNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
    const [seed, setSeed] = nodeHooks.useValueState(nodeId, "seed");
    const [weight, setWeight] = nodeHooks.useValueState(nodeId, "weight");
    const [count, setCount] = nodeHooks.useValueState(nodeId, "count");

    const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
    const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
    const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
    const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
    const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
    const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");

    const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

    const [midpoint, setMidpoint] = nodeHooks.useValueState(nodeId, "midpoint");
    const [midpointSpread, setMidpointSpread] = nodeHooks.useValueState(nodeId, "midpointSpread");

    const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
    const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
    const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");

    const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
    const hasSeed = nodeHooks.useHasLink(nodeId, "seed");
    const hasWeight = nodeHooks.useHasLink(nodeId, "weight");
    const hasCount = nodeHooks.useHasLink(nodeId, "count");

    const hasMidpoint = nodeHooks.useHasLink(nodeId, "midpoint");
    const hasMidpointSpread = nodeHooks.useHasLink(nodeId, "midpointSpread");

    return (
        <BaseNode<IThatRobShapeNode> nodeId={nodeId} helper={ThatRobShapeNodeHelper} hooks={nodeHooks}>
            <SocketOut<IThatRobShapeNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
                <BaseNode.Input label={"Radius"}>
                    <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
                <BaseNode.Input label={"Seed"}>
                    <NumericInput value={seed} onValidValue={setSeed} disabled={hasSeed} min={0} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"count"} type={SocketTypes.INTEGER}>
                <BaseNode.Input label={"Count"}>
                    <NumericInput value={count} onValidValue={setCount} disabled={hasCount} min={1} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"weight"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Straight/Arc Ratio"}>
                    <SliderInputOld value={weight} onValidValue={setWeight} min={0} max={1} disabled={hasWeight} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"weightCurve"} type={SocketTypes.CURVE}>
                Straight/Arc Distribution
            </SocketIn>
            <hr />
            <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor strokeOffset strokeMarkStart strokeMarkEnd"} outputs={""}>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Width"}>
                        <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
                    <BaseNode.Input label={"Stroke Dash Offset"}>
                        <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
                    Marker Start
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeMarkMid"} type={SocketTypes.SHAPE}>
                    Marker Mid
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
                    Marker End
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"midpoint"} type={SocketTypes.PERCENT}>
                    <BaseNode.Input label={"Midpoint"}>
                        <SliderInputOld value={midpoint} onValidValue={setMidpoint} disabled={hasMidpoint} min={0} max={1} />
                    </BaseNode.Input>
                </SocketIn>
                <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"midpoint"} type={SocketTypes.PERCENT}>
                    <BaseNode.Input label={"Midpoint Spread"}>
                        <SliderInputOld value={midpointSpread} onValidValue={setMidpointSpread} disabled={hasMidpointSpread} min={0} max={1} />
                    </BaseNode.Input>
                </SocketIn>
                <CheckBox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
                    Align Markers
                </CheckBox>
            </BaseNode.Foldout>
            <TransformPrefabs.Full<IThatRobShapeNode> nodeId={nodeId} hooks={nodeHooks} />
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, globals, depth, overrides = {} }: NodeRendererProps) => {
    const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
    const count = nodeHooks.useCoalesce(nodeId, "count", "count", globals);
    const seed = nodeHooks.useCoalesce(nodeId, "seed", "seed", globals);
    const weight = nodeHooks.useCoalesce(nodeId, "weight", "weight", globals);
    const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
    const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
    const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
    const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
    const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);
    const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");

    const weightCurve = nodeHooks.useInput(nodeId, "weightCurve", globals);

    const positionMode = nodeHooks.useValue(nodeId, "positionMode");
    const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
    const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
    const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
    const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
    const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

    const midpoint = nodeHooks.useCoalesce(nodeId, "midpoint", "midpoint", globals);
    const midpointSpread = nodeHooks.useCoalesce(nodeId, "midpointSpread", "midpointSpread", globals);

    const points = useMemo(() => {
        const sRand = seededRandom(seed);
        return lodash.range(Math.max(1, count)).reduce((acc) => {
            const type = sRand();

            const wType = MathHelper.lerp(type, 0, 1, weightCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

            const rad = MathHelper.lengthToPx(radius);
            const cR = sRand() * rad + rad;
            const cT = sRand() * 360;
            const iR = sRand() * rad;
            const iT = sRand() * 360;
            const randSpread = (sRand() - 0.5) * 2 * midpointSpread;
            const theMid = MathHelper.clamp(midpoint + randSpread, 0, 1);

            const cX = Math.cos(MathHelper.deg2rad(cT)) * cR;
            const cY = Math.sin(MathHelper.deg2rad(cT)) * cR;

            const iX = Math.cos(MathHelper.deg2rad(iT)) * iR;
            const iY = Math.sin(MathHelper.deg2rad(iT)) * iR;

            const tR = Math.sqrt(Math.pow(cX - iX, 2) + Math.pow(cY - iY, 2));

            const dX = cX / cR;
            const dY = cY / cR;
            const d = cR;

            const a = (rad * rad - tR * tR + d * d) / (2 * d);
            const pX = a * dX;
            const pY = a * dY;
            const h = Math.sqrt(rad * rad - a * a);

            const aX = pX + h * dY;
            const aY = pY - h * dX;
            const bX = pX - h * dY;
            const bY = pY + h * dX;

            if (!globals.filterData || globals.filterData.discriminator() <= globals.filterData.threshold) {
                if (wType <= weight) {
                    const aT = MathHelper.rad2deg(Math.atan2(aY - cY, aX - cX)) / 360;
                    const bT = MathHelper.rad2deg(Math.atan2(bY - cY, bX - cX)) / 360;

                    const mT = MathHelper.angleLerp(theMid, Math.min(aT, bT), Math.max(aT, bT), "closestCW") * 360;

                    const mX = Math.cos(MathHelper.deg2rad(mT)) * tR + cX;
                    const mY = Math.sin(MathHelper.deg2rad(mT)) * tR + cY;
                    acc.push(`M ${aX},${aY} A ${tR},${tR} 0 0 0 ${mX},${mY} A ${tR},${tR} 0 0 0 ${bX},${bY}`);
                    //arc
                } else {
                    const mX = MathHelper.lerp(theMid, aX, bX);
                    const mY = MathHelper.lerp(theMid, aY, bY);
                    //line
                    acc.push(`M ${aX},${aY} L ${mX},${mY} L ${bX},${bY}`);
                }
            }
            return acc;
        }, [] as string[]);
    }, [globals.filterData, seed, count, weightCurve, radius, midpoint, weight, midpointSpread]);

    const [Markers, mStartId, mMidId, mEndId] = useMarkers(nodeHooks, nodeId, globals, overrides, depth);

    return (
        <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
            <Markers />
            <g
                stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
                strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
                strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
                strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
                    .map(MathHelper.lengthToPx)
                    .join(" ")}
                strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
                fill={"none"}
                markerStart={mStartId}
                markerMid={mMidId}
                markerEnd={mEndId}
            >
                {points.map((each, i) => {
                    return <path d={each} key={i} vectorEffect={"non-scaling-stroke"} />;
                })}
            </g>
        </g>
    );
});

const ThatRobShapeNodeHelper: INodeHelper<IThatRobShapeNode> = {
    name: "ThatRobShape",
    buttonIcon: nodeIcons.thatRobShape.buttonIcon,
    nodeIcon: nodeIcons.thatRobShape.nodeIcon,
    flavour: "emphasis",
    type: NodeTypes.SHAPE_THATROBSHAPE,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IThatRobShapeNode["outputs"]) => Renderer,
    initialize: () => {
        const seed = Math.floor(Math.random() * 10000);
        return {
            radius: { value: 150, unit: "px" },
            count: 6,
            seed,
            weight: 0.75,
            strokeWidth: { value: 1, unit: "px" },
            strokeDash: "",
            strokeOffset: { value: 0, unit: "px" },
            strokeCap: StrokeCapModes.BUTT,
            strokeJoin: StrokeJoinModes.MITER,
            strokeColor: { r: 0, g: 0, b: 0, a: 1 },
            strokeMarkAlign: true,

            positionX: { value: 0, unit: "px" },
            positionY: { value: 0, unit: "px" },
            positionRadius: { value: 0, unit: "px" },
            positionTheta: 0,
            positionMode: PositionModes.CARTESIAN,
            rotation: 0,
            filterWeight: 0.5,
            midpoint: 0.5,
            midpointSpread: 0,
        };
    },
    controls: Controls,
};

export default ThatRobShapeNodeHelper;

/*
() => {
            const rad = MathHelper.lengthToPx(radius);
            const type = sRand();
            const startPoint = sRand() * 360;
            const endPoint = sRand() * 360;
            const midRad = (sRand() * rad) / 2;
            const midTheta = sRand() * 360;
            const aX = rad * Math.cos(MathHelper.deg2rad(startPoint - 90));
            const aY = rad * Math.sin(MathHelper.deg2rad(startPoint - 90));
            const cX = midRad * Math.cos(MathHelper.deg2rad(midTheta - 90));
            const cY = midRad * Math.sin(MathHelper.deg2rad(midTheta - 90));
            const bX = rad * Math.cos(MathHelper.deg2rad(endPoint - 90));
            const bY = rad * Math.sin(MathHelper.deg2rad(endPoint - 90));
            if (type <= weight) {
               const dA = Math.sqrt(Math.pow(bX - cX, 2) + Math.pow(bY - cY, 2));
               const dB = Math.sqrt(Math.pow(cX - aX, 2) + Math.pow(cY - aY, 2));
               const dC = Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
               const angle = Math.acos((dA * dA + dB * dB - dC * dC) / (2 * dA * dB));
               const k = 0.5 * dA * dB * Math.sin(angle);
               const r = Math.round(((dA * dB * dC) / 4 / k) * 1000) / 1000;
               const laf = Math.PI / 2 > angle ? 1 : 0;
               const saf = (bX - aX) * (cY - aY) - (bY - aY) * (cX - aX) < 0 ? 1 : 0;
               return `M ${aX},${aY} A ${r},${r}, 0, ${laf} ${saf} ${bX},${bY} M ${aX},${aY} L ${bX},${bY} L ${cX},${cY} Z`;
               //arc
            } else {
               //line
               return `M ${aX},${aY} L ${bX},${bY}`;
            }
         }
         */
