import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, Interpolator } from "../types";
import {
   PositionMode,
   ScribeMode,
   SCRIBE_MODE_OPTIONS,
   StrokeJoinMode,
   STROKEJOIN_MODE_OPTIONS,
   SPAN_MODE_OPTIONS,
   SpanMode,
   SpreadAlignMode,
   SPREAD_ALIGN_MODE_OPTIONS,
   ExpandMode,
   EXPAND_MODE_OPTIONS,
   STROKECAP_MODE_OPTIONS,
   StrokeCapMode,
   ScribeModes,
   SpanModes,
   SpreadAlignModes,
   ExpandModes,
   StrokeCapModes,
   StrokeJoinModes,
   NodeTypes,
   SocketTypes,
   PositionModes,
} from "../../../../utility/enums";
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
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import faTriangleRing from "!/components/icons/faTriangleRing";
import faTriangleRingLight from "!/components/icons/faTriangleRingLight";
import TextInput from "!/components/inputs/TextInput";

interface IPolyringNode extends INodeDefinition {
   inputs: {
      pointCount: number;
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
      spanMode: SpanMode;
      radius: Length;
      spread: Length;
      spreadAlignMode: SpreadAlignMode;
      expandMode: ExpandMode;
      innerRadius: Length;
      outerRadius: Length;

      strokeWidth: Length;
      pointCount: number;
      rScribeMode: ScribeMode;
      iScribeMode: ScribeMode;
      oScribeMode: ScribeMode;
      strokeJoin: StrokeJoinMode;
      strokeDash: string;
      strokeCap: StrokeCapMode;
      strokeOffset: Length;
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

const nodeHooks = ArcaneGraph.nodeHooks<IPolyringNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [rScribeMode, setRScribeMode] = nodeHooks.useValueState(nodeId, "rScribeMode");
   const [spread, setSpread] = nodeHooks.useValueState(nodeId, "spread");
   const [spreadAlignMode, setSpreadAlignMode] = nodeHooks.useValueState(nodeId, "spreadAlignMode");
   const [expandMode, setExpandMode] = nodeHooks.useValueState(nodeId, "expandMode");
   const [spanMode, setSpanMode] = nodeHooks.useValueState(nodeId, "spanMode");
   const [innerRadius, setInnerRadius] = nodeHooks.useValueState(nodeId, "innerRadius");
   const [iScribeMode, setIScribeMode] = nodeHooks.useValueState(nodeId, "iScribeMode");
   const [outerRadius, setOuterRadius] = nodeHooks.useValueState(nodeId, "outerRadius");
   const [oScribeMode, setOScribeMode] = nodeHooks.useValueState(nodeId, "oScribeMode");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const hasInnerRadius = nodeHooks.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHooks.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasSpread = nodeHooks.useHasLink(nodeId, "spread");

   const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IPolyringNode> nodeId={nodeId} helper={PolyringNodeHelper} hooks={nodeHooks}>
         <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Span Mode"}>
            <ToggleList value={spanMode} onValue={setSpanMode} options={SPAN_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || spanMode === SpanModes.SPREAD} />
               <Dropdown value={oScribeMode} onValue={setOScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.SPREAD} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || spanMode === SpanModes.SPREAD} />
               <Dropdown value={iScribeMode} onValue={setIScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.SPREAD} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || spanMode === SpanModes.INOUT} />
               <Dropdown value={rScribeMode} onValue={setRScribeMode} options={SCRIBE_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || spanMode === SpanModes.INOUT} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Spread Align Mode"}>
            <ToggleList value={spreadAlignMode} onValue={setSpreadAlignMode} options={SPREAD_ALIGN_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
         </BaseNode.Input>
         <BaseNode.Input label={"Expand Mode"}>
            <ToggleList value={expandMode} onValue={setExpandMode} options={EXPAND_MODE_OPTIONS} disabled={spanMode === SpanModes.INOUT} />
         </BaseNode.Input>
         <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODE_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODE_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolyringNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolyringNode> nodeId={nodeId} hooks={nodeHooks} />
         <BaseNode.Foldout
            panelId={"moreOutputs"}
            label={"Additional Outputs"}
            inputs={""}
            outputs={"cInscribe cCircumscribe cMiddle oInscribe oCircumscribe oMiddle iInscribe iCircumscribe iMiddle"}
            nodeId={nodeId}
         >
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"cInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Center
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"cCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Center
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"cMiddle"} type={SocketTypes.LENGTH}>
               Middle Center
            </SocketOut>

            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"oInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Outer
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"oCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Outer
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"oMiddle"} type={SocketTypes.LENGTH}>
               Middle Outer
            </SocketOut>

            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"iInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Inner
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"iCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Inner
            </SocketOut>
            <SocketOut<IPolyringNode> nodeId={nodeId} socketId={"iMiddle"} type={SocketTypes.LENGTH}>
               Middle Inner
            </SocketOut>
         </BaseNode.Foldout>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const pointCount = Math.min(24, Math.max(3, nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const rScribeMode = nodeHooks.useValue(nodeId, "rScribeMode");
   const iScribeMode = nodeHooks.useValue(nodeId, "iScribeMode");
   const oScribeMode = nodeHooks.useValue(nodeId, "oScribeMode");
   const spreadAlignMode = nodeHooks.useValue(nodeId, "spreadAlignMode");
   const expandMode = nodeHooks.useValue(nodeId, "expandMode");

   const spanMode = nodeHooks.useValue(nodeId, "spanMode");
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHooks.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHooks.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHooks.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

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
      const theSpread = expandMode === ExpandModes.POINT ? MathHelper.lengthToPx(spread) : (1 / Math.cos(Math.PI / pointCount)) * MathHelper.lengthToPx(spread);

      const tIMod =
         spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? theSpread / 2
            : spreadAlignMode === SpreadAlignModes.INWARD
            ? theSpread
            : 0;
      const tOMod =
         spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? theSpread / 2
            : spreadAlignMode === SpreadAlignModes.OUTWARD
            ? theSpread
            : 0;

      const tI =
         (spanMode === SpanModes.INOUT
            ? getTrueRadius(MathHelper.lengthToPx(innerRadius), iScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) - tIMod;
      const tO =
         (spanMode === SpanModes.INOUT
            ? getTrueRadius(MathHelper.lengthToPx(outerRadius), oScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) + tOMod;

      const innerPoints: string[] = [];
      const outerPoints: string[] = [];

      lodash.range(pointCount).forEach((each) => {
         const coeff = MathHelper.lerp(MathHelper.delerp(each, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

         outerPoints.push(`${tO * Math.cos(MathHelper.deg2rad(coeff - 90))},${tO * Math.sin(MathHelper.deg2rad(coeff - 90))}`);
         innerPoints.push(`${tI * Math.cos(MathHelper.deg2rad(coeff - 90))},${tI * Math.sin(MathHelper.deg2rad(coeff - 90))}`);
      });

      innerPoints.reverse();

      return `M ${outerPoints[0]} ${outerPoints
         .slice(1)
         .map((e) => `L ${e}`)
         .join(" ")} Z M ${innerPoints[0]} ${innerPoints
         .slice(1)
         .map((e) => `L ${e}`)
         .join(" ")} Z`;
   }, [expandMode, innerRadius, outerRadius, pointCount, spanMode, radius, rScribeMode, iScribeMode, oScribeMode, spread, spreadAlignMode, thetaCurve]);

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

const nodeMethods = ArcaneGraph.nodeMethods<IPolyringNode>();

const PolyringNodeHelper: INodeHelper<IPolyringNode> = {
   name: "Polyring",
   buttonIcon: faTriangleRingLight,
   nodeIcon: faTriangleRing,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_POLYRING,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPolyringNode["outputs"], globals: GraphGlobals) => {
      if (socket === "output") {
         return Renderer;
      }

      const spread = nodeMethods.getValue(graph, nodeId, "spread");
      const expandMode = nodeMethods.getValue(graph, nodeId, "expandMode");
      const spanMode = nodeMethods.getValue(graph, nodeId, "spanMode");
      const spreadAlignMode = nodeMethods.getValue(graph, nodeId, "spreadAlignMode");
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const innerRadius = nodeMethods.coalesce(graph, nodeId, "innerRadius", "outerRadius", globals);
      const outerRadius = nodeMethods.coalesce(graph, nodeId, "innerRadius", "outerRadius", globals);

      const iScribeMode = nodeMethods.getValue(graph, nodeId, "iScribeMode");
      const oScribeMode = nodeMethods.getValue(graph, nodeId, "oScribeMode");
      const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");

      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const theSpread = expandMode === ExpandModes.POINT ? MathHelper.lengthToPx(spread) : (1 / Math.cos(Math.PI / pointCount)) * MathHelper.lengthToPx(spread);

      const tIMod =
         spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? theSpread / 2
            : spreadAlignMode === SpreadAlignModes.INWARD
            ? theSpread
            : 0;
      const tOMod =
         spanMode === SpanModes.INOUT
            ? 0
            : spreadAlignMode === SpreadAlignModes.CENTER
            ? theSpread / 2
            : spreadAlignMode === SpreadAlignModes.OUTWARD
            ? theSpread
            : 0;

      const tI =
         (spanMode === SpanModes.INOUT
            ? getTrueRadius(MathHelper.lengthToPx(innerRadius), iScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) - tIMod;
      const tO =
         (spanMode === SpanModes.INOUT
            ? getTrueRadius(MathHelper.lengthToPx(outerRadius), oScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount)) + tOMod;

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
      radius: { value: 150, unit: "px" },
      spread: { value: 20, unit: "px" },
      spreadAlignMode: SpreadAlignModes.CENTER,
      expandMode: ExpandModes.POINT,
      spanMode: SpanModes.INOUT,
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      pointCount: 3,
      rScribeMode: ScribeModes.INSCRIBE,
      iScribeMode: ScribeModes.INSCRIBE,
      oScribeMode: ScribeModes.INSCRIBE,
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: StrokeCapModes.BUTT,
      strokeJoin: StrokeJoinModes.MITER,
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

export default PolyringNodeHelper;

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
