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
   RadialMode,
   RADIAL_MODES,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";
import lodash from "lodash";
import faSpiral from "!/components/icons/faSpiral";
import faSpiralLight from "!/components/icons/faSpiralLight";

interface ISpiralNode extends INodeDefinition {
   inputs: {
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      thetaStart: number;
      thetaEnd: number;

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
      thetaStart: number;
      thetaEnd: number;

      strokeColor: Color;
      strokeWidth: Length;
      fillColor: Color;
      strokeCap: StrokeCapMode;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ISpiralNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");

   const [thetaStart, setThetaStart] = nodeHelper.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHelper.useValueState(nodeId, "thetaEnd");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");

   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const hasThetaStart = nodeHelper.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHelper.useHasLink(nodeId, "thetaEnd");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");

   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<ISpiralNode> nodeId={nodeId} helper={SpiralNodeHelper}>
         <SocketOut<ISpiralNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <AngleInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <AngleInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd} wrap />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<ISpiralNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

   const thetaStart = nodeHelper.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
   const thetaEnd = nodeHelper.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);

   const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

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

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <g
            stroke={MathHelper.colorToHex(strokeColor)}
            fill={MathHelper.colorToHex(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinecap={strokeCap}
         >
            <path d={pathD} />
         </g>
      </g>
   );
});

const SpiralNodeHelper: INodeHelper<ISpiralNode> = {
   name: "Spiral",
   buttonIcon: faSpiralLight,
   nodeIcon: faSpiral,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_SPIRAL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISpiralNode["outputs"]) => Renderer,
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      innerRadius: { value: 120, unit: "px" },
      outerRadius: { value: 180, unit: "px" },
      spread: { value: 20, unit: "px" },
      radialMode: "inout",
      strokeWidth: { value: 1, unit: "px" },
      strokeCap: "butt",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,
      thetaStart: 0,
      thetaEnd: 90,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
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
