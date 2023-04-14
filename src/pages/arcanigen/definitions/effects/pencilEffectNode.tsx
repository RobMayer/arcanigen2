import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faPencilAlt as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPencilAlt as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import NumberInput from "!/components/inputs/NumberInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";

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

const nodeHooks = ArcaneGraph.nodeHooks<IPencilEffectNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [seed, setSeed] = nodeHooks.useValueState(nodeId, "seed");

   const hasSeed = nodeHooks.useHasLink(nodeId, "seed");

   return (
      <BaseNode<IPencilEffectNode> nodeId={nodeId} helper={PencilEffectNodeHelper} hooks={nodeHooks}>
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
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const seed = nodeHooks.useCoalesce(nodeId, "seed", "seed", globals);
   const [Content, cId] = nodeHooks.useInputNode(nodeId, "input", globals);

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
               {Content && cId && <Content globals={globals} nodeId={cId} depth={(depth ?? "") + `_${nodeId}`} overrides={overrides} />}
            </g>
         </g>
      </>
   );
});

const PencilEffectNodeHelper: INodeHelper<IPencilEffectNode> = {
   name: "Pencil",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.EFFECT_PENCIL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPencilEffectNode["outputs"]) => Renderer,
   initialize: () => ({
      seed: Math.floor(Math.random() * 1000),
   }),
   controls: Controls,
};

export default PencilEffectNodeHelper;
