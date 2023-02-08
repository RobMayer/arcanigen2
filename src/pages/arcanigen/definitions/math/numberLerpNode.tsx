import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Curve, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, Sequence, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faExclamationCircle, faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import NumberInput from "!/components/inputs/NumberInput";
import Icon from "!/components/icons";
import styled from "styled-components";

interface INumberLerpNode extends INodeDefinition {
   inputs: {
      from: number;
      to: number;
      start: number;
      end: number;
      interval: number;
      sequence: Sequence;
      distribution: Curve;
   };
   outputs: {
      value: number;
   };
   values: {
      from: number;
      to: number;
      start: number;
      end: number;
      interval: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<INumberLerpNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [start, setStart] = nodeHelper.useValueState(nodeId, "start");
   const [end, setEnd] = nodeHelper.useValueState(nodeId, "end");
   const [interval, setInterval] = nodeHelper.useValueState(nodeId, "interval");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");

   return (
      <BaseNode<INumberLerpNode> nodeId={nodeId} helper={NumberLerpNodeHelper}>
         <SocketOut<INumberLerpNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Output label={"Value"}>
               {hasSequence ? (
                  <Warning title={"This will be calculated during the render"}>
                     <Icon icon={faExclamationCircle} />
                     Varies
                  </Warning>
               ) : (
                  interval
               )}
            </BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<INumberLerpNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"From"}>
               <NumberInput value={from} onValidValue={setFrom} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"To"}>
               <NumberInput value={to} onValidValue={setTo} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<INumberLerpNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"start"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"Start"}>
               <NumberInput value={start} onValidValue={setStart} disabled={hasSequence} max={end} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"interval"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"Interval"}>
               <NumberInput value={interval} onValidValue={setInterval} disabled={hasSequence} min={start} max={end} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"end"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"End"}>
               <NumberInput value={end} onValidValue={setEnd} disabled={hasSequence} min={start} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<INumberLerpNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof INumberLerpNode["outputs"], globals: Globals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const interval = nodeMethods.coalesce(graph, nodeId, "interval", "interval", globals);
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);
   const start = nodeMethods.coalesce(graph, nodeId, "start", "start", globals);
   const end = nodeMethods.coalesce(graph, nodeId, "end", "end", globals);
   const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max);
      return MathHelper.lerp(t, from, to, distribution);
   }

   const t = MathHelper.delerp(interval, start, end);
   return MathHelper.lerp(t, from, to);

   //TODO: How do I get sequence data from here?!?
};

const NumberLerpNodeHelper: INodeHelper<INumberLerpNode> = {
   name: "Number Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_NUMBER,
   getOutput,
   initialize: () => ({
      from: 0,
      to: 1,
      start: 0,
      end: 1,
      interval: 0,
   }),
   controls: Controls,
};

export default NumberLerpNodeHelper;

const Warning = styled.div`
   display: grid;
   grid-template-columns: auto 1fr;
   align-items: center;
   gap: 0.5em;
   color: var(--danger-icon);
   cursor: default;
`;
