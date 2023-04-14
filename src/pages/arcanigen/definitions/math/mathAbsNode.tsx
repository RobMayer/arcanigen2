import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faValueAbsolute as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faValueAbsolute as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import TextInput from "!/components/inputs/TextInput";

interface IMathAbsNode extends INodeDefinition {
   inputs: {
      aIn: number;
   };
   outputs: {
      result: number;
   };
   values: {
      name: string;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IMathAbsNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const aIn = nodeHelper.useInput(nodeId, "aIn", globals);
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   return (
      <BaseNode<IMathAbsNode> nodeId={nodeId} helper={MathAbsNodeHelper}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IMathAbsNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
            <BaseNode.Output label={"Result"}>{hasA ? aIn : a}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IMathAbsNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathAbsNode>();

const MathAbsNodeHelper: INodeHelper<IMathAbsNode> = {
   name: "Absolute",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_ABS,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathAbsNode["outputs"], globals: Globals) => {
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
      return Math.abs(a);
   },
   initialize: () => ({
      name: "",
      a: 0,
   }),
   controls: Controls,
};

export default MathAbsNodeHelper;
