import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { faWaveSine as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faWaveSine as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IMathAcosNode extends INodeDefinition {
   inputs: {
      aIn: number;
   };
   outputs: {
      result: number;
   };
   values: {
      a: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IMathAcosNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [a, setA] = nodeHooks.useValueState(nodeId, "a");
   const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
   const hasA = nodeHooks.useHasLink(nodeId, "aIn");
   return (
      <BaseNode<IMathAcosNode> nodeId={nodeId} helper={MathACosNodeHelper} hooks={nodeHooks}>
         <SocketOut<IMathAcosNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
            <BaseNode.Output label={"Result"}>{Math.acos((hasA ? aIn : a) ?? 0)}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IMathAcosNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"A"}>
               <NumberInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathAcosNode>();

const MathACosNodeHelper: INodeHelper<IMathAcosNode> = {
   name: "Arc Cosine",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_ACOS,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathAcosNode["outputs"], globals: GraphGlobals) => {
      const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
      return Math.acos(a);
   },
   initialize: () => ({
      a: 0,
      b: 0,
   }),
   controls: Controls,
};

export default MathACosNodeHelper;
