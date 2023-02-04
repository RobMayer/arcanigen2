import { memo } from "react";
import ArcaneGraph from "../graph";
import { INodeDefinition, INodeHelper, NodeRenderer, NodeTypes, SocketTypes } from "../types";
import { faCircle as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faCircle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Color, Length } from "!/utility/types/units";
import MathHelper from "!/utility/mathhelper";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface ICircleNode extends INodeDefinition {
   inputs: {
      radius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      radius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ICircleNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <>
         <SocketOut<ICircleNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Shape
         </SocketOut>
         <hr />
         <SocketIn<ICircleNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput className={"inline small"} value={radius} onChange={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput className={"inline small"} value={strokeWidth} onChange={setStrokeWidth} disabled={hasStrokeWidth} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValidCommit={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ICircleNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValidCommit={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
      </>
   );
});

const Renderer = memo(({ nodeId }: { nodeId: string }) => {
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor");
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor");

   return (
      <circle
         cx={0}
         cy={0}
         r={MathHelper.lengthToPx(radius ?? { value: 100, unit: "px" })}
         stroke={MathHelper.colorToHex(strokeColor, "#000f")}
         fill={MathHelper.colorToHex(fillColor, "transparent")}
         strokeWidth={MathHelper.lengthToPx(strokeWidth ?? { value: 1, unit: "px" })}
      />
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
   }),
   controls: Controls,
};

export default CircleNodeHelper;
