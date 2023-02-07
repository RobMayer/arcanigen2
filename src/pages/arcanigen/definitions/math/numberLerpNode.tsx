import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, Sequence, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import NumberInput from "!/components/inputs/NumberInput";

interface INumberLerpNode extends INodeDefinition {
   inputs: {
      from: number;
      to: number;
      start: number;
      end: number;
      interval: number;
      sequence: Sequence;
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

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [start, setStart] = nodeHelper.useValueState(nodeId, "start");
   const [end, setEnd] = nodeHelper.useValueState(nodeId, "end");
   const [interval, setInterval] = nodeHelper.useValueState(nodeId, "interval");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");

   return (
      <BaseNode<INumberLerpNode> nodeId={nodeId} helper={NumberLerpNodeHelper}>
         <SocketOut<INumberLerpNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Output label={"Value"}>0</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<INumberLerpNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"From"}>
               <NumberInput value={from} onValidValue={setFrom} disabled={hasSequence} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<INumberLerpNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"To"}>
               <NumberInput value={to} onValidValue={setTo} disabled={hasSequence} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
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

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof INumberLerpNode["outputs"]) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence");

   const interval = nodeMethods.coalesce(graph, nodeId, "interval", "interval");
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from");
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to");
   const start = nodeMethods.coalesce(graph, nodeId, "start", "start");
   const end = nodeMethods.coalesce(graph, nodeId, "end", "end");

   if (sequence) {
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
