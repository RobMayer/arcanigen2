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
} from "../types";
import { faClose, faLayerGroup as nodeIcon, faPlus } from "@fortawesome/pro-solid-svg-icons";
import { faLayerGroup as buttonIcon } from "@fortawesome/pro-light-svg-icons";
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

interface ILayersNode extends INodeDefinition {
   inputs: {
      [key: string]: NodeRenderer;
   };
   values: {
      sockets: string[];
      modes: { [key: string]: BlendMode };
   };
   outputs: {
      output: NodeRenderer;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ILayersNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHelper.useAlterNode(nodeId);

   const addLayer = useCallback(() => {
      const sId = uuid();
      setNode((p) => {
         return {
            ...p,
            sockets: [...p.sockets, sId],
            modes: { ...p.modes, [sId]: "normal" },
            in: {
               ...p.in,
               [sId]: null,
            },
         };
      });
   }, [setNode]);

   const removeLayer = useCallback(
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
                     sockets: (prev.nodes[nodeId] as INodeInstance<ILayersNode>).sockets.filter((n) => n !== sId),
                     modes: ObjHelper.remove((prev.nodes[nodeId] as INodeInstance<ILayersNode>).sockets, sId),
                     in: ObjHelper.remove(prev.nodes[nodeId].in, sId),
                  },
               },
               links: ObjHelper.remove(prev.links, linkId),
            };
         });
      },
      [setGraph, nodeId]
   );

   const setLayerMode = useCallback(
      (sId: string, mode: BlendMode) => {
         setNode((p) => {
            return {
               ...p,
               modes: Object.entries(p.modes).reduce((acc, [k, v]) => {
                  if (k === sId) {
                     acc[k] = mode;
                  } else {
                     acc[k] = v;
                  }
                  return acc;
               }, {} as { [key: string]: BlendMode }),
            };
         });
      },
      [setNode]
   );

   return (
      <BaseNode<ILayersNode> nodeId={nodeId} helper={LayersNodeHelper}>
         <SocketOut<ILayersNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input>
            <ActionButton className={"slim"} onClick={addLayer}>
               <Icon icon={faPlus} /> Add Layer
            </ActionButton>
         </BaseNode.Input>
         {node.sockets.map((id, i) => {
            return (
               <SocketIn<ILayersNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE} key={id}>
                  <LayerDiv>
                     <Dropdown
                        value={node.modes[id]}
                        options={BLEND_MODES}
                        onValue={(e) => {
                           setLayerMode(id, e);
                        }}
                     />
                     <IconButton
                        onClick={() => {
                           removeLayer(id);
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

const Renderer = memo(({ nodeId, depth, globals }: NodeRendererProps) => {
   const sockets = nodeHelper.useValue(nodeId, "sockets") ?? [];
   const modes = nodeHelper.useValue(nodeId, "modes") ?? {};
   return (
      <g>
         {sockets.map((sId, i) => {
            return <Each key={sId} nodeId={nodeId} socketId={sId} blendMode={modes[sId]} host={nodeId} depth={depth} index={i} globals={globals} />;
         })}
      </g>
   );
});

const Each = ({
   nodeId,
   socketId,
   blendMode,
   depth,
   host,
   index,
   globals,
}: NodeRendererProps & {
   socketId: string;
   blendMode: BlendMode;
   host: string;
   index: number;
}) => {
   const newGlobalsglobals = useMemo(
      () => ({
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      }),
      [globals, host, index]
   );

   const [Comp, childId] = nodeHelper.useInputNode(nodeId, socketId, newGlobalsglobals);
   const styles = useMemo(
      () => ({
         mixBlendMode: blendMode ?? "normal",
      }),
      [blendMode]
   );

   return <g style={styles}>{Comp && childId && <Comp nodeId={childId} depth={(depth ?? "") + `_${host}.${index}`} globals={newGlobalsglobals} />}</g>;
};

const LayersNodeHelper: INodeHelper<ILayersNode> = {
   name: "Layers",
   buttonIcon,
   flavour: "danger",
   nodeIcon,
   type: NodeTypes.COL_LAYERS,
   getOutput: () => Renderer,
   initialize: () => {
      const socketId = uuid();
      return {
         sockets: [socketId],
         modes: { [socketId]: "normal" },
         in: {
            [socketId]: null,
         },
      };
   },
   controls: Controls,
};

export default LayersNodeHelper;

const LayerDiv = styled.div`
   display: grid;
   grid-template-columns: 1fr auto;
   align-items: center;
   gap: 0.25em;
`;
