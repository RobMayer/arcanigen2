import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Curve, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, Sequence, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import NumberInput from "!/components/inputs/NumberInput";
import SliderInput from "!/components/inputs/SliderInput";
import Checkbox from "!/components/buttons/Checkbox";
import { MetaPrefab } from "../../nodeView/prefabs";

interface ILerpNumberNode extends INodeDefinition {
   inputs: {
      from: number;
      to: number;
      percent: number;
      sequence: Sequence;
      distribution: Curve;
   };
   outputs: {
      value: number;
   };
   values: {
      from: number;
      to: number;
      percent: number;
      isInclusive: boolean;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ILerpNumberNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [from, setFrom] = nodeHooks.useValueState(nodeId, "from");
   const [to, setTo] = nodeHooks.useValueState(nodeId, "to");
   const [percent, setPercent] = nodeHooks.useValueState(nodeId, "percent");
   const [isInclusive, setIsInclusive] = nodeHooks.useValueState(nodeId, "isInclusive");

   const hasSequence = nodeHooks.useHasLink(nodeId, "sequence");

   return (
      <BaseNode<ILerpNumberNode> nodeId={nodeId} helper={LerpNumberNodeHelper} hooks={nodeHooks}>
         <SocketOut<ILerpNumberNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            Value
         </SocketOut>
         <hr />
         <SocketIn<ILerpNumberNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<ILerpNumberNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"From"}>
               <NumberInput value={from} onValidValue={setFrom} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ILerpNumberNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"To"}>
               <NumberInput value={to} onValidValue={setTo} />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={isInclusive} onToggle={setIsInclusive} disabled={!hasSequence}>
            Inclusive
         </Checkbox>
         <hr />
         <SocketIn<ILerpNumberNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<ILerpNumberNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Percent"}>
               <SliderInput value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILerpNumberNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILerpNumberNode["outputs"], globals: Globals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const percent = nodeMethods.coalesce(graph, nodeId, "percent", "percent", globals);
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);
   const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);
   const isInclusive = nodeMethods.getValue(graph, nodeId, "isInclusive");

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max - (isInclusive ? 1 : 0));
      return MathHelper.lerp(t, from, to, distribution);
   }

   return MathHelper.lerp(MathHelper.clamp(percent, 0, 1), from, to);

   //TODO: How do I get sequence data from here?!?
};

const LerpNumberNodeHelper: INodeHelper<ILerpNumberNode> = {
   name: "Number Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_NUMBER,
   getOutput,
   initialize: () => ({
      from: 0,
      to: 1,
      percent: 0,
      isInclusive: true,
   }),
   controls: Controls,
};

export default LerpNumberNodeHelper;
