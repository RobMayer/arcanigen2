import useResizeObserver from "!/utility/hooks/useResizeObserver";
import { ForwardedRef, forwardRef, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import BoundingBox from "./BoundingBox";
import createFastContext from "!/utility/hooks/fastContext";
import useIntersectionObserver from "!/utility/hooks/useIntersectionObserver";
import { MutableRefObject } from "react";

type DragCanvasValue = { zoom: number };

const DragValueCTX = createFastContext<DragCanvasValue>({ zoom: 1 });

const Inner = styled(
   forwardRef(({ children, className, ...props }: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<HTMLDivElement>) => {
      const [dragValue, setDragValue] = DragValueCTX.useFastContext<DragCanvasValue>((p) => p);

      const [isDragging, setIsDragging] = useState<boolean>(false);

      console.log("redrawing");

      const zoomRef = useRef<number>(1);

      const outerRef = useRef<HTMLDivElement>(null);
      const dragRef = useRef<HTMLDivElement>(null);
      const boundsRef = useRef<HTMLDivElement>(null);
      const anchorRef = useRef<HTMLDivElement>(null);
      const centerRef = useRef<HTMLDivElement>(null);

      const [isOutOfBounds, setIsOutOfBounds] = useState({
         borderTopColor: "transparent",
         borderRightColor: "transparent",
         borderBottomColor: "transparent",
         borderLeftColor: "transparent",
      });

      const checkBounds = useCallback(() => {
         if (boundsRef.current && outerRef.current) {
            const bb = boundsRef.current.getBoundingClientRect();
            const wb = outerRef.current.getBoundingClientRect();
            setIsOutOfBounds({
               borderTopColor: bb.top + bb.height / 2 < wb.top ? "" : "transparent",
               borderRightColor: bb.right - bb.width / 2 > wb.right ? "" : "transparent",
               borderBottomColor: bb.bottom - bb.height / 2 > wb.bottom ? "" : "transparent",
               borderLeftColor: bb.left + bb.width / 2 < wb.left ? "" : "transparent",
            });
         }
      }, []);

      useResizeObserver(outerRef, checkBounds);
      useResizeObserver(boundsRef, checkBounds);
      useIntersectionObserver(boundsRef, outerRef, checkBounds, INTERSECT_OPTS);

      useEffect(() => {
         const n = outerRef.current;
         const a = anchorRef.current;
         if (n && a) {
            const handle = (e: WheelEvent) => {
               const bb = a.getBoundingClientRect();
               // const offX = e.clientX - bb.left;
               // const offY = e.clientY - bb.top;
               const pZ = parseFloat((n.style as any).zoom);
               const nZ = Math.min(Math.max(0.125, (isNaN(pZ) ? 1 : pZ) + e.deltaY * -0.001), 4);
               zoomRef.current = nZ;
               setDragValue({ zoom: nZ });
               (n.style as any).zoom = nZ;
            };

            n.addEventListener("wheel", handle);
            return () => {
               n.removeEventListener("wheel", handle);
            };
         }
      }, [setDragValue]);

      useEffect(() => {
         const d = dragRef.current;
         if (d) {
            const move = (e: globalThis.MouseEvent) => {
               if (anchorRef.current && outerRef.current) {
                  const sX = parseFloat(anchorRef.current.style.left);
                  const sY = parseFloat(anchorRef.current.style.top);
                  const z = zoomRef.current;

                  const nX = `${(isNaN(sX) ? 0 : sX) + e.movementX / z}px`;
                  const nY = `${(isNaN(sY) ? 0 : sY) + e.movementY / z}px`;
                  anchorRef.current.style.left = nX;
                  anchorRef.current.style.top = nY;

                  outerRef.current.style.backgroundPositionX = nX;
                  outerRef.current.style.backgroundPositionY = nY;
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
      }, []);

      const createRef = useCallback(
         (el: HTMLDivElement) => {
            (outerRef as MutableRefObject<HTMLDivElement>).current = el;
            if (fRef) {
               if (typeof fRef === "function") {
                  fRef(el);
               } else {
                  fRef.current = el;
               }
            }
         },
         [fRef]
      );

      return (
         <div className={`${className ?? ""} meta-dragcanvas ${isDragging ? "state-dragging" : ""}`} {...props} ref={createRef}>
            <ScrollHandle ref={dragRef} />
            <Center ref={centerRef}>
               <Anchor ref={anchorRef}>
                  <BoundingBox ref={boundsRef}>{children}</BoundingBox>
               </Anchor>
            </Center>
            <Signal style={isOutOfBounds} />
         </div>
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
`;

const DragCanvas = forwardRef(({ children, ...props }: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<HTMLDivElement>) => {
   return (
      <DragValueCTX.Provider>
         <Inner {...props} ref={fRef}>
            {children}
         </Inner>
      </DragValueCTX.Provider>
   );
});

export default DragCanvas;

const Signal = styled.div`
   position: absolute;
   inset: 3px;
   pointer-events: none;
   border: 3px solid var(--danger-button);
`;

const ScrollHandle = styled.div`
   position: absolute;
   inset: 0;
`;

const Anchor = styled.div`
   width: 0;
   height: 0;
   position: absolute;
`;

const Center = styled.div`
   width: 0;
   height: 0;
   position: absolute;
`;

export const useDragCanvasValue = DragValueCTX.useFastContext;

const INTERSECT_OPTS = {
   threshold: 0.5,
};
