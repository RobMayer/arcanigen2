import { RefObject, useEffect } from "react";

export enum MouseButton {
   LEFT = 1,
   RIGHT = 2,
   MIDDLE = 4,
   BACK = 8,
   FORWARD = 16,
}

const useMouseEvents = (el: RefObject<HTMLElement>, onMove?: (e: MouseEvent) => void, onStart?: (e: MouseEvent) => void, onEnd?: (e: MouseEvent) => void) => {
   useEffect(() => {
      const n = el.current;
      if (n) {
         const move = (e: MouseEvent) => {
            onMove && onMove(e);
         };
         const up = (e: MouseEvent) => {
            onEnd && onEnd(e);
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
         };
         const down = (e: MouseEvent) => {
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
   }, [onMove, el, onStart, onEnd]);
};

export default useMouseEvents;
