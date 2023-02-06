import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faPencilAlt as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPencilAlt as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IPencilEffectNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      seed: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      seed: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IPencilEffectNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [seed, setSeed] = nodeHelper.useValueState(nodeId, "seed");

   const hasSeed = nodeHelper.useHasLink(nodeId, "seed");

   return (
      <BaseNode<IPencilEffectNode> nodeId={nodeId} helper={PencilEffectNodeHelper}>
         <SocketOut<IPencilEffectNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPencilEffectNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IPencilEffectNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Random Seed"}>
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} step={1} min={0} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, sequenceData }: NodeRendererProps) => {
   const seed = nodeHelper.useCoalesce(nodeId, "seed", "seed");
   const [Content, cId] = nodeHelper.useInputNode(nodeId, "input");

   return (
      <>
         <g>
            <filter id={`effect_${nodeId}_lyr-${depth ?? ""}`} filterUnits={"userSpaceOnUse"} x={"-100%"} y={"-100%"} width={"200%"} height={"200%"}>
               <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="8" stitchTiles="stitch" result="f1" seed={seed} />
               <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 1.5" result="f2" />
               <feComposite operator="in" in2="f2" in="SourceGraphic" result="f3" />
               <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" seed={seed + 500} />
               <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="2.5" in="f3" result="f4" />
            </filter>
            <g filter={`url('#effect_${nodeId}_lyr-${depth ?? ""}')`}>
               {Content && cId && <Content sequenceData={sequenceData} nodeId={cId} depth={(depth ?? "") + `_${nodeId}`} />}
            </g>
         </g>
      </>
   );
});

const PencilEffectNodeHelper: INodeHelper<IPencilEffectNode> = {
   name: "Pencil",
   buttonIcon,
   nodeIcon,
   flavour: "info",
   type: NodeTypes.EFFECT_PENCIL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPencilEffectNode["outputs"]) => Renderer,
   initialize: () => ({
      seed: Math.floor(Math.random() * 1000),
   }),
   controls: Controls,
};

export default PencilEffectNodeHelper;
