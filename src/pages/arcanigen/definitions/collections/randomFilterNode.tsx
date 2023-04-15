import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faFilter as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faFilter as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import MathHelper from "!/utility/mathhelper";
import SliderInput from "!/components/inputs/SliderInput";
import NumberInput from "!/components/inputs/NumberInput";

interface IRandomFilterNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      seed: number;
      threshold: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      seed: number;
      threshold: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IRandomFilterNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [seed, setSeed] = nodeHooks.useValueState(nodeId, "seed");
   const [threshold, setThreshold] = nodeHooks.useValueState(nodeId, "threshold");

   const hasSeed = nodeHooks.useHasLink(nodeId, "seed");
   const hasThreshold = nodeHooks.useHasLink(nodeId, "threshold");

   return (
      <BaseNode<IRandomFilterNode> nodeId={nodeId} helper={RandomFilterNodeHelper} hooks={nodeHooks}>
         <SocketOut<IRandomFilterNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IRandomFilterNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IRandomFilterNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Seed"}>
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IRandomFilterNode> nodeId={nodeId} socketId={"threshold"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Threshold"}>
               <SliderInput value={threshold} onValidValue={setThreshold} disabled={hasThreshold} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const [Content, cId] = nodeHooks.useInputNode(nodeId, "input", globals);
   const seed = nodeHooks.useCoalesce(nodeId, "seed", "seed", globals);
   const threshold = nodeHooks.useCoalesce(nodeId, "threshold", "threshold", globals);

   const sRand = MathHelper.seededRandom(seed);

   const newGlobals = useMemo(() => {
      return {
         ...globals,
         filterData: {
            threshold: MathHelper.clamp(threshold, 0, 1),
            discriminator: sRand,
         },
      };
   }, [threshold, globals, sRand]);

   return (
      <>
         <g>{Content && cId && <Content nodeId={cId} depth={(depth ?? "") + `_${nodeId}.content`} globals={newGlobals} overrides={overrides} />}</g>
      </>
   );
});

const RandomFilterNodeHelper: INodeHelper<IRandomFilterNode> = {
   name: "Random Filter",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.COL_RANDOM_FILTER,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IRandomFilterNode["outputs"]) => Renderer,
   initialize: () => ({
      seed: Math.floor(Math.random() * 10000),
      threshold: 1.0,
   }),
   controls: Controls,
};

export default RandomFilterNodeHelper;
