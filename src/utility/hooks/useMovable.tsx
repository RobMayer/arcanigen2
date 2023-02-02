import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type Vector = { x: number; y: number };
type Transformer = (v: Vector) => Vector;

const DEFAULT_TRANSFORMER = (v: Vector) => v;

const useMovable = (
   el: RefObject<HTMLElement>,
   start: Vector,
   handle?: RefObject<HTMLElement>,
   container?: RefObject<HTMLElement>,
   transformer?: Transformer | null,
   onStop?: ((v: Vector) => void) | null,
   onEnd?: ((e: MouseEvent) => void) | null,
   onMove?: ((e: MouseEvent) => void) | null,
   onStart?: ((e: MouseEvent) => void) | null
) => {
   handle = handle ?? el;

   const [position, setPosition] = useState<Vector>(start ?? { x: 0, y: 0 });

   const pRef = useRef(position);

   useEffect(() => {
      pRef.current = position;
   }, [position]);

   useEffect(() => {
      const n = el.current;
      const c = container?.current ?? document;
      if (n && c) {
         n.style.zIndex = "auto";
         const handleMe = (e: CustomEvent<HTMLElement>) => {
            n.style.zIndex = e.detail !== n ? "auto" : "2";
         };
         c.addEventListener("trh:dragmove", handleMe);
         return () => {
            c.removeEventListener("trh:dragmove", handleMe);
         };
      }
   }, [container, el]);

   const endDragging = useCallback(() => {
      const n = el.current;
      if (n) {
         n.style.zIndex = "1";
      }
      onStop && onStop({ x: pRef.current.x, y: pRef.current.y });
   }, [el, onStop]);

   const startDragging = useCallback(() => {
      const c = container?.current ?? document;
      const n = el.current;
      if (c && n) {
         c.dispatchEvent(new CustomEvent<HTMLElement>("trh:dragmove", { detail: n }));
      }
   }, [container, el]);

   useEffect(() => {
      const n = handle?.current;
      if (n) {
         const move = (e: MouseEvent) => {
            const t = (transformer ?? DEFAULT_TRANSFORMER)({ x: e.movementX, y: e.movementY });
            setPosition((p) => {
               return {
                  x: p.x + t.x,
                  y: p.y + t.y,
               };
            });
            onMove && onMove(e);
         };
         const up = (e: MouseEvent) => {
            onEnd && onEnd(e);
            endDragging();
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
         };
         const down = (e: MouseEvent) => {
            startDragging();
            onStart && onStart(e);
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
         };
         n.addEventListener("mousedown", down);
         return () => {
            n.removeEventListener("mousedown", down);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
         };
      }
   }, [onMove, handle, onStart, onEnd, endDragging, startDragging, transformer]);

   return [position, setPosition] as [typeof position, typeof setPosition];
};

export default useMovable;
