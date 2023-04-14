import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faMinus as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMinus as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import TextInput from "!/components/inputs/TextInput";

interface IMathSubNode extends INodeDefinition {
   inputs: {
      aIn: number;
      bIn: number;
   };
   outputs: {
      result: number;
   };
   values: {
      name: string;
      a: number;
      b: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IMathSubNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const aIn = nodeHelper.useInput(nodeId, "aIn", globals);
   const bIn = nodeHelper.useInput(nodeId, "bIn", globals);
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   const hasB = nodeHelper.useHasLink(nodeId, "bIn");
   return (
      <BaseNode<IMathSubNode> nodeId={nodeId} helper={MathSubNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IMathSubNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
            <BaseNode.Output label={"Result"}>{(hasA ? aIn : a) - (hasB ? bIn : b)}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IMathSubNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IMathSubNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"B"}>
               <NumberInput value={hasB ? bIn : b} onValidValue={setB} disabled={hasB} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathSubNode>();

const MathSubNodeHelper: INodeHelper<IMathSubNode> = {
   name: "Subtract",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_SUB,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathSubNode["outputs"], globals: Globals) => {
      const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals);
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
      return a - b;
   },
   initialize: () => ({
      name: "",
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathSubNodeHelper;
