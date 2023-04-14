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
   SpanMode,
   SPAN_MODES,
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
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";
import lodash from "lodash";
import faSpiral from "!/components/icons/faSpiral";
import faSpiralLight from "!/components/icons/faSpiralLight";
import Checkbox from "!/components/buttons/Checkbox";

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
   };
   values: {
      radialMode: SpanMode;
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
   const [spread, setSpread] = nodeHooks.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHooks.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHooks.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHooks.useValueState(nodeId, "outerRadius");

   const [thetaStart, setThetaStart] = nodeHooks.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHooks.useValueState(nodeId, "thetaEnd");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");

   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

   const hasThetaStart = nodeHooks.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHooks.useHasLink(nodeId, "thetaEnd");

   const hasInnerRadius = nodeHooks.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHooks.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasSpread = nodeHooks.useHasLink(nodeId, "spread");

   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<ISpiralNode> nodeId={nodeId} helper={SpiralNodeHelper} hooks={nodeHooks}>
         <SocketOut<ISpiralNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={SPAN_MODES} />
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
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
               Marker Start
            </SocketIn>
            <SocketIn<ISpiralNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
               Marker End
            </SocketIn>
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
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
         <TransformPrefabs.Full<ISpiralNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const radialMode = nodeHooks.useValue(nodeId, "radialMode");
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHooks.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHooks.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHooks.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

   const thetaStart = nodeHooks.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
   const thetaEnd = nodeHooks.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");

   const [MarkStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);
   const strokeMarkAlign = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

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
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         {MarkStart && msId && (
            <marker
               id={`markstart_${nodeId}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               refX={"center"}
               refY={"center"}
               overflow={"visible"}
               orient={strokeMarkAlign ? "auto-start-reverse" : undefined}
            >
               <g transform={strokeMarkAlign ? `rotate(-90)` : ""}>
                  <MarkStart nodeId={msId} depth={(depth ?? "") + `_${nodeId}.markStart`} globals={globals} />
               </g>
            </marker>
         )}
         {MarkEnd && meId && (
            <marker
               id={`markend_${nodeId}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               refX={"center"}
               refY={"center"}
               overflow={"visible"}
               orient={strokeMarkAlign ? "auto-start-reverse" : undefined}
            >
               <g transform={strokeMarkAlign ? `rotate(-90)` : ""}>
                  <MarkEnd nodeId={meId} depth={(depth ?? "") + `_${nodeId}.markEnd`} globals={globals} />
               </g>
            </marker>
         )}
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            markerStart={MarkStart && msId ? `url('#markstart_${nodeId}_lyr-${depth ?? ""}')` : undefined}
            markerEnd={MarkEnd && meId ? `url('#markend_${nodeId}_lyr-${depth ?? ""}')` : undefined}
         >
            <path d={pathD} vectorEffect={"non-scaling-stroke"} />
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
      strokeMarkAlign: true,
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
