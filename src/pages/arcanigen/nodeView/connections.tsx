import { Flavour } from "!/components";
import { useDragCanvasValue } from "!/components/containers/DragCanvas";
import useKey from "@accessible/use-key";
import { HTMLAttributes, useMemo, useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useNodeGraphEventBus } from ".";
import ArcaneGraph from "../definitions/graph";
import { ILinkInstance, LinkTypes } from "../definitions/types";

const ConnectionCanvas = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   // <line x1="99.42857142857139" y1="-274.2857142857144" x2="-371.42857142857247" y2="-65.1428571428572"></line>
   // -23.2143em; top: -4.07143em;

   const connections = ArcaneGraph.useLinklist();

   const bounds = useMemo(() => {
      const THING = 8000;
      return {
         style: {
            width: `${THING * 2}px`,
            height: `${THING * 2}px`,
            left: `${THING * -1}px`,
            top: `${THING * -1}px`,
         },
         viewBox: `${THING * -1} ${THING * -1} ${THING * 2} ${THING * 2}`,
      };
   }, []);

   return (
      <div {...props}>
         <svg {...bounds}>
            {Object.entries(connections).map(([k, v]) => (
               <Connection key={k} {...v} />
            ))}
            <WipConnection />
         </svg>
      </div>
   );
   //
})`
   display: contents;
   & > svg {
      pointer-events: none;
      position: absolute;
      font-size: inherit;
   }
   & > svg > * {
      pointer-events: stroke;
      vector-effect: non-scaling-stroke;
      fill: none;
   }
`;

export default ConnectionCanvas;

const Connection = ({ linkId, fromNode, toNode, fromSocket, toSocket, type }: ILinkInstance) => {
   const { eventBus, origin } = useNodeGraphEventBus();
   const { disconnect } = ArcaneGraph.useGraph();

   const [fNodeOut, tNodeIn] = ArcaneGraph.useLinkWatcher(fromNode, toNode);

   const fromSocketRef = useRef<HTMLElement>();
   const toSocketRef = useRef<HTMLElement>();

   const [shape, setShape] = useState("");

   const redraw = useCallback(() => {
      if (origin.current && toSocketRef.current && fromSocketRef.current) {
         const originBB = origin.current.getBoundingClientRect();

         const iBB = fromSocketRef.current.getBoundingClientRect();
         const oBB = toSocketRef.current.getBoundingClientRect();

         const from = {
            x: iBB.left + iBB.width / 2 - originBB.left,
            y: iBB.top + iBB.height / 2 - originBB.top,
         };

         const to = {
            x: oBB.left + oBB.width / 2 - originBB.left,
            y: oBB.top + oBB.height / 2 - originBB.top,
         };

         const avg = {
            x: (from.x + to.x) / 2,
            y: (from.y + to.y) / 2,
         };

         const fSpur = from.x + 100;
         const tSpur = to.x - 100;

         setShape(`M ${from.x} ${from.y} Q ${fSpur},${from.y} ${avg.x},${avg.y} Q ${tSpur},${to.y} ${to.x},${to.y}`);
      }
   }, [origin]);

   // useEffect(() => {
   //    redraw();
   // }, [zoom, redraw, fNode.out, tNode.in, tNode.out, fNode.in]);

   const retarget = useCallback(() => {
      if (origin.current) {
         fromSocketRef.current =
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${fromNode}'][data-trh-graph-socket='${fromSocket}']`) ??
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${fromNode}'][data-trh-graph-proxy~='${fromSocket}']`) ??
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${fromNode}'][data-trh-graph-fallback='out']`) ??
            undefined;
         toSocketRef.current =
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${toNode}'][data-trh-graph-socket='${toSocket}']`) ??
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${toNode}'][data-trh-graph-proxy~='${toSocket}']`) ??
            origin.current.querySelector<HTMLElement>(`[data-trh-graph-sockethost='${toNode}'][data-trh-graph-fallback='in']`) ??
            undefined;
      }
   }, [origin, fromSocket, toSocket, fromNode, toNode]);

   useEffect(() => {
      retarget();
      redraw();
   }, [retarget, redraw, fNodeOut, tNodeIn]);

   const [zoom] = useDragCanvasValue((p) => p.zoom);

   useEffect(() => {
      redraw();
   }, [zoom, redraw]);

   useEffect(() => {
      const eb = eventBus.current;
      if (eb) {
         const handle = () => {
            retarget();
            redraw();
         };

         eb.subscribe(`node[${fromNode}].collapse`, handle);
         eb.subscribe(`node[${toNode}].collapse`, handle);
         return () => {
            eb.unsub(`node[${fromNode}].collapse`, handle);
            eb.unsub(`node[${toNode}].collapse`, handle);
         };
      }
   }, [eventBus, fromNode, toNode, retarget, redraw]);

   useEffect(() => {
      const eb = eventBus.current;
      if (eb) {
         eb.subscribe(`node[${fromNode}].move`, redraw);
         eb.subscribe(`node[${toNode}].move`, redraw);
         return () => {
            eb.unsub(`node[${fromNode}].move`, redraw);
            eb.unsub(`node[${toNode}].move`, redraw);
         };
      }
   }, [eventBus, redraw, fromNode, toNode]);

   const gRef = useRef<any>();

   useKey(gRef, {
      Delete: () => {
         disconnect(linkId);
      },
   });

   const flavour = useMemo(() => {
      return getLinkFlavour(type);
   }, [type]);

   return (
      <g tabIndex={-1} ref={gRef}>
         <DisplayPath d={shape} className={`flavour-${flavour}`} />
         <SelectPath d={shape} />
      </g>
   );
};

