import { memo, useEffect, useMemo } from "react";
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
   ExpandMode,
   SpanMode,
   SpreadAlignMode,
   EXPAND_MODES,
   SPAN_MODES,
   SPREAD_ALIGN_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faPretzel as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPretzel as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IKnotNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      skipCount: number;
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

const nodeHelper = ArcaneGraph.nodeHooks<IKnotNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [spreadAlignMode, setSpreadAlignMode] = nodeHelper.useValueState(nodeId, "spreadAlignMode");
   const [expandMode, setExpandMode] = nodeHelper.useValueState(nodeId, "expandMode");
   const [spanMode, setSpanMode] = nodeHelper.useValueState(nodeId, "spanMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [skipCount, setSkipCount] = nodeHelper.useValueState(nodeId, "skipCount");
   const [rScribeMode, setRScribeMode] = nodeHelper.useValueState(nodeId, "rScribeMode");
   const [iScribeMode, setIScribeMode] = nodeHelper.useValueState(nodeId, "iScribeMode");
   const [oScribeMode, setOScribeMode] = nodeHelper.useValueState(nodeId, "oScribeMode");

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasSkipCount = nodeHelper.useHasLink(nodeId, "skipCount");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");

   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

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
      <BaseNode<IKnotNode> nodeId={nodeId} helper={KnotNodeHelper}>
         <SocketOut<IKnotNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"skipCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Skip Count"}>
               <SliderInput
                  revertInvalid
                  value={skipCount}
                  onValidValue={setSkipCount}
                  min={0}
                  max={Math.ceil(pointCount / 2) - 2}
                  step={1}
                  disabled={Math.ceil(pointCount / 2) - 2 <= 0 || hasSkipCount}
               />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Span Mode"}>
            <ToggleList value={spanMode} onValue={setSpanMode} options={SPAN_MODES} />
         </BaseNode.Input>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || spanMode === "spread"} />
               <Dropdown value={iScribeMode} onValue={setIScribeMode} options={SCRIBE_MODES} disabled={spanMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || spanMode === "spread"} />
               <Dropdown value={oScribeMode} onValue={setOScribeMode} options={SCRIBE_MODES} disabled={spanMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || spanMode === "inout"} />
               <Dropdown value={rScribeMode} onValue={setRScribeMode} options={SCRIBE_MODES} disabled={spanMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || spanMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Spread Align Mode"}>
            <ToggleList value={spreadAlignMode} onValue={setSpreadAlignMode} options={SPREAD_ALIGN_MODES} disabled={spanMode === "inout"} />
         </BaseNode.Input>
         <BaseNode.Input label={"Expand Mode"}>
            <ToggleList value={expandMode} onValue={setExpandMode} options={EXPAND_MODES} disabled={spanMode === "inout"} />
         </BaseNode.Input>
         <SocketIn<IKnotNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>

         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IKnotNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IKnotNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <BaseNode.Foldout label={"Additional Outputs"} inputs={""} outputs={"rTangents rPoints rMiddle"} nodeId={nodeId}>
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
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const spanMode = nodeHelper.useValue(nodeId, "spanMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);
   const spreadAlignMode = nodeHelper.useValue(nodeId, "spreadAlignMode");
   const expandMode = nodeHelper.useValue(nodeId, "expandMode");

   const pointCount = nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals);
   const rScribeMode = nodeHelper.useValue(nodeId, "rScribeMode");
   const iScribeMode = nodeHelper.useValue(nodeId, "iScribeMode");
   const oScribeMode = nodeHelper.useValue(nodeId, "oScribeMode");

   const theMax = Math.ceil(pointCount / 2) - 2;

   const skipCount = Math.min(theMax, Math.max(0, nodeHelper.useCoalesce(nodeId, "skipCount", "skipCount", globals)));

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
      //const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);
      const angles = lodash.range(0, pointCount).map((i) =>
         MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, {
            curveFn: thetaCurve?.curveFn ?? "linear",
            easing: thetaCurve?.easing ?? "in",
            intensity: thetaCurve?.intensity ?? 1,
         })
      );

      const theSpread =
         expandMode === "point" ? MathHelper.lengthToPx(spread) : (1 / Math.cos(Math.PI / (pointCount / (skipCount + 1)))) * MathHelper.lengthToPx(spread);

      const tIMod = spanMode === "inout" ? 0 : spreadAlignMode === "center" ? theSpread / 2 : spreadAlignMode === "inward" ? theSpread : 0;
      const tOMod = spanMode === "inout" ? 0 : spreadAlignMode === "center" ? theSpread / 2 : spreadAlignMode === "outward" ? theSpread : 0;

      const tI =
         (spanMode === "inout"
            ? getTrueRadius(MathHelper.lengthToPx(innerRadius), iScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) - tIMod;
      const tO =
         (spanMode === "inout"
            ? getTrueRadius(MathHelper.lengthToPx(outerRadius), oScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) + tOMod;

      const innerPoints: string[] = [];
      const outerPoints: string[] = [];

      lodash.range(pointCount).forEach((a) => {
         const i = angles[(a * (skipCount + 1)) % angles.length];
         //return `${tR * Math.cos(MathHelper.deg2rad(i - 90))},${tR * Math.sin(MathHelper.deg2rad(i - 90))}`;
         outerPoints.push(`${tO * Math.cos(MathHelper.deg2rad(i - 90))},${tO * Math.sin(MathHelper.deg2rad(i - 90))}`);
         innerPoints.push(`${tI * Math.cos(MathHelper.deg2rad(i - 90))},${tI * Math.sin(MathHelper.deg2rad(i - 90))}`);
      });

      innerPoints.reverse();

      return `M ${outerPoints[0]} ${outerPoints.slice(1).map((e) => `L ${e}`)} Z M ${innerPoints[0]} ${innerPoints.slice(1).map((e) => `L ${e}`)} Z`;
   }, [
      pointCount,
      expandMode,
      spread,
      spanMode,
      spreadAlignMode,
      innerRadius,
      radius,
      rScribeMode,
      iScribeMode,
      oScribeMode,
      outerRadius,
      thetaCurve?.curveFn,
      thetaCurve?.easing,
      thetaCurve?.intensity,
      skipCount,
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

const nodeMethods = ArcaneGraph.nodeMethods<IKnotNode>();

const KnotNodeHelper: INodeHelper<IKnotNode> = {
   name: "Knot",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_KNOT,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IKnotNode["outputs"], globals: Globals) => {
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
            return MathHelper.pxToLength(getPassedRadius(tR, "tangents", pointCount, skipCount));
         case "rPoints":
            return MathHelper.pxToLength(getPassedRadius(tR, "points", pointCount, skipCount));
         case "rMiddle":
            return MathHelper.pxToLength(getPassedRadius(tR, "middle", pointCount, skipCount));
      }
   },
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      spread: { value: 20, unit: "px" },
      spreadAlignMode: "center",
      expandMode: "point",
      spanMode: "inout",
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      pointCount: 5,
      skipCount: 1,
      strokeJoin: "miter",
      rScribeMode: "inscribe",
      iScribeMode: "inscribe",
      oScribeMode: "inscribe",
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

export default KnotNodeHelper;

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

const getPassedRadius = (r: number, desired: "middle" | "points" | "tangents", pointCount: number, skipCount: number) => {
   if (desired === "points") {
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
      case "middle":
         return (r + tR) / 2;
      case "tangents":
         return tR;
   }
};
