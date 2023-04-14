import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faBrush as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faBrush as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import TextInput from "!/components/inputs/TextInput";

interface IBrushEffectNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      brushTip: Length;
      seed: number;
      shake: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      name: string;
      brushTip: Length;
      seed: number;
      shake: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IBrushEffectNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [brushTip, setBrushTip] = nodeHelper.useValueState(nodeId, "brushTip");
   const [seed, setSeed] = nodeHelper.useValueState(nodeId, "seed");
   const [shake, setShake] = nodeHelper.useValueState(nodeId, "shake");

   const hasBrushTip = nodeHelper.useHasLink(nodeId, "brushTip");
   const hasSeed = nodeHelper.useHasLink(nodeId, "seed");
   const hasShake = nodeHelper.useHasLink(nodeId, "shake");

   return (
      <BaseNode<IBrushEffectNode> nodeId={nodeId} helper={BrushEffectNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IBrushEffectNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IBrushEffectNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IBrushEffectNode> nodeId={nodeId} socketId={"brushTip"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Brush Tip"}>
               <LengthInput value={brushTip} onValidValue={setBrushTip} disabled={hasBrushTip} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBrushEffectNode> nodeId={nodeId} socketId={"shake"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Shake"}>
               <NumberInput value={shake} onValidValue={setShake} disabled={hasShake} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBrushEffectNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Random Seed"}>
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} step={1} min={0} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const seed = nodeHelper.useCoalesce(nodeId, "seed", "seed", globals);
   const brushTip = nodeHelper.useCoalesce(nodeId, "brushTip", "brushTip", globals);
   const shake = nodeHelper.useCoalesce(nodeId, "shake", "shake", globals);
   const [Content, cId] = nodeHelper.useInputNode(nodeId, "input", globals);

   return (
      <>
         <g>
            <filter id={`effect_${nodeId}_lyr-${depth ?? ""}`} filterUnits={"userSpaceOnUse"} x={"-100%"} y={"-100%"} width={"200%"} height={"200%"}>
               <feGaussianBlur stdDeviation="0.5" />
               <feColorMatrix result="out_prime" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />

               <feTurbulence type="fractalNoise" baseFrequency={0.01} numOctaves="1" seed={seed} result="fractal1" />
               <feTurbulence type="fractalNoise" baseFrequency={0.02} numOctaves="1" seed={seed + 900} result="fractal2" />
               <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves="1" seed={seed + 15007} result="fractal3" />

               <feDisplacementMap in="SourceGraphic" in2="fractal1" scale={shake * 10} xChannelSelector="G" yChannelSelector="R" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="dilate" />
               <feGaussianBlur stdDeviation="0.5" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="erode" />
               <feColorMatrix result="out_1" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />
               <feDisplacementMap in="SourceGraphic" in2="fractal2" scale={shake * 10} xChannelSelector="B" yChannelSelector="G" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="dilate" />
               <feGaussianBlur stdDeviation="0.5" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="erode" />
               <feColorMatrix result="out_2" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />
               <feDisplacementMap in="SourceGraphic" in2="fractal3" scale={shake * 10} xChannelSelector="G" yChannelSelector="R" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="dilate" />
               <feGaussianBlur stdDeviation="0.5" />
               <feMorphology radius={MathHelper.lengthToPx(brushTip) / 4} operator="erode" />
               <feColorMatrix result="out_3" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />
               <feBlend in2="out_1" mode="multiply" />
               <feBlend in2="out_2" mode="multiply" />
               <feBlend in2="out_prime" mode="multiply" />
            </filter>
            <g filter={`url('#effect_${nodeId}_lyr-${depth ?? ""}')`}>
               {Content && cId && <Content nodeId={cId} depth={(depth ?? "") + `_${nodeId}`} globals={globals} overrides={overrides} />}
            </g>
         </g>
      </>
   );
});

const BrushEffectNodeHelper: INodeHelper<IBrushEffectNode> = {
   name: "Brush Stroke",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.EFFECT_BRUSH,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IBrushEffectNode["outputs"]) => Renderer,
   initialize: () => ({
      name: "",
      seed: Math.floor(Math.random() * 1000),
      shake: 0.2,
      brushTip: { value: 2, unit: "pt" },
   }),
   controls: Controls,
};

export default BrushEffectNodeHelper;
