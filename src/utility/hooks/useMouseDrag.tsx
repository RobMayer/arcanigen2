import { RefObject, useEffect } from "react";

export enum MouseButton {
   LEFT = 1,
   RIGHT = 2,
   MIDDLE = 4,
   BACK = 8,
   FORWARD = 16,
}

const BUTTONS = [MouseButton.LEFT, MouseButton.MIDDLE, MouseButton.RIGHT, MouseButton.BACK, MouseButton.FORWARD];

const useMouseDrag = (el: RefObject<HTMLElement>, onMove: (e: MouseEvent) => void, which: number = MouseButton.LEFT) => {
   useEffect(() => {
      const n = el.current;
      if (n) {
         const move = (e: MouseEvent) => {
            onMove(e);
         };
         const up = (e: MouseEvent) => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
         };
         const down = (e: MouseEvent) => {
            if (!e.defaultPrevented && (BUTTONS[e.button] & which) === which) {
               document.addEventListener("mousemove", move);
               document.addEventListener("mouseup", up);
               e.preventDefault();
            }
         };
         n.addEventListener("mousedown", down);
         return () => {
            n.removeEventListener("mousedown", down);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
         };
      }
   }, [onMove, el, which]);
};

export default useMouseDrag;
