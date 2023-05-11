import { v4 as uuid } from "uuid";
import {
   INodeDefinition,
   NodeRenderer,
   INodeHelper,
   INodeInstance,
   NodeRendererProps,
   ControlRendererProps,
   PortalBus,
   GraphGlobals,
   IArcaneGraph,
   ILinkInstance,
} from "../types";
import { faClose, faArrowRightFromBracket as nodeIcon, faPlus } from "@fortawesome/pro-solid-svg-icons";
import { faArrowRightFromBracket as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import ArcaneGraph from "../graph";
import { memo, useCallback, useMemo } from "react";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import styled from "styled-components";
import NumberInput from "!/components/inputs/NumberInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IPortalOutNode extends INodeDefinition {
   values: {
      sockets: string[];
      channels: { [key: string]: number };
   };
   inputs: {
      input: NodeRenderer;
      portalBus: PortalBus;
   };
   outputs: {
      [key: string]: NodeRenderer;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IPortalOutNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHooks.useAlterNode(nodeId);

   const addChannel = useCallback(() => {
      const sId = uuid();
      setNode((p) => {
         return {
            ...p,
            sockets: [...p.sockets, sId],
            channels: { ...p.channels, [sId]: Math.max(...(Object.keys(p.channels).length === 0 ? [0] : Object.values(p.channels))) + 1 },
            in: {
               ...p.in,
               [sId]: null,
            },
         };
      });
   }, [setNode]);

   const removeChannel = useCallback(
      (sId: string) => {
         setGraph((prev) => {
            const linkIds = prev.nodes[nodeId]?.out?.[sId] ?? [];
            const prevNode = prev.nodes[nodeId] as INodeInstance<IPortalOutNode>;

            const otherNodes = linkIds.reduce((acc, linkId) => {
               acc[prev.links[linkId].toNode] = {
                  ...prev.nodes[prev.links[linkId].toNode],
                  in: {
                     ...prev.nodes[prev.links[linkId].toNode].in,
                     [prev.links[linkId].toSocket]: null,
                  },
               };
               return acc;
            }, {} as typeof prev.nodes);

            return {
               ...prev,
               nodes: {
                  ...prev.nodes,
                  ...otherNodes,
                  [nodeId]: {
                     ...prev.nodes[nodeId],
                     sockets: (prev.nodes[nodeId] as INodeInstance<IPortalOutNode>).sockets.filter((n) => n !== sId),
                     channels: Object.entries(prevNode.channels).reduce((acc, [k, v]) => {
                        if (k !== sId) {
                           acc[k] = v;
                        }
                        return acc;
                     }, {} as { [key: string]: number }),
                     in: Object.entries(prevNode.in).reduce((acc, [k, v]) => {
                        if (k !== sId) {
                           acc[k] = v;
                        }
                        return acc;
                     }, {} as { [key: string]: string | null }),
                  },
               },
               links: Object.entries(prev.links).reduce((acc, [k, v]) => {
                  if (!linkIds.includes(k)) {
                     acc[k] = v;
                  }
                  return acc;
               }, {} as { [key: string]: ILinkInstance }),
            };
         });
      },
      [setGraph, nodeId]
   );

   const setChannelValue = useCallback(
      (sId: string, val: number) => {
         setNode((p) => {
            return {
               ...p,
               channels: Object.entries(p.channels).reduce((acc, [k, v]) => {
                  if (k === sId) {
                     acc[k] = val;
                  } else {
                     acc[k] = v;
                  }
                  return acc;
               }, {} as { [key: string]: number }),
            };
         });
      },
      [setNode]
   );

   return (
      <BaseNode<IPortalOutNode> nodeId={nodeId} helper={PortalOutNodeHelper} hooks={nodeHooks}>
         <SocketIn<IPortalOutNode> nodeId={nodeId} socketId={"portalBus"} type={SocketTypes.PORTAL}>
            Portal Bus
         </SocketIn>
         <SocketIn<IPortalOutNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Pipeline Input
         </SocketIn>
         <hr />
         <BaseNode.Input>
            <ActionButton className={"slim"} onClick={addChannel}>
               <Icon icon={faPlus} /> Add Channel
            </ActionButton>
         </BaseNode.Input>
         {node.sockets.map((id, i) => {
            return (
               <SocketOut<IPortalOutNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE} key={id}>
                  <ChannelDiv>
                     <span>Channel</span>
                     <NumberInput className={"small"} value={node.channels[id]} onValidCommit={(e) => setChannelValue(id, e)} />
                     <IconButton
                        onClick={() => {
                           removeChannel(id);
                        }}
                        icon={faClose}
                        flavour={"danger"}
                     />
                  </ChannelDiv>
               </SocketOut>
            );
         })}
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IPortalOutNode>();

const FallbackRenderer = memo(() => <></>);

const PortalOutNodeHelper: INodeHelper<IPortalOutNode> = {
   name: "Portal (Out)",
   buttonIcon,
   flavour: "danger",
   nodeIcon,
   type: NodeTypes.COL_PORTAL_OUT,
   getOutput: (theGraph: IArcaneGraph, myNode: string, requestedSocket: string, theGlobals: GraphGlobals) => {
      const channels = nodeMethods.getValue(theGraph, myNode, "channels") ?? {};
      const channelId = channels[requestedSocket] ?? null;

      if (channelId === null) {
         return FallbackRenderer;
      }

      return memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
         const [Pipeline, cId] = nodeHooks.useInputNode(nodeId, "input", globals);
         const busRenderer = nodeHooks.useInput(nodeId, "portalBus", globals);
         const { senderId } = nodeHooks.useInput(nodeId, "portalBus", globals) ?? {};

         const newGlobals = useMemo(() => {
            if (senderId && channelId) {
               return {
                  ...globals,
                  portalData: {
                     [senderId]: channelId,
                  },
               };
            }
            return globals;
         }, [globals, senderId]);

         if (senderId) {
            if (Pipeline && cId) {
               return <Pipeline nodeId={cId} depth={(depth ?? "") + `_${nodeId}_${requestedSocket}`} globals={newGlobals} overrides={overrides} />;
            } else if (busRenderer) {
               const BusRenderer = busRenderer.renderer;
               return <BusRenderer nodeId={senderId} depth={(depth ?? "") + `_${nodeId}_${requestedSocket}`} globals={newGlobals} overrides={overrides} />;
            }
         }
         return <></>;
      });
   },
   initialize: () => {
      const socketId = uuid();
      return {
         sockets: [socketId],
         channels: {
            [socketId]: 1,
         },
         in: {
            [socketId]: null,
         },
      };
   },
   controls: Controls,
};

export default PortalOutNodeHelper;

const ChannelDiv = styled.div`
   display: grid;
   grid-template-columns: auto 1fr auto;
   align-items: center;
   justify-items: center;
   gap: 0.25em;
`;
