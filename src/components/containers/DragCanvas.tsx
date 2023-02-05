import useResizeObserver from "!/utility/hooks/useResizeObserver";
import {
   createContext,
   ForwardedRef,
   forwardRef,
   HTMLAttributes,
   RefObject,
   useCallback,
   useContext,
   useEffect,
   useImperativeHandle,
   useLayoutEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import styled from "styled-components";
import BoundingBox from "./BoundingBox";
import useIntersectionObserver from "!/utility/hooks/useIntersectionObserver";
import DragCanvasControlBar from "./DragCanvasControlBar";
import EventBus from "!/utility/eventbus";
import { Vector2N } from "!/utility/types/units";

type DragCanvasEvents = {
   "trh:dragcanvas.move": Vector2N;
   "trh:dragcanvas.zoom": number;
   "trh:dragcanvas.refresh": {};
};

const EventCTX = createContext<RefObject<EventBus<DragCanvasEvents>> | undefined>(undefined);

export type DragCanvasControls = {
   getElement: () => HTMLDivElement | null;
   getZoom: () => number;
   setPosition: (v: Vector2N | ((p: Vector2N) => Vector2N)) => void;
   move: (x: number, y: number) => void;
   setZoom: (n: number | ((p: number) => number)) => void;
   center: () => void;
};

const DragCanvas = styled(
   forwardRef(({ children, className, ...props }: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<DragCanvasControls>) => {
      const eventBus = useRef<EventBus<DragCanvasEvents>>(new EventBus<DragCanvasEvents>());

      const [isDragging, setIsDragging] = useState<boolean>(false);

      const zoomRef = useRef<number>(1);
      const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

      useEffect(() => {
         return eventBus.current.subscribe("trh:dragcanvas.refresh", () => {
            eventBus.current.trigger("trh:dragcanvas.move", posRef.current);
            eventBus.current.trigger("trh:dragcanvas.zoom", zoomRef.current);
         });
      }, []);

      const outerRef = useRef<HTMLDivElement>(null);
      const panRef = useRef<HTMLDivElement>(null);
      const dragRef = useRef<HTMLDivElement>(null);
      const boundsRef = useRef<HTMLDivElement>(null);
      const anchorRef = useRef<HTMLDivElement>(null);

      const checkBounds = useCallback(() => {
         if (boundsRef.current && outerRef.current) {
            const bb = boundsRef.current.getBoundingClientRect();
            const wb = outerRef.current.getBoundingClientRect();

            const t = {
               borderTopColor: bb.top + bb.height / 2 < wb.top ? "" : "transparent",
               borderRightColor: bb.right - bb.width / 2 > wb.right ? "" : "transparent",
               borderBottomColor: bb.bottom - bb.height / 2 > wb.bottom ? "" : "transparent",
               borderLeftColor: bb.left + bb.width / 2 < wb.left ? "" : "transparent",
            };

            setIsOutOfBounds((p) => {
               if (
                  t.borderBottomColor !== p.borderBottomColor ||
                  t.borderLeftColor !== p.borderLeftColor ||
                  t.borderRightColor !== p.borderRightColor ||
                  t.borderTopColor !== p.borderTopColor
               ) {
                  return t;
               }
               return p;
            });
         }
      }, []);

      const setInternalPosition = useCallback(
         (x: number, y: number) => {
            if (anchorRef.current && panRef.current) {
               anchorRef.current.style.translate = `${x}px ${y}px`;
               panRef.current.style.backgroundPositionX = `calc(50% + ${x}px)`;
               panRef.current.style.backgroundPositionY = `calc(50% + ${y}px)`;
            }
            posRef.current.x = x;
            posRef.current.y = y;
            checkBounds();
            eventBus.current.trigger("trh:dragcanvas.move", { x, y });
         },
         [checkBounds]
      );

      const center = useCallback(() => {
         if (boundsRef.current && anchorRef.current) {
            const bb = boundsRef.current.getBoundingClientRect();
            const ab = anchorRef.current.getBoundingClientRect();

            setInternalPosition((bb.left - ab.left + bb.width / 2) * -1, (bb.top - ab.top + bb.height / 2) * -1);
         }
      }, [setInternalPosition]);

      const setInternalZoom = useCallback(
         (z: number) => {
            if (anchorRef.current && panRef.current) {
               const nZ = Math.min(Math.max(0.125, z), 4);
               zoomRef.current = nZ;
               (anchorRef.current.style as any).scale = nZ;
               panRef.current.style.backgroundSize = `calc(100vmin * ${nZ / 20})`;
               checkBounds();
               eventBus.current.trigger("trh:dragcanvas.zoom", nZ);
            }
         },
         [checkBounds]
      );

      const controls: DragCanvasControls = useMemo(
         () => ({
            getElement: () => outerRef.current,
            getZoom: () => zoomRef.current,
            setPosition: (v: Vector2N | ((p: Vector2N) => Vector2N)) => {
               const prev = posRef.current;
               const nV = typeof v === "function" ? v(prev) : v;

               setInternalPosition(nV.x, nV.y);
            },
            move: (x: number, y: number) => {
               const prev = posRef.current;
               setInternalPosition(prev.x + x, prev.y + y);
            },
            setZoom: (v: number | ((p: number) => number)) => {
               const prev = zoomRef.current;
               const nV = typeof v === "function" ? v(prev) : v;
               setInternalZoom(nV);
            },
            center,
         }),
         [setInternalPosition, setInternalZoom, center]
      );

      useImperativeHandle(fRef, () => controls, [controls]);

      const [isOutOfBounds, setIsOutOfBounds] = useState({
         borderTopColor: "transparent",
         borderRightColor: "transparent",
         borderBottomColor: "transparent",
         borderLeftColor: "transparent",
      });

      useResizeObserver(outerRef, checkBounds);
      useResizeObserver(boundsRef, checkBounds);
      useIntersectionObserver(boundsRef, outerRef, checkBounds, INTERSECT_OPTS);

      useEffect(() => {
         const n = outerRef.current;
         const p = panRef.current;
         const a = anchorRef.current;
         if (n && a && p) {
            const handle = (e: WheelEvent) => {
               if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
               } else {
                  const pZ = zoomRef.current;
                  setInternalZoom(pZ + e.deltaY * -0.001);
               }
            };

            n.addEventListener("wheel", handle);
            return () => {
               n.removeEventListener("wheel", handle);
            };
         }
      }, [setInternalZoom]);

      useEffect(() => {
         const d = dragRef.current;
         if (d) {
            const move = (e: globalThis.MouseEvent) => {
               if (anchorRef.current && outerRef.current && panRef.current) {
                  const { x: sX, y: sY } = posRef.current;

                  const nX = sX + e.movementX;
                  const nY = sY + e.movementY;

                  setInternalPosition(nX, nY);
               }
            };
            const end = () => {
               document.removeEventListener("mousemove", move);
               document.removeEventListener("mouseup", end);
               setIsDragging(false);
            };
            const start = (e: globalThis.MouseEvent) => {
               if (e.button === 1) {
                  setIsDragging(true);
                  document.addEventListener("mousemove", move);
                  document.addEventListener("mouseup", end);
               }
            };
            d.addEventListener("mousedown", start);
            return () => {
               d.removeEventListener("mousedown", start);
            };
         }
      }, [setInternalPosition]);

      return (
         <EventCTX.Provider value={eventBus}>
            <div className={`${className ?? ""} meta-dragcanvas ${isDragging ? "state-dragging" : ""}`} {...props} ref={outerRef}>
               <ScrollHandle ref={dragRef} />
               <Pan className={"gridded"} ref={panRef} />
               <BoundingBox ref={boundsRef}>
                  <Anchor ref={anchorRef}>{children}</Anchor>
               </BoundingBox>
               <Signal style={isOutOfBounds} />
               <DragCanvasControlBar controls={controls} />
            </div>
         </EventCTX.Provider>
      );
   })
)`
   position: relative;
   width: 100%;
   height: 100%;
   overflow: hidden;
   display: grid;
   place-items: center;
   place-content: center;
   isolation: isolate;
   -webkit-font-smoothing: antialiased;
   transform: translateZ(0);
`;

export default DragCanvas;

const Signal = styled.div`
   position: absolute;
   inset: 3px;
   pointer-events: none;
   border: 3px solid var(--danger-button);
   z-index: 99999;
`;

const Pan = styled.div`
   position: absolute;
   overflow: hidden;
   inset: 0;
   display: grid;
   place-items: center;
   place-content: center;
   isolation: isolate;
   pointer-events: none;
   background-position: 50% 50%;
   background-size: calc(100vmin / 20);
   &.gridded {
      background-image: url("/grid.svg");
   }
`;

const ScrollHandle = styled.div`
   position: absolute;
   inset: 0;
`;

const Anchor = styled.div`
   width: 0px;
   height: 0px;
   position: absolute;
`;

const Center = styled.div`
   width: 0;
   height: 0;
   position: absolute;
`;

// export const useDragCanvasValue = DragValueCTX.useFastContext;

export const useDragCanvasEvents = () => useContext(EventCTX);

const INTERSECT_OPTS = {
   threshold: 0.5,
};
