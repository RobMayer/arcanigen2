import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   StrokeJoinMode,
   STROKEJOIN_MODES,
   Curve,
} from "../types";
import MathHelper, { seededRandom } from "!/utility/mathhelper";

import { faRobotAstromech as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faRobotAstromech as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";
import lodash from "lodash";
import NumberInput from "!/components/inputs/NumberInput";
import SliderInput from "!/components/inputs/SliderInput";

interface IThatRobShapeNode extends INodeDefinition {
   inputs: {
      radius: Length;
      seed: number;
      weight: number;
      weightCurve: Curve;
      count: number;

      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
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

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
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

   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");

   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasSeed = nodeHooks.useHasLink(nodeId, "seed");
   const hasWeight = nodeHooks.useHasLink(nodeId, "weight");
   const hasCount = nodeHooks.useHasLink(nodeId, "count");

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
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"count"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Count"}>
               <NumberInput value={count} onValidValue={setCount} disabled={hasCount} min={1} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"weight"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Straight/Arc Ratio"}>
               <SliderInput value={weight} onValidValue={setWeight} min={0} max={1} disabled={hasWeight} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"weightCurve"} type={SocketTypes.CURVE}>
            Straight/Arc Distribution
         </SocketIn>
         <hr />
         <BaseNode.Foldout
            panelId={"appearance"}
            label={"Appearance"}
            nodeId={nodeId}
            inputs={"strokeWidth strokeColor fillColor strokeMarkStart strokeMarkEnd"}
            outputs={""}
         >
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IThatRobShapeNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
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

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   const weightCurve = nodeHooks.useInput(nodeId, "weightCurve", globals);

   const points = useMemo(() => {
      const sRand = seededRandom(seed);
      return lodash
         .range(Math.max(1, count))
         .map(() => {
            const type = sRand();

            const wType = MathHelper.lerp(type, 0, 1, {
               curveFn: weightCurve?.curveFn ?? "linear",
               easing: weightCurve?.easing ?? "in",
               intensity: weightCurve?.intensity ?? 1,
            });

            const rad = MathHelper.lengthToPx(radius);
            const cR = sRand() * rad + rad;
            const cT = sRand() * 360;
            const iR = sRand() * rad;
            const iT = sRand() * 360;

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

            if (wType <= weight) {
               return `M ${aX},${aY} A ${tR},${tR} 0 0 0 ${bX},${bY}`;
               //arc
            } else {
               //line
               return `M ${aX},${aY} L ${bX},${bY}`;
            }
         })
         .join(" ");
   }, [count, seed, radius, weight, weightCurve]);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
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
         >
            <path d={points} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const ThatRobShapeNodeHelper: INodeHelper<IThatRobShapeNode> = {
   name: "ThatRobShape",
   buttonIcon,
   nodeIcon,
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
         strokeCap: "butt",
         strokeJoin: "miter",
         strokeColor: { r: 0, g: 0, b: 0, a: 1 },

         positionX: { value: 0, unit: "px" },
         positionY: { value: 0, unit: "px" },
         positionRadius: { value: 0, unit: "px" },
         positionTheta: 0,
         positionMode: "cartesian",
         rotation: 0,
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
