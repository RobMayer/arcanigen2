import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   SpanMode,
   SPAN_MODES,
   SocketTypes,
   SPREAD_ALIGN_MODES,
   SpreadAlignMode,
} from "../types";
import MathHelper from "!/utility/mathhelper";
import { faCircleDot as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faCircleDot as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";

interface IRingNode extends INodeDefinition {
   inputs: {
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      name: string;
      spanMode: SpanMode;
      radius: Length;
      spread: Length;
      spreadAlignMode: SpreadAlignMode;
      innerRadius: Length;
      outerRadius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IRingNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [spreadAlignMode, setSpreadAlignMode] = nodeHelper.useValueState(nodeId, "spreadAlignMode");
   const [spanMode, setSpanMode] = nodeHelper.useValueState(nodeId, "spanMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IRingNode> nodeId={nodeId} helper={RingNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IRingNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Span Mode"}>
            <ToggleList value={spanMode} onValue={setSpanMode} options={SPAN_MODES} />
         </BaseNode.Input>
         <SocketIn<IRingNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || spanMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRingNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || spanMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRingNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || spanMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRingNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || spanMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Spread Align Mode"}>
            <ToggleList value={spreadAlignMode} onValue={setSpreadAlignMode} options={SPREAD_ALIGN_MODES} disabled={spanMode === "inout"} />
         </BaseNode.Input>
         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRingNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Position<IRingNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const spanMode = nodeHelper.useValue(nodeId, "spanMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const spreadAlignMode = nodeHelper.useValue(nodeId, "spreadAlignMode");
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);

   const tIMod =
      spanMode === "inout"
         ? 0
         : spreadAlignMode === "center"
         ? MathHelper.lengthToPx(spread) / 2
         : spreadAlignMode === "inward"
         ? MathHelper.lengthToPx(spread)
         : 0;
   const tOMod =
      spanMode === "inout"
         ? 0
         : spreadAlignMode === "center"
         ? MathHelper.lengthToPx(spread) / 2
         : spreadAlignMode === "outward"
         ? MathHelper.lengthToPx(spread)
         : 0;

   const rI = spanMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - tIMod;
   const rO = spanMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + tOMod;

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)}`}>
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
         >
            <path
               d={`M ${rO},0 A 1,1 0 0,0 ${-rO},0 A 1,1 0 0,0 ${rO},0 M ${rI},0 A 1,1 0 0,1 ${-rI},0 A 1,1 0 0,1 ${rI},0`}
               vectorEffect={"non-scaling-stroke"}
            />
         </g>
      </g>
   );
});

const RingNodeHelper: INodeHelper<IRingNode> = {
   name: "Ring",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_RING,
   getOutput: () => Renderer,
   initialize: () => ({
      name: "",
      radius: { value: 150, unit: "px" },
      spread: { value: 20, unit: "px" },
      spreadAlignMode: "center",
      spanMode: "inout",
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
   }),
   controls: Controls,
};

export default RingNodeHelper;
