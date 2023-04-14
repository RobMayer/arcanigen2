import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";
import { faHashtag as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faHashtag as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import NumberInput from "!/components/inputs/NumberInput";
import TextInput from "!/components/inputs/TextInput";

interface INumberValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: number;
   };
   values: {
      name: string;
      value: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<INumberValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");

   return (
      <BaseNode<INumberValueNode> nodeId={nodeId} helper={NumberValueNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
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
      name: "",
      value: 0,
   }),
   controls: Controls,
};

export default NumberValueNodeHelper;
