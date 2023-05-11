import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, Sequence } from "../types";

import { faRepeat as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faRepeat as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import SliderInput from "!/components/inputs/SliderInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IRepeatArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      iterationCount: number;
   };
   outputs: {
      output: NodeRenderer;
      sequence: Sequence;
   };
   values: {
      iterationCount: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IRepeatArrayNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [iterationCount, setIterationCount] = nodeHooks.useValueState(nodeId, "iterationCount");

   const hasIterationCount = nodeHooks.useHasLink(nodeId, "iterationCount");

   return (
      <BaseNode<IRepeatArrayNode> nodeId={nodeId} helper={RepeatArrayNodeHelper} hooks={nodeHooks}>
         <SocketOut<IRepeatArrayNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IRepeatArrayNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IRepeatArrayNode> nodeId={nodeId} socketId={"iterationCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Iteration Count"}>
               <SliderInput revertInvalid value={iterationCount} onValidValue={setIterationCount} min={1} max={64} step={1} disabled={hasIterationCount} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketOut<IRepeatArrayNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketOut>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const [output, childNodeId] = nodeHooks.useInputNode(nodeId, "input", globals);
   const iterationCount = nodeHooks.useCoalesce(nodeId, "iterationCount", "iterationCount", globals);

   const children = useMemo(() => {
      return lodash.range(iterationCount).map((n, i) => {
         return (
            <g key={i}>
               {output && childNodeId && (
                  <Each overrides={overrides} output={output} host={nodeId} globals={globals} nodeId={childNodeId} depth={depth} index={i} />
               )}
            </g>
         );
      });
   }, [childNodeId, depth, globals, iterationCount, nodeId, output, overrides]);

   return <g>{children}</g>;
});

const Each = ({
   nodeId,
   globals,
   depth,
   index,
   host,
   output: Output,
   overrides,
}: NodeRendererProps & { index: number; host: string; output: NodeRenderer }) => {
   const newGlobals = useMemo(() => {
      return {
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      };
   }, [globals, host, index]);

   return <Output nodeId={nodeId} globals={newGlobals} depth={(depth ?? "") + `_${host}.${index}`} overrides={overrides} />;
};

const nodeMethods = ArcaneGraph.nodeMethods<IRepeatArrayNode>();

const RepeatArrayNodeHelper: INodeHelper<IRepeatArrayNode> = {
   name: "Repeat Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_REPEAT,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IRepeatArrayNode["outputs"], globals: GraphGlobals) => {
      switch (socket) {
         case "output":
            return Renderer;
         case "sequence":
            return {
               senderId: nodeId,
               min: 0,
               max: nodeMethods.coalesce(graph, nodeId, "iterationCount", "iterationCount", globals),
            };
      }
   },
   initialize: () => ({
      iterationCount: 1,
   }),
   controls: Controls,
};

export default RepeatArrayNodeHelper;
