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
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ILerpNumberNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [percent, setPercent] = nodeHelper.useValueState(nodeId, "percent");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");

   return (
      <BaseNode<ILerpNumberNode> nodeId={nodeId} helper={LerpNumberNodeHelper}>
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
         <hr />
         <SocketIn<ILerpNumberNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<ILerpNumberNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Percent"}>
               <SliderInput value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
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

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max);
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
   }),
   controls: Controls,
};

export default LerpNumberNodeHelper;
