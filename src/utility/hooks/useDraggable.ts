import { RefObject, useEffect, useState } from "react";

export type AllowedEffects = "none" | "copy" | "copyLink" | "copyMove" | "link" | "linkMove" | "move" | "all" | "uninitialized";

const useDraggable = (
   ref: RefObject<HTMLElement>,
   data: { [key: string]: [AllowedEffects, () => string, string] | [AllowedEffects, () => string] },
   isDisabled: boolean = false
) => {
   const [isDragging, setIsDragging] = useState(false);

   useEffect(() => {
      const n = ref.current;
      if (n && !isDisabled) {
         n.setAttribute("draggable", "true");
         const startHandler = (e: DragEvent) => {
            if (e.dataTransfer) {
               Object.entries(data).forEach(([m, [allowed, cb, extra]]) => {
                  e.dataTransfer!.effectAllowed = allowed;
                  e.dataTransfer!.setData(m, cb());
                  if (extra) {
                     e.dataTransfer!.setData("stlm/extra", extra);
                  }
               });
               e.dataTransfer.setDragImage(n, 0, 0);
            }
            setIsDragging(true);
            e.stopPropagation();
         };

         const stopHandler = (e: DragEvent) => {
            setIsDragging(false);
         };

         n.addEventListener("dragstart", startHandler);
         n.addEventListener("dragend", stopHandler);
         return () => {
            n.removeEventListener("dragstart", startHandler);
            n.removeEventListener("dragend", stopHandler);
         };
      }
   }, [data, ref, isDisabled]);

   return isDragging;
};

export default useDraggable;
