import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Curve, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, Sequence, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import { Length } from "!/utility/types/units";
import LengthInput from "!/components/inputs/LengthInput";
import Checkbox from "!/components/buttons/Checkbox";
import TextInput from "!/components/inputs/TextInput";

interface ILerpLengthNode extends INodeDefinition {
   inputs: {
      from: Length;
      to: Length;
      percent: number;
      sequence: Sequence;
      distribution: Curve;
   };
   outputs: {
      value: Length;
   };
   values: {
      name: string;
      from: Length;
      to: Length;
      percent: number;
      isInclusive: boolean;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ILerpLengthNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [percent, setPercent] = nodeHelper.useValueState(nodeId, "percent");
   const [isInclusive, setIsInclusive] = nodeHelper.useValueState(nodeId, "isInclusive");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");

   return (
      <BaseNode<ILerpLengthNode> nodeId={nodeId} helper={LerpLengthNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<ILerpLengthNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.LENGTH}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<ILerpLengthNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<ILerpLengthNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"From"}>
               <LengthInput value={from} onValidValue={setFrom} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ILerpLengthNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"To"}>
               <LengthInput value={to} onValidValue={setTo} />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={isInclusive} onToggle={setIsInclusive} disabled={!hasSequence}>
            Inclusive
         </Checkbox>
         <hr />
         <SocketIn<ILerpLengthNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<ILerpLengthNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Percent"}>
               <SliderInput value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILerpLengthNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILerpLengthNode["outputs"], globals: Globals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const percent = nodeMethods.coalesce(graph, nodeId, "percent", "percent", globals);
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);
   const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);

   const isInclusive = nodeMethods.getValue(graph, nodeId, "isInclusive");

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max - (isInclusive ? 1 : 0));
      return {
         value: MathHelper.lerp(t, MathHelper.lengthToPx(from), MathHelper.lengthToPx(to), distribution),
         unit: "px",
      } as Length;
   }
   return {
      value: MathHelper.lerp(MathHelper.clamp(percent, 0, 1), MathHelper.lengthToPx(from), MathHelper.lengthToPx(to), distribution),
      unit: "px",
   } as Length;

   //TODO: How do I get sequence data from here?!?
};

const LerpLengthNodeHelper: INodeHelper<ILerpLengthNode> = {
   name: "Length Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_LENGTH,
   getOutput,
   initialize: () => ({
      name: "",
      from: { value: 0, unit: "px" },
      to: { value: 1, unit: "px" },
      percent: 0,
      isInclusive: true,
   }),
   controls: Controls,
};

export default LerpLengthNodeHelper;
