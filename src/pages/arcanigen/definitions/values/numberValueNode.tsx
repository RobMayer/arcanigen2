import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";
import { faHashtag as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faHashtag as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import NumberInput from "!/components/inputs/NumberInput";

interface INumberValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: number;
   };
   values: {
      value: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<INumberValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");

   return (
      <BaseNode<INumberValueNode> nodeId={nodeId} helper={NumberValueNodeHelper}>
         <SocketOut<INumberValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"Value"}>
               <NumberInput value={value} onValidValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<INumberValueNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof INumberValueNode["outputs"]) => {
   return nodeMethods.getValue(graph, nodeId, "value");
};

const NumberValueNodeHelper: INodeHelper<INumberValueNode> = {
   name: "Number",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_NUMBER,
   getOutput,
   initialize: () => ({
      value: 0,
   }),
   controls: Controls,
};

export default NumberValueNodeHelper;
