import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   RadialMode,
   RADIAL_MODES,
   SocketTypes,
   StrokeJoinMode,
   STROKEJOIN_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faStar as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faStar as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IStarNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      thetaCurve: Curve;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;

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
      radialMode: RadialMode;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      pointCount: number;
      strokeWidth: Length;
      strokeJoin: StrokeJoinMode;
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

const nodeHelper = ArcaneGraph.nodeHooks<IStarNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IStarNode> nodeId={nodeId} helper={StarNodeHelper}>
         <SocketOut<IStarNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>

         <hr />
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IStarNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);
   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals)));

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHelper.useInput(nodeId, "thetaCurve", globals);

   const points = useMemo(() => {
      const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
      const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

      return lodash
         .range(pointCount * 2)
         .map((i) => {
            const coeff = MathHelper.lerp(MathHelper.delerp(i, 0, pointCount * 2), 0, 360, {
               curveFn: thetaCurve?.curveFn ?? "linear",
               easing: thetaCurve?.easing ?? "in",
            });
            const rad = i % 2 === 0 ? rO : rI;
            return `${rad * Math.cos(MathHelper.deg2rad(coeff - 90))},${rad * Math.sin(MathHelper.deg2rad(coeff - 90))}`;
         })
         .join(" ");
   }, [innerRadius, outerRadius, pointCount, radialMode, radius, spread, thetaCurve?.curveFn, thetaCurve?.easing]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <g
            stroke={MathHelper.colorToHTML(strokeColor)}
            fill={MathHelper.colorToHTML(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinejoin={strokeJoin}
         >
            <polygon points={points} />
         </g>
      </g>
   );
});

const StarNodeHelper: INodeHelper<IStarNode> = {
   name: "Star",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_STAR,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IStarNode["outputs"]) => Renderer,
   initialize: () => ({
      radius: { value: 110, unit: "px" },
      spread: { value: 60, unit: "px" },
      radialMode: "inout",
      pointCount: 5,
      innerRadius: { value: 60, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      strokeJoin: "miter",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default StarNodeHelper;
