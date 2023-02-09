import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, PositionMode, SocketTypes } from "../types";
import { faCircle as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faCircle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Color, Length } from "!/utility/types/units";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface ICircleNode extends INodeDefinition {
   inputs: {
      radius: Length;
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
      radius: Length;
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

const nodeHelper = ArcaneGraph.nodeHooks<ICircleNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<ICircleNode> nodeId={nodeId} helper={CircleNodeHelper}>
         <SocketOut<ICircleNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<ICircleNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Position<ICircleNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)}` }}>
         <g
            stroke={MathHelper.colorToHTML(strokeColor, "#000f")}
            fill={MathHelper.colorToHTML(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth ?? { value: 1, unit: "px" }))}
         >
            <circle cx={0} cy={0} r={Math.max(0, MathHelper.lengthToPx(radius ?? { value: 100, unit: "px" }))} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const CircleNodeHelper: INodeHelper<ICircleNode> = {
   name: "Circle",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_CIRCLE,
   getOutput: () => Renderer,
   initialize: () => ({
      radius: { value: 100, unit: "px" },
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

export default CircleNodeHelper;
