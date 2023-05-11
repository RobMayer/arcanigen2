import { v4 as uuid } from "uuid";
import { INodeDefinition, NodeRenderer, INodeHelper, INodeInstance, NodeRendererProps, ControlRendererProps, ILinkInstance } from "../types";
import { BlendMode, BLEND_MODE_OPTIONS, BlendModes, NodeTypes, SocketTypes } from "../../../../utility/enums";
import { faClose, faLayerGroup as nodeIcon, faPlus, faUpDown } from "@fortawesome/pro-solid-svg-icons";
import { faLayerGroup as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import ArcaneGraph from "../graph";
import { Fragment, HTMLAttributes, memo, useCallback, useEffect, useMemo, useRef } from "react";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import Dropdown from "!/components/selectors/Dropdown";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import styled from "styled-components";
import { MetaPrefab } from "../../nodeView/prefabs";
import useDroppable from "!/utility/hooks/useDroppable";
import useDraggable from "!/utility/hooks/useDraggable";
import { useNodeGraphEventBus } from "../../nodeView";
import Checkbox from "!/components/buttons/Checkbox";

export interface ILayersNode extends INodeDefinition {
   inputs: {
      [key: string]: NodeRenderer;
   };
   values: {
      sockets: string[];
      modes: { [key: string]: BlendMode };
      enabled: { [key: string]: boolean };
   };
   outputs: {
      output: NodeRenderer;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ILayersNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [node, setNode, setGraph] = nodeHooks.useAlterNode(nodeId);

   const { eventBus } = useNodeGraphEventBus();

   const addLayer = useCallback(() => {
      const sId = uuid();
      setNode((p) => {
         return {
            ...p,
            sockets: [...p.sockets, sId],
            modes: { ...p.modes, [sId]: BlendModes.NORMAL },
            enabled: { ...p.enabled, [sId]: true },
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

            const prevNode = prev.nodes[nodeId] as INodeInstance<ILayersNode>;

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
                     sockets: prevNode.sockets.filter((n) => n !== sId),
                     modes: Object.entries(prevNode.modes).reduce((acc, [k, v]) => {
                        if (sId !== k) {
                           acc[k] = v;
                        }
                        return acc;
                     }, {} as { [key: string]: BlendMode }),
                     enabled: Object.entries(prevNode.enabled).reduce((acc, [k, v]) => {
                        if (sId !== k) {
                           acc[k] = v;
                        }
                        return acc;
                     }, {} as { [key: string]: boolean }),
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

   const toggleLayerEnabled = useCallback(
      (sId: string) => {
         setNode((p) => {
            return {
               ...p,
               enabled: Object.entries(p.enabled).reduce((acc, [k, v]) => {
                  if (k === sId) {
                     acc[k] = !v;
                  } else {
                     acc[k] = v;
                  }
                  return acc;
               }, {} as { [key: string]: boolean }),
            };
         });
      },
      [setNode]
   );

   const orderLayer = useCallback(
      (socketId: string, position: number) => {
         setNode((p) => {
            const idx = p.sockets.indexOf(socketId);
            if (idx === -1 || idx === position || idx === position - 1) {
               return p;
            }
            const nSockets = [...p.sockets];
            nSockets.splice(idx, 1);
            nSockets.splice(position > idx ? position - 1 : position, 0, socketId);
            return {
               ...p,
               sockets: nSockets,
            };
         });
      },
      [setNode]
   );

   useEffect(() => {
      eventBus.current?.trigger(`node[${nodeId}].collapse`, {});
   }, [node.sockets, eventBus, nodeId]);

   return (
      <BaseNode<ILayersNode> nodeId={nodeId} helper={LayersNodeHelper} hooks={nodeHooks} className={"slim"}>
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
               <Fragment key={id}>
                  <DragTarget index={i} orderLayer={orderLayer} />
                  <SocketIn<ILayersNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE}>
                     <EachLayer socketId={id} key={id}>
                        <Checkbox
                           checked={node.enabled[id]}
                           onToggle={() => {
                              toggleLayerEnabled(id);
                           }}
                        />
                        <Dropdown
                           value={node.modes[id]}
                           options={BLEND_MODE_OPTIONS}
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
                     </EachLayer>
                  </SocketIn>
               </Fragment>
            );
         })}
         <DragTarget index={node.sockets.length} orderLayer={orderLayer} />
         <hr />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const sockets = nodeHooks.useValue(nodeId, "sockets") ?? [];
   const modes = nodeHooks.useValue(nodeId, "modes") ?? {};
   const enabled = nodeHooks.useValue(nodeId, "enabled") ?? {};
   return (
      <g>
         {sockets.map((sId, i) => {
            return enabled[sId] ? (
               <Each
                  key={sId}
                  nodeId={nodeId}
                  socketId={sId}
                  blendMode={modes[sId]}
                  host={nodeId}
                  depth={depth}
                  index={i}
                  globals={globals}
                  overrides={overrides}
               />
            ) : (
               <NoOp key={sId} />
            );
         })}
      </g>
   );
});

const NoOp = () => <></>;

const Each = ({
   nodeId,
   socketId,
   blendMode,
   depth,
   host,
   index,
   globals,
   overrides,
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

   const [Comp, childId] = nodeHooks.useInputNode(nodeId, socketId, newGlobalsglobals);
   const styles = useMemo(
      () => ({
         mixBlendMode: blendMode ?? BlendModes.NORMAL,
      }),
      [blendMode]
   );

   return (
      <g style={styles}>
         {Comp && childId && <Comp nodeId={childId} depth={(depth ?? "") + `_${host}.${index}`} globals={newGlobalsglobals} overrides={overrides} />}
      </g>
   );
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
         modes: { [socketId]: BlendModes.NORMAL },
         enabled: { [socketId]: true },
         in: {
            [socketId]: null,
         },
      };
   },
   controls: Controls,
};

export default LayersNodeHelper;

const EachLayer = styled(({ socketId, className, children, ...props }: { socketId: string } & HTMLAttributes<HTMLDivElement>) => {
   const handle = useRef<HTMLDivElement>(null);

   const entries = useMemo(
      () => ({
         "application/trh/layer-node/entry": ["move", () => socketId],
      }),
      [socketId]
   );

   const isDragging = useDraggable(handle, entries as any, false);

   return (
      <div {...props} className={`${className} ${isDragging ? "state-dragging" : ""}`}>
         <Handle ref={handle}>
            <Icon icon={faUpDown} />
         </Handle>
         <>{children}</>
      </div>
   );
})`
   display: grid;
   grid-template-columns: auto auto 1fr auto;
   align-items: center;
   gap: 0.25em;
   &.state-dragging {
      outline: 1px dashed var(--effect-border-highlight);
   }
`;

const Handle = styled.div`
   cursor: row-resize;
   color: var(--icon);
   &:hover {
      color: var(--icon-highlight);
   }
`;

const DragTarget = styled(
   ({ index, orderLayer, className, ...props }: HTMLAttributes<HTMLDivElement> & { index: number; orderLayer: (sId: string, pos: number) => void }) => {
      const ref = useRef<HTMLDivElement>(null);

      const isDropping = useDroppable(ref, {
         "application/trh/layer-node/entry": [
            "move",
            (data: string) => {
               orderLayer(data, index);
            },
         ],
      });

      return <div {...props} ref={ref} className={`${className} ${isDropping ? "state-dropping" : ""}`} />;
   }
)`
   padding-block: 2px;
   &.state-dropping {
      background: white;
   }
`;
