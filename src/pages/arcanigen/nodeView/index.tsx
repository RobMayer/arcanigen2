import CardButton from "!/components/buttons/CardButton";
import BoundingBox from "!/components/containers/BoundingBox";
import DragCanvas from "!/components/containers/DragCanvas";
import Slideout from "!/components/containers/Slideout";
import faBlank from "!/components/icons/faBlank";
import EventBus from "!/utility/eventbus";
import useDraggable from "!/utility/hooks/useDraggable";
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { getNodeHelper } from "../definitions";
import ArcaneGraph, { areSocketsCompatible } from "../definitions/graph";
import BaseNode from "../definitions/node";
import { NodeMoveEvent, LinkEvent, ConnectionEvent, NodeTypes, LinkTypes, SocketTypes } from "../definitions/types";
import ConnectionCanvas from "./connections";

type NodeGraphEvents = {
   [key: `node[${string}].move`]: NodeMoveEvent;
   [key: `node[${string}].collapse`]: {};
   [key: `node[${string}].moveStart`]: NodeMoveEvent;
   [key: `node[${string}].moveEnd`]: NodeMoveEvent;
   "link.cancel": {};
   "link.start": LinkEvent;
   "link.attempt": LinkEvent;
   "link.made": ConnectionEvent;
};

const EventCTX = createContext<
   | {
        eventBus: RefObject<EventBus<NodeGraphEvents>>;
        origin: RefObject<HTMLDivElement>;
     }
   | undefined
>(undefined);

const NodeView = () => {
   const origin = useRef<HTMLDivElement>(null);
   const canvasRef = useRef<HTMLDivElement>(null);
   const eventBus = useRef(new EventBus<NodeGraphEvents>());

   const { connect, addNode } = ArcaneGraph.useGraph();
   const nodes = ArcaneGraph.useNodelist();

   useEffect(() => {
      const n = origin.current;
      const eb = eventBus.current;

      if (n && eb) {
         let linkStore: LinkEvent | undefined;

         let doCancel: (e: MouseEvent) => void;
         let startLinkup: (e: CustomEvent<LinkEvent>) => void;
         let attemptLinkup: (e: CustomEvent<LinkEvent>) => void;

         attemptLinkup = (e) => {
            document.removeEventListener("mouseup", doCancel);
            eb.unsub("link.attempt", attemptLinkup);
            if (linkStore && areSocketsCompatible(e.detail.type, linkStore.type) && e.detail.mode !== linkStore.mode && e.detail.nodeId !== linkStore.nodeId) {
               const res = {
                  fromNode: e.detail.mode === "out" ? e.detail.nodeId : linkStore.nodeId,
                  fromSocket: e.detail.mode === "out" ? e.detail.socketId : linkStore.socketId,
                  toNode: e.detail.mode === "in" ? e.detail.nodeId : linkStore.nodeId,
                  toSocket: e.detail.mode === "in" ? e.detail.socketId : linkStore.socketId,
                  type: getLinkType(e.detail.type, linkStore.type),
               };
               connect(res.fromNode, res.fromSocket, res.toNode, res.toSocket, res.type);
               eb.trigger("link.made", res);
            } else {
               eb.trigger("link.cancel", {});
            }
            eb.subscribe("link.start", startLinkup);
         };

         doCancel = (e) => {
            if (!e.defaultPrevented) {
               eb.trigger("link.cancel", {});
               e.preventDefault();
            }
            linkStore = undefined;
            document.removeEventListener("mouseup", doCancel);
            eb.subscribe("link.start", startLinkup);
         };
         startLinkup = (e: CustomEvent<LinkEvent>) => {
            linkStore = e.detail;
            // wait for another node to attempt
            eb.subscribe("link.attempt", attemptLinkup);
            document.addEventListener("mouseup", doCancel);
            eb.unsub("link.start", startLinkup);
         };
         eb.subscribe("link.start", startLinkup);
         return () => {
            eb.unsub("link.start", startLinkup);
         };
      }
   }, [connect]);

   const handleAdd = useCallback(
      (type: NodeTypes) => {
         if (origin.current && canvasRef.current) {
            const obb = origin.current.getBoundingClientRect();
            const cbb = canvasRef.current.getBoundingClientRect();

            const at = {
               x: cbb.left + cbb.width / 2 - obb.left,
               y: cbb.top + cbb.height / 2 - obb.top,
            };
            console.log(at);

            addNode(type, at);
         }
      },
      [addNode]
   );

   return (
      <Wrapper>
         <Canvas ref={canvasRef}>
            <BoundingBox.Contents ref={origin}>
               <EventCTX.Provider value={{ eventBus, origin }}>
                  <ConnectionCanvas />
                  {Object.values(nodes).map(({ nodeId, type }) => (
                     <EachNode key={nodeId} nodeId={nodeId} type={type} />
                  ))}
               </EventCTX.Provider>
            </BoundingBox.Contents>
         </Canvas>
         <Slideout label={"Options"} isOpen direction={"up"} size={"clamp(100px, 20vw, 400px)"}>
            <Grid>
               {NODE_BUTTONS.map((t) => {
                  return <NodeButton key={t as string} onClick={handleAdd} type={t} />;
               })}
            </Grid>
         </Slideout>
      </Wrapper>
   );
};

const NODE_BUTTONS = Object.values(NodeTypes).filter((v) => v !== NodeTypes.RESULT);

export default NodeView;

const Wrapper = styled.div`
   display: grid;
   grid-template-rows: 1fr auto;
`;

const Canvas = styled(DragCanvas)`
   border: 1px solid var(--effect-border-highlight);
`;

const EachNode = ({ type, nodeId }: { type: NodeTypes; nodeId: string }) => {
   const helper = useMemo(() => getNodeHelper(type), [type]);
   const Comp = useMemo(() => helper.controls, [helper]);
   return (
      <BaseNode
         nodeId={nodeId}
         label={helper.name}
         nodeIcon={helper.nodeIcon}
         flavour={helper.flavour}
         key={nodeId}
         noRemove={helper.type === NodeTypes.RESULT}
      >
         <Comp nodeId={nodeId} />
      </BaseNode>
   );
};

const getLinkType = (a: SocketTypes, b: SocketTypes): LinkTypes => {
   if (a === SocketTypes.SHAPE && b === SocketTypes.SHAPE) {
      return LinkTypes.SHAPE;
   }
   return LinkTypes.OTHER;
};

export const useNodeGraphEventBus = () => useContext(EventCTX)!;

const NodeButton = ({ children, type, onClick }: { children?: ReactNode; type: NodeTypes; onClick: (type: NodeTypes) => void }) => {
   const handleClick = useCallback(() => {
      onClick(type);
   }, [type, onClick]);

   const ref = useRef<HTMLDivElement>(null);

   const helper = useMemo(() => getNodeHelper(type), [type]);

   useDraggable(
      ref,
      useMemo(() => {
         return {
            "trh/new_node": ["copy", () => type],
         };
      }, [type])
   );

   return (
      <CardButton icon={helper.buttonIcon ?? faBlank} flavour={helper.flavour} onClick={handleClick} ref={ref}>
         {helper.name}
      </CardButton>
   );
};

const Grid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, 7em);
   grid-auto-rows: 8em;
   padding: 0.25em;
   gap: 0.5em;
`;
