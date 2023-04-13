import { v4 as uuid } from "uuid";
import {
   INodeDefinition,
   NodeRenderer,
   INodeHelper,
   NodeTypes,
   BlendMode,
   INodeInstance,
   BLEND_MODES,
   SocketTypes,
   NodeRendererProps,
   ControlRendererProps,
   PortalBus,
   IArcaneGraph,
   Globals,
} from "../types";
import { faClose, faArrowRightToBracket as nodeIcon, faPlus } from "@fortawesome/pro-solid-svg-icons";
import { faArrowRightToBracket as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import ArcaneGraph from "../graph";
import { memo, useCallback, useMemo } from "react";
import ObjHelper from "!/utility/objHelper";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import Dropdown from "!/components/selectors/Dropdown";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import styled from "styled-components";
import NumberInput from "!/components/inputs/NumberInput";

interface IPortalInNode extends INodeDefinition {
   inputs: {
      [key: string]: NodeRenderer;
   };
   values: {
      sockets: string[];
      channels: {
         [key: string]: number;
      };
   };
   outputs: {
      output: NodeRenderer;
      portalBus: PortalBus;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IPortalInNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHelper.useAlterNode(nodeId);

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
                     sockets: (prev.nodes[nodeId] as INodeInstance<IPortalInNode>).sockets.filter((n) => n !== sId),
                     channels: Object.entries((prev.nodes[nodeId] as INodeInstance<IPortalInNode>).channels).reduce((acc, [theId, theChannel]) => {
                        if (sId !== theId) {
                           acc[theId] = theChannel;
                        }
                        return acc;
                     }, {} as { [key: string]: number }),
                     in: ObjHelper.remove(prev.nodes[nodeId].in, sId),
                  },
               },
               links: ObjHelper.remove(prev.links, linkId),
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
      <BaseNode<IPortalInNode> nodeId={nodeId} helper={PortalInNodeHelper}>
         <SocketOut<IPortalInNode> nodeId={nodeId} socketId={"portalBus"} type={SocketTypes.PORTAL}>
            Portal Bus
         </SocketOut>
         <SocketOut<IPortalInNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Pipeline Output
         </SocketOut>
         <hr />
         <BaseNode.Input>
            <ActionButton className={"slim"} onClick={addChannel}>
               <Icon icon={faPlus} /> Add Channel
            </ActionButton>
         </BaseNode.Input>
         {node.sockets.map((id, i) => {
            return (
               <SocketIn<IPortalInNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE} key={id}>
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
               </SocketIn>
            );
         })}
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const [myPortal, restOfGlobals] = useMemo(() => {
      const { portalData, ...rg } = globals;
      const { [nodeId]: mP, ...rp } = portalData ?? {};
      return [mP, { ...rg, portalData: rp ?? {} }];
   }, [globals, nodeId]);

   const channels = nodeHelper.useValue(nodeId, "channels");

   const theChannel = useMemo(() => {
      if (myPortal !== undefined && channels) {
         return Object.entries(channels).reduce((acc, [k, v]) => {
            if (acc === null && v === myPortal) {
               return k;
            }
            return acc;
         }, null as null | string);
      }
      return null;
   }, [channels, myPortal]);

   if (theChannel !== null) {
      return (
         <g>
            <Member nodeId={nodeId} socketId={theChannel} host={nodeId} depth={depth} globals={restOfGlobals} overrides={overrides} />
         </g>
      );
   }

   return <></>;
});

const Member = ({
   nodeId,
   socketId,
   depth,
   host,
   globals,
   overrides,
}: NodeRendererProps & {
   socketId: string;
   host: string;
}) => {
   const [Comp, childId] = nodeHelper.useInputNode(nodeId, socketId, globals);
   return <g>{Comp && childId && <Comp nodeId={childId} depth={(depth ?? "") + `_${host}.${socketId}`} globals={globals} overrides={overrides} />}</g>;
};

const PortalInNodeHelper: INodeHelper<IPortalInNode> = {
   name: "Portal (In)",
   buttonIcon,
   flavour: "danger",
   nodeIcon,
   type: NodeTypes.COL_PORTAL_IN,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPortalInNode["outputs"], globals: Globals) => {
      if (socket === "portalBus") {
         return {
            senderId: nodeId,
            renderer: Renderer,
         };
      }
      return Renderer;
   },
   initialize: () => {
      const socketId = uuid();
      return {
         sockets: [socketId],
         in: {
            [socketId]: null,
         },
         channels: {
            [socketId]: 1,
         },
      };
   },
   controls: Controls,
};

export default PortalInNodeHelper;

const ChannelDiv = styled.div`
   display: grid;
   grid-template-columns: auto 1fr auto;
   align-items: center;
   justify-items: center;
   gap: 0.25em;
`;
