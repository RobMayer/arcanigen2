import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faRuler as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faRuler as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";

interface ILengthValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: Length;
      unitless: number;
      absolute: number;
      pxOut: Length;
      ptOut: Length;
      mmOut: Length;
      cmOut: Length;
      inOut: Length;
   };
   values: {
      value: Length;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ILengthValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");

   return (
      <BaseNode<ILengthValueNode> nodeId={nodeId} helper={LengthValueNodeHelper}>
         <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Value"}>
               <LengthInput value={value} onValidValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
         <BaseNode.Foldout nodeId={nodeId} inputs={""} outputs={"unitless pxOut ptOut mmOut inOut cmOut"} label={"Additional Outputs"}>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"absolute"} type={SocketTypes.NUMBER}>
               Absolute Value
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"unitless"} type={SocketTypes.NUMBER}>
               Unitless Value
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"pxOut"} type={SocketTypes.LENGTH}>
               as px
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"ptOut"} type={SocketTypes.LENGTH}>
               as pt
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"mmOut"} type={SocketTypes.LENGTH}>
               as mm
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"cmOut"} type={SocketTypes.LENGTH}>
               as cm
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"inOut"} type={SocketTypes.LENGTH}>
               as in
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILengthValueNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILengthValueNode["outputs"]) => {
   const v = nodeMethods.getValue(graph, nodeId, "value");
   switch (socket) {
      case "value":
         return v;
      case "unitless":
         return v.value;
      case "absolute":
         return MathHelper.lengthToPx(v);
      case "pxOut":
         return MathHelper.convertLength(v, "px");
      case "ptOut":
         return MathHelper.convertLength(v, "pt");
      case "mmOut":
         return MathHelper.convertLength(v, "mm");
      case "cmOut":
         return MathHelper.convertLength(v, "cm");
      case "inOut":
         return MathHelper.convertLength(v, "in");
   }
};

const LengthValueNodeHelper: INodeHelper<ILengthValueNode> = {
   name: "Length",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.VALUE_LENGTH,
   getOutput,
   initialize: () => ({
      value: { value: 1, unit: "px" },
   }),
   controls: Controls,
};

export default LengthValueNodeHelper;
