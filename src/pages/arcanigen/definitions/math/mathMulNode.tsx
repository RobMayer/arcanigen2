import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faAsterisk as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faAsterisk as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import TextInput from "!/components/inputs/TextInput";

interface IMathMulNode extends INodeDefinition {
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

const nodeHelper = ArcaneGraph.nodeHooks<IMathMulNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const aIn = nodeHelper.useInput(nodeId, "aIn", globals);
   const bIn = nodeHelper.useInput(nodeId, "bIn", globals);
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   const hasB = nodeHelper.useHasLink(nodeId, "bIn");
   return (
      <BaseNode<IMathMulNode> nodeId={nodeId} helper={MathMulNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IMathMulNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
            <BaseNode.Output label={"Result"}>{(hasA ? aIn : a) * (hasB ? bIn : b)}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IMathMulNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IMathMulNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"B"}>
               <NumberInput value={hasB ? bIn : b} onValidValue={setB} disabled={hasB} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathMulNode>();

const MathMulNodeHelper: INodeHelper<IMathMulNode> = {
   name: "Multiply",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_MUL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathMulNode["outputs"], globals: Globals) => {
      const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals);
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
      return a * b;
   },
   initialize: () => ({
      name: "",
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathMulNodeHelper;