const DisplayPath = styled.path`
   stroke: var(--flavour-icon);
   stroke-width: 2px;
   g:focus > & {
      stroke: var(--flavour-icon-highlight);
   }
`;
const SelectPath = styled.path`
   stroke: transparent;
   stroke-width: 12px;
`;

const WipConnection = () => {
   const { eventBus, origin } = useNodeGraphEventBus();
   const startSocketRef = useRef<HTMLDivElement | null>(null);

   const [shape, setShape] = useState("");

   const [zoom] = useDragCanvasValue((p) => p.zoom);
   const zoomRef = useRef<number>(zoom);

   useEffect(() => {
      zoomRef.current = zoom;
   }, [zoom]);

   useEffect(() => {
      const eb = eventBus.current;
      const o = origin.current;
      if (eb && o) {
         const move = (e: MouseEvent) => {
            if (origin.current && startSocketRef.current) {
               const originBB = origin.current.getBoundingClientRect();

               const iBB = startSocketRef.current.getBoundingClientRect();

               const from = {
                  x: iBB.left + iBB.width / 2 - originBB.left,
                  y: iBB.top + iBB.height / 2 - originBB.top,
               };

               const to = {
                  x: e.clientX / zoomRef.current - originBB.left,
                  y: e.clientY / zoomRef.current - originBB.top,
               };

               setShape(`M ${from.x} ${from.y} L ${to.x},${to.y}`);
            } else {
               setShape("");
            }
         };

         const end = () => {
            setShape("");
            startSocketRef.current = null;
            document.removeEventListener("mousemove", end);
            eb.unsub("link.cancel", end);
            eb.unsub("link.made", end);
         };

         return eb.subscribe("link.start", (e) => {
            startSocketRef.current = o.querySelector(`[data-trh-graph-sockethost='${e.detail.nodeId}'][data-trh-graph-socket='${e.detail.socketId}']`);
            document.addEventListener("mousemove", move);
            eb.subscribe("link.cancel", end);
            eb.subscribe("link.made", end);
         });
      }
   }, [eventBus, origin]);

   return shape ? <WipPath d={shape} /> : null;
};

const WipPath = styled.path`
   stroke: var(--icon);
   stroke-width: 2px;
`;

const getLinkFlavour = (type: LinkTypes): Flavour => {
   switch (type) {
      case LinkTypes.SHAPE:
         return "confirm";
      case LinkTypes.OTHER:
         return "accent";
   }
   return "accent";
};
