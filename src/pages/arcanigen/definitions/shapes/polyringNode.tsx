import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   Globals,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   ScribeMode,
   SCRIBE_MODES,
   SocketTypes,
   StrokeJoinMode,
   STROKEJOIN_MODES,
   RADIAL_MODES,
   RadialMode,
   SpreadAlignMode,
   SPREAD_ALIGN_MODES,
   ExpandMode,
   EXPAND_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import { TransformPrefabs } from "../../nodeView/prefabs";
import faTriangleRing from "!/components/icons/faTriangleRing";
import faTriangleRingLight from "!/components/icons/faTriangleRingLight";

interface IPolyringNode extends INodeDefinition {
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
      rInscribe: Length;
      rCircumscribe: Length;
      rMiddle: Length;
   };
   values: {
      radialMode: RadialMode;
      radius: Length;
      spread: Length;
      spreadAlignMode: SpreadAlignMode;
      expandMode: ExpandMode;
      innerRadius: Length;
      outerRadius: Length;

      strokeWidth: Length;
      pointCount: number;
      scribeMode: ScribeMode;
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

const nodeHelper = ArcaneGraph.nodeHooks<IPolyringNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [spreadAlignMode, setSpreadAlignMode] = nodeHelper.useValueState(nodeId, "spreadAlignMode");
   const [expandMode, setExpandMode] = nodeHelper.useValueState(nodeId, "expandMode");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [scribeMode, setScribeMode] = nodeHelper.useValueState(nodeId, "scribeMode");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IPolyringNode> nodeId={nodeId} helper={PolyringNodeHelper}>
         <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Spread Align Mode"}>
            <ToggleList value={spreadAlignMode} onValue={setSpreadAlignMode} options={SPREAD_ALIGN_MODES} disabled={radialMode === "inout"} />
         </BaseNode.Input>
         <BaseNode.Input label={"Expand Mode"}>
            <ToggleList value={expandMode} onValue={setExpandMode} options={EXPAND_MODES} disabled={radialMode === "inout"} />
         </BaseNode.Input>
         <BaseNode.Input label={"Scribe Mode"}>
            <Dropdown value={scribeMode} onValue={setScribeMode} options={SCRIBE_MODES} />
         </BaseNode.Input>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolyringNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <BaseNode.Foldout label={"Additional Outputs"} inputs={""} outputs={"rInscribe rCircumscribe rMiddle"} nodeId={nodeId}>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"rInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Radius
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"rCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Radius
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"rMiddle"} type={SocketTypes.LENGTH}>
               Middle Radius
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const scribeMode = nodeHelper.useValue(nodeId, "scribeMode");
   const spreadAlignMode = nodeHelper.useValue(nodeId, "spreadAlignMode");
   const expandMode = nodeHelper.useValue(nodeId, "expandMode");

   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

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
      const theSpread = expandMode === "point" ? MathHelper.lengthToPx(spread) : (1 / Math.cos(Math.PI / pointCount)) * MathHelper.lengthToPx(spread);

      const tIMod = radialMode === "inout" ? 0 : spreadAlignMode === "center" ? theSpread / 2 : spreadAlignMode === "inward" ? theSpread : 0;
      const tOMod = radialMode === "inout" ? 0 : spreadAlignMode === "center" ? theSpread / 2 : spreadAlignMode === "outward" ? theSpread : 0;

      const tI = getTrueRadius(radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius), scribeMode, pointCount) - tIMod;
      const tO = getTrueRadius(radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius), scribeMode, pointCount) + tOMod;

      const innerPoints: string[] = [];
      const outerPoints: string[] = [];

      lodash.range(pointCount).forEach((each) => {
         const coeff = MathHelper.lerp(MathHelper.delerp(each, 0, pointCount), 0, 360, {
            curveFn: thetaCurve?.curveFn ?? "linear",
            easing: thetaCurve?.easing ?? "in",
            intensity: thetaCurve?.intensity ?? 1,
         });

         outerPoints.push(`${tO * Math.cos(MathHelper.deg2rad(coeff - 90))},${tO * Math.sin(MathHelper.deg2rad(coeff - 90))}`);
         innerPoints.push(`${tI * Math.cos(MathHelper.deg2rad(coeff - 90))},${tI * Math.sin(MathHelper.deg2rad(coeff - 90))}`);
      });

      innerPoints.reverse();

      return `M ${outerPoints[0]} ${outerPoints.slice(1).map((e) => `L ${e}`)} Z M ${innerPoints[0]} ${innerPoints.slice(1).map((e) => `L ${e}`)} Z`;
   }, [
      expandMode,
      innerRadius,
      outerRadius,
      pointCount,
      radialMode,
      radius,
      scribeMode,
      spread,
      spreadAlignMode,
      thetaCurve?.curveFn,
      thetaCurve?.easing,
      thetaCurve?.intensity,
   ]);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         <g
            stroke={MathHelper.colorToSVG(strokeColor)}
            fill={MathHelper.colorToSVG(fillColor)}
            strokeOpacity={MathHelper.colorToOpacity(strokeColor)}
            fillOpacity={MathHelper.colorToOpacity(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinejoin={strokeJoin}
         >
            <path d={points} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IPolyringNode>();

const PolyringNodeHelper: INodeHelper<IPolyringNode> = {
   name: "Polyring",
   buttonIcon: faTriangleRingLight,
   nodeIcon: faTriangleRing,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_POLYRING,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPolyringNode["outputs"], globals: Globals) => {
      if (socket === "output") {
         return Renderer;
      }
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const scribeMode = nodeMethods.getValue(graph, nodeId, "scribeMode");

      const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);

      switch (socket) {
         case "rInscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "inscribe", pointCount));
         case "rCircumscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "circumscribe", pointCount));
         case "rMiddle":
            return MathHelper.pxToLength(getPassedRadius(tR, "middle", pointCount));
      }
   },
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      spread: { value: 20, unit: "px" },
      spreadAlignMode: "center",
      expandMode: "point",
      radialMode: "inout",
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      pointCount: 3,
      strokeJoin: "miter",
      scribeMode: "inscribe",
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

export default PolyringNodeHelper;

const getTrueRadius = (r: number, scribe: ScribeMode, sides: number) => {
   switch (scribe) {
      case "middle":
         return (r + r / Math.cos(Math.PI / sides)) / 2;
      case "circumscribe":
         return r / Math.cos(Math.PI / sides);
      case "inscribe":
         return r;
   }
};

const getPassedRadius = (r: number, desired: ScribeMode, sides: number) => {
   switch (desired) {
      case "middle":
         return (r + r * Math.cos(Math.PI / sides)) / 2;
      case "circumscribe":
         return r;
      case "inscribe":
         return r * Math.cos(Math.PI / sides);
   }
};
