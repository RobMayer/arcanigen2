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
      numeric: number;
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
         <BaseNode.Foldout nodeId={nodeId} inputs={""} outputs={"unitless numeric"} label={"Additional Outputs"}>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"numeric"} type={SocketTypes.FLOAT}>
               Numeric Value
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"unitless"} type={SocketTypes.FLOAT}>
               Unitless Value
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
      case "numeric":
         return MathHelper.lengthToPx(v);
   }
};

const LengthValueNodeHelper: INodeHelper<ILengthValueNode> = {
   name: "Length",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_LENGTH,
   getOutput,
   initialize: () => ({
      value: { value: 1, unit: "px" },
   }),
   controls: Controls,
};

export default LengthValueNodeHelper;
