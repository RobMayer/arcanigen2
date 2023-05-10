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
   ILinkInstance,
} from "../types";
import { v4 as uuid } from "uuid";

import { faClose, faPlus, faTimeline as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faTimeline as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import styled from "styled-components";
import lodash from "lodash";
import { MetaPrefab } from "../../nodeView/prefabs";
import Dropdown from "!/components/selectors/Dropdown";
import Checkbox from "!/components/buttons/Checkbox";

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
      reverse: boolean;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ISequencerNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHooks.useAlterNode(nodeId);
   const [mode, setMode] = nodeHooks.useValueState(nodeId, "mode");
   const [reverse, setReverse] = nodeHooks.useValueState(nodeId, "reverse");

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
            const prevNode = prev.nodes[nodeId] as INodeInstance<ISequencerNode>;

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
                     ...prevNode,
                     sockets: prevNode.sockets.filter((n) => n !== sId),
                     in: Object.entries(prevNode.in).reduce((acc, [k, v]) => {
                        if (k !== sId) {
                           acc[k] = v;
                        }
                        return acc;
                     }, {} as { [key: string]: string | null }),
                  },
               },
               links: Object.entries(prev.links).reduce((acc, [k, v]) => {
                  if (k !== linkId) {
                     acc[k] = v;
                  }
                  return acc;
               }, {} as { [key: string]: ILinkInstance }),
            };
         });
      },
      [setGraph, nodeId]
   );

   return (
      <BaseNode<ISequencerNode> nodeId={nodeId} helper={SequencerNodeHelper} hooks={nodeHooks}>
         <SocketOut<ISequencerNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<ISequencerNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Sequence Mode"}>
            <Dropdown value={mode} onValue={setMode} options={SEQUENCE_MODES} />
         </BaseNode.Input>
         <Checkbox checked={reverse} onToggle={setReverse}>
            Reverse Steps
         </Checkbox>
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
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const sequence = nodeHooks.useInput(nodeId, "sequence", globals);
   const sockets = nodeHooks.useValue(nodeId, "sockets");
   const mode = nodeHooks.useValue(nodeId, "mode");
   const reverse = nodeHooks.useValue(nodeId, "reverse");

   const theRenderSequence = useMemo(() => {
      if (!sockets) {
         return [];
      }
      if (!sequence) {
         return [];
      }
      const sTemp = [...sockets];
      if (reverse) {
         sTemp.reverse();
      }
      if (mode === "wrap") {
         return lodash.range(sequence.max).map((n) => sTemp[n % sockets.length]);
      }
      if (mode === "truncate") {
         return lodash.range(sequence.max).map((n) => {
            return n >= sTemp.length ? "" : sTemp[n];
         });
      }
      if (mode === "clamp") {
         return lodash.range(sequence.max).map((n) => {
            if (n > sTemp.length - 1) {
               return sTemp[sTemp.length - 1];
            }
            return sTemp[n];
         });
      }
      if (mode === "bounce") {
         const temp = [...sockets, ...sockets.slice(1, -1).reverse()];
         if (reverse) {
            temp.reverse();
         }
         return lodash.range(sequence.max).map((n) => {
            if (n > temp.length - 1) {
               return temp[n % temp.length];
            }
            return temp[n];
         });
      }
      return [];
   }, [mode, sequence, sockets, reverse]);

   const currentIteration = globals.sequenceData[sequence?.senderId];
   const [Comp, cId] = nodeHooks.useInputNode(nodeId, theRenderSequence[currentIteration], globals);

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
         reverse: false,
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
