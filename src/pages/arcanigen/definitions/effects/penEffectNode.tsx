import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faPenAlt as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPenAlt as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import MathHelper from "!/utility/mathhelper";

interface IPenEffectNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      nib: Length;
      seed: number;
      smudge: number;
      jitter: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      nib: Length;
      seed: number;
      smudge: number;
      jitter: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IPenEffectNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [nib, setNib] = nodeHelper.useValueState(nodeId, "nib");
   const [seed, setSeed] = nodeHelper.useValueState(nodeId, "seed");
   const [smudge, setSmudge] = nodeHelper.useValueState(nodeId, "smudge");
   const [jitter, setJitter] = nodeHelper.useValueState(nodeId, "jitter");

   const hasNib = nodeHelper.useHasLink(nodeId, "nib");
   const hasSeed = nodeHelper.useHasLink(nodeId, "seed");
   const hasSmudge = nodeHelper.useHasLink(nodeId, "smudge");
   const hasJitter = nodeHelper.useHasLink(nodeId, "jitter");

   return (
      <BaseNode<IPenEffectNode> nodeId={nodeId} helper={PenEffectNodeHelper}>
         <SocketOut<IPenEffectNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPenEffectNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IPenEffectNode> nodeId={nodeId} socketId={"nib"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Pen Nib"}>
               <LengthInput value={nib} onValidValue={setNib} disabled={hasNib} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPenEffectNode> nodeId={nodeId} socketId={"smudge"} type={SocketTypes.INTERVAL}>
            <BaseNode.Input label={"Smudge"}>
               <NumberInput value={smudge} onValidValue={setSmudge} disabled={hasSmudge} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPenEffectNode> nodeId={nodeId} socketId={"jitter"} type={SocketTypes.INTERVAL}>
            <BaseNode.Input label={"Jitter"}>
               <NumberInput value={jitter} onValidValue={setJitter} disabled={hasJitter} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPenEffectNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Random Seed"}>
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} step={1} min={0} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, sequenceData }: NodeRendererProps) => {
   const seed = nodeHelper.useCoalesce(nodeId, "seed", "seed");
   const nib = nodeHelper.useCoalesce(nodeId, "nib", "nib");
   const smudge = nodeHelper.useCoalesce(nodeId, "smudge", "smudge");
   const jitter = nodeHelper.useCoalesce(nodeId, "jitter", "jitter");
   const [Content, cId] = nodeHelper.useInputNode(nodeId, "input");

   return (
      <>
         <g>
            <filter id={`effect_${nodeId}_lyr-${depth ?? ""}`} filterUnits={"userSpaceOnUse"} x={"-100%"} y={"-100%"} width={"200%"} height={"200%"}>
               <feTurbulence type="fractalNoise" baseFrequency={1} numOctaves="20" result="fractal" seed={seed} stitchTiles="stitch" />
               <feGaussianBlur stdDeviation={0.75} result="fractal" />
               <feMorphology in="SourceGraphic" radius={MathHelper.lengthToPx(nib) / 4} operator="dilate" />
               <feDisplacementMap in2="fractal" scale={5 + jitter * 15} xChannelSelector="R" yChannelSelector="G" />
               <feGaussianBlur stdDeviation={smudge} result="fractal" />
               <feMorphology radius={MathHelper.lengthToPx(nib) / 4} operator="erode" />
               <feBlend in2="SourceGraphic" />
            </filter>
            <g filter={`url('#effect_${nodeId}_lyr-${depth ?? ""}')`}>
               {Content && cId && <Content sequenceData={sequenceData} nodeId={cId} depth={(depth ?? "") + `_${nodeId}`} />}
            </g>
         </g>
      </>
   );
});

const PenEffectNodeHelper: INodeHelper<IPenEffectNode> = {
   name: "Pen Stroke",
   buttonIcon,
   nodeIcon,
   flavour: "info",
   type: NodeTypes.EFFECT_PEN,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPenEffectNode["outputs"]) => Renderer,
   initialize: () => ({
      seed: Math.floor(Math.random() * 1000),
      smudge: 0.2,
      jitter: 0.5,
      nib: { value: 2, unit: "pt" },
   }),
   controls: Controls,
};

export default PenEffectNodeHelper;
