import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faDivide as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faDivide as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IMathDivNode extends INodeDefinition {
   inputs: {
      aIn: number;
      bIn: number;
   };
   outputs: {
      result: number;
   };
   values: {
      a: number;
      b: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IMathDivNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const aIn = nodeHelper.useInput(nodeId, "aIn", globals);
   const bIn = nodeHelper.useInput(nodeId, "bIn", globals);
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   const hasB = nodeHelper.useHasLink(nodeId, "bIn");
   return (
      <BaseNode<IMathDivNode> nodeId={nodeId} helper={MathDivNodeHelper}>
         <SocketOut<IMathDivNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
            <BaseNode.Output label={"Result"}>{(hasB ? bIn : b) === 0 ? 0 : (hasA ? aIn : a) / (hasB ? bIn : b)}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IMathDivNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IMathDivNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"B"}>
               <NumberInput value={hasB ? bIn : b} onValidValue={setB} disabled={hasB} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathDivNode>();

const MathDivNodeHelper: INodeHelper<IMathDivNode> = {
   name: "Divide",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_DIV,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathDivNode["outputs"], globals: Globals) => {
      const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals);
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
      return b === 0 ? 0 : a / b;
   },
   initialize: () => ({
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathDivNodeHelper;
