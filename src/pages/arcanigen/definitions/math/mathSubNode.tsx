import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faMinus as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMinus as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IMathSubNode extends INodeDefinition {
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

const nodeHelper = ArcaneGraph.nodeHooks<IMathSubNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const aIn = nodeHelper.useInput(nodeId, "aIn");
   const bIn = nodeHelper.useInput(nodeId, "bIn");
   const hasA = nodeHelper.useHasLink(nodeId, "aIn");
   const hasB = nodeHelper.useHasLink(nodeId, "bIn");
   return (
      <>
         <SocketOut<IMathSubNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.NUMBER}>
            Difference ({(hasA ? aIn : a) - (hasB ? bIn : b)})
         </SocketOut>
         <hr />
         <SocketIn<IMathSubNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IMathSubNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"B"}>
               <NumberInput value={hasB ? bIn : b} onValue={setB} disabled={hasB} />
            </BaseNode.Input>
         </SocketIn>
      </>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathSubNode>();

const MathSubNodeHelper: INodeHelper<IMathSubNode> = {
   name: "Subtract",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_SUB,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathSubNode["outputs"]) => {
      const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b");
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a");
      return a - b;
   },
   initialize: () => ({
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathSubNodeHelper;
