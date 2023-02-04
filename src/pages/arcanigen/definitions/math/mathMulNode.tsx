import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faAsterisk as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faAsterisk as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IMathMulNode extends INodeDefinition {
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

const nodeHelper = ArcaneGraph.nodeHooks<IMathMulNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const aIn = nodeHelper.useInput(nodeId, "aIn");
   const bIn = nodeHelper.useInput(nodeId, "bIn");
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   const hasB = nodeHelper.useHasLink(nodeId, "bIn");
   return (
      <>
         <SocketOut<IMathMulNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.NUMBER}>
            Product ({(hasA ? aIn : a) * (hasB ? bIn : b)})
         </SocketOut>
         <hr />
         <SocketIn<IMathMulNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IMathMulNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"B"}>
               <NumberInput value={hasB ? bIn : b} onValue={setB} disabled={hasB} />
            </BaseNode.Input>
         </SocketIn>
      </>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathMulNode>();

const MathMulNodeHelper: INodeHelper<IMathMulNode> = {
   name: "Multiply",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_MUL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathMulNode["outputs"]) => {
      const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b");
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a");
      return a * b;
   },
   initialize: () => ({
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathMulNodeHelper;
