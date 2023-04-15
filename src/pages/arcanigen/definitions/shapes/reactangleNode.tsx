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
   STROKECAP_MODES,
   SocketTypes,
   StrokeCapMode,
} from "../types";
import { faSquare as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faSquare as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Color, Length } from "!/utility/types/units";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";
import ToggleList from "!/components/selectors/ToggleList";

interface IRectangleNode extends INodeDefinition {
   inputs: {
      width: Length;
      height: Length;
      corner: Length;
      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;
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
      width: Length;
      height: Length;
      corner: Length;
      strokeWidth: Length;
      strokeColor: Color;
      strokeCap: StrokeCapMode;
      strokeDash: string;
      strokeOffset: Length;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IRectangleNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [width, setWidth] = nodeHooks.useValueState(nodeId, "width");
   const [height, setHeight] = nodeHooks.useValueState(nodeId, "height");
   const [corner, setCorner] = nodeHooks.useValueState(nodeId, "corner");
   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const hasWidth = nodeHooks.useHasLink(nodeId, "width");
   const hasHeight = nodeHooks.useHasLink(nodeId, "height");
   const hasCorner = nodeHooks.useHasLink(nodeId, "corner");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IRectangleNode> nodeId={nodeId} helper={RectangleNodeHelper} hooks={nodeHooks}>
         <SocketOut<IRectangleNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"width"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Width"}>
               <LengthInput value={width} onValidValue={setWidth} disabled={hasWidth} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"height"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Height"}>
               <LengthInput value={height} onValidValue={setHeight} disabled={hasHeight} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"corner"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"corner"}>
               <LengthInput value={corner} onValidValue={setCorner} disabled={hasCorner} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor strokeOffset fillColor"} outputs={""}>
            <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} disabled={strokeDash === ""} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IRectangleNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Position<IRectangleNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const width = nodeHooks.useCoalesce(nodeId, "width", "width", globals);
   const height = nodeHooks.useCoalesce(nodeId, "height", "height", globals);
   const corner = nodeHooks.useCoalesce(nodeId, "corner", "corner", globals);
   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
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

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)}`}>
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
            strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
               .map(MathHelper.lengthToPx)
               .join(" ")}
         >
            <rect
               x={Math.max(0, MathHelper.lengthToPx(width ?? { value: 100, unit: "px" })) / -2}
               y={Math.max(0, MathHelper.lengthToPx(height ?? { value: 100, unit: "px" })) / -2}
               width={Math.max(0, MathHelper.lengthToPx(width ?? { value: 100, unit: "px" }))}
               rx={Math.max(0, MathHelper.lengthToPx(corner ?? { value: 0, unit: "px" }))}
               height={Math.max(0, MathHelper.lengthToPx(height ?? { value: 100, unit: "px" }))}
               vectorEffect={"non-scaling-stroke"}
            />
         </g>
      </g>
   );
});

const RectangleNodeHelper: INodeHelper<IRectangleNode> = {
   name: "Rectangle",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_RECTANGLE,
   getOutput: () => Renderer,
   initialize: () => ({
      width: { value: 100, unit: "px" },
      height: { value: 100, unit: "px" },
      corner: { value: 0, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: "butt",
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

export default RectangleNodeHelper;
