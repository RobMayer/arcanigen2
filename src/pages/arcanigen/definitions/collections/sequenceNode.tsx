import { memo, useCallback, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeTypes,
   NodeRendererProps,
   NodeRenderer,
   INodeInstance,
   SocketTypes,
   Sequence,
   SequenceMode,
   SEQUENCE_MODES,
   ControlRendererProps,
} from "../types";
import { v4 as uuid } from "uuid";

import { faClose, faPlus, faTimeline as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faTimeline as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import ObjHelper from "!/utility/objHelper";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import styled from "styled-components";
import lodash from "lodash";
import ToggleList from "!/components/selectors/ToggleList";

interface ISequencerNode extends INodeDefinition {
   inputs: {
      [key: string]: NodeRenderer;
   } & {
      sequence: Sequence;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      sockets: string[];
      mode: SequenceMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ISequencerNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHelper.useAlterNode(nodeId);
   const [mode, setMode] = nodeHelper.useValueState(nodeId, "mode");

   const addSocket = useCallback(() => {
      const sId = uuid();
      setNode((p) => {
         return {
            ...p,
            sockets: [...p.sockets, sId],
            in: {
               ...p.in,
               [sId]: null,
            },
         };
      });
   }, [setNode]);

   const removeSocket = useCallback(
      (sId: string) => {
         setGraph((prev) => {
            const linkId = prev.nodes[nodeId]?.in?.[sId] ?? undefined;

            const otherNode = linkId
               ? {
                    [prev.links[linkId].fromNode]: {
                       ...prev.nodes[prev.links[linkId].fromNode],
                       out: {
                          ...prev.nodes[prev.links[linkId].fromNode].out,
                          [prev.links[linkId].fromSocket]: prev.nodes[prev.links[linkId].fromNode].out[prev.links[linkId].fromSocket].filter(
                             (l) => l !== linkId
                          ),
                       },
                    },
                 }
               : {};

            return {
               ...prev,
               nodes: {
                  ...prev.nodes,
                  ...otherNode,
                  [nodeId]: {
                     ...prev.nodes[nodeId],
                     sockets: (prev.nodes[nodeId] as INodeInstance<ISequencerNode>).sockets.filter((n) => n !== sId),
                     in: ObjHelper.remove(prev.nodes[nodeId].in, sId),
                  },
               },
               links: ObjHelper.remove(prev.links, linkId),
            };
         });
      },
      [setGraph, nodeId]
   );

   return (
      <BaseNode<ISequencerNode> nodeId={nodeId} helper={SequencerNodeHelper}>
         <SocketOut<ISequencerNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<ISequencerNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Sequence Mode"}>
            <ToggleList value={mode} onValue={setMode} options={SEQUENCE_MODES} />
         </BaseNode.Input>
         <BaseNode.Input>
            <ActionButton className={"slim"} onClick={addSocket}>
               <Icon icon={faPlus} /> Add Step
            </ActionButton>
         </BaseNode.Input>
         {node.sockets.map((id, i) => {
            return (
               <SocketIn<ISequencerNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE} key={id}>
                  <LayerDiv>
                     Step {i + 1}
                     <IconButton
                        onClick={() => {
                           removeSocket(id);
                        }}
                        icon={faClose}
                        flavour={"danger"}
                     />
                  </LayerDiv>
               </SocketIn>
            );
         })}
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const sequence = nodeHelper.useInput(nodeId, "sequence", globals);
   const sockets = nodeHelper.useValue(nodeId, "sockets");
   const mode = nodeHelper.useValue(nodeId, "mode");

   const theRenderSequence = useMemo(() => {
      if (!sockets) {
         return [];
      }
      if (!sequence) {
         return [];
      }
      if (mode === "wrap") {
         return lodash.range(sequence.max).map((n) => sockets[n % sockets.length]);
      }
      if (mode === "clamp") {
         return lodash.range(sequence.max).map((n) => {
            if (n > sockets.length - 1) {
               return sockets[sockets.length - 1];
            }
            return sockets[n];
         });
      }
      if (mode === "bounce") {
         const temp = [...sockets, ...sockets.slice(1, -1).reverse()];
         return lodash.range(sequence.max).map((n) => {
            if (n > temp.length - 1) {
               return temp[n % temp.length];
            }
            return temp[n];
         });
      }
      return [];
   }, [mode, sequence, sockets]);

   const currentIteration = globals.sequenceData[sequence?.senderId];
   const [Comp, cId] = nodeHelper.useInputNode(nodeId, theRenderSequence[currentIteration], globals);

   if (theRenderSequence.length === 0) {
      return <></>;
   }

   return <g>{Comp && cId && <Comp nodeId={cId} globals={globals} depth={`${depth}_${nodeId}`} overrides={overrides} />}</g>;
});

const SequencerNodeHelper: INodeHelper<ISequencerNode> = {
   name: "Sequencer",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.COL_SEQUENCE,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISequencerNode["outputs"]) => Renderer,
   initialize: () => {
      const socketId = uuid();
      return {
         sockets: [socketId],
         mode: "wrap",
         in: {
            sequence: null,
            [socketId]: null,
         },
      };
   },
   controls: Controls,
};

export default SequencerNodeHelper;

const LayerDiv = styled.div`
   display: grid;
   grid-template-columns: 1fr auto;
   align-items: center;
   gap: 0.25em;
`;
