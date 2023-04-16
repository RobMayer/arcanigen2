import { RefObject, useEffect, useState } from "react";

type AllowedEffects = "none" | "copy" | "link" | "move";

const useDroppable = (
   ref: RefObject<HTMLElement>,
   handlers: {
      [key: string]: [AllowedEffects, (data: string, event: DragEvent, extra: string) => void];
   }
) => {
   const [isDropping, setIsDropping] = useState(false);

   useEffect(() => {
      const n = ref.current;
      if (n) {
         const overHandler = (e: DragEvent) => {
            if (!e.defaultPrevented && e.dataTransfer) {
               let isValid = false;
               Object.entries(handlers).forEach(([m, [effect]]) => {
                  if (e.dataTransfer?.types.includes(m)) {
                     e.dataTransfer!.dropEffect = effect;
                     setIsDropping(true);
                     isValid = true;
                  }
               });
               if (!isValid) {
                  //e.dataTransfer!.dropEffect = "none";
               }
               e.preventDefault();
            }
         };

         const outHandler = (e: DragEvent) => {
            setIsDropping(false);
         };

         const dropHandler = (e: DragEvent) => {
            if (!e.defaultPrevented && e.dataTransfer) {
               Object.entries(handlers).forEach(([m, [effect, cb]]) => {
                  if (e.dataTransfer?.types.includes(m)) {
                     setIsDropping(false);
                     const data = e.dataTransfer!.getData(m);
                     const extra = e.dataTransfer!.getData("stlm/extra");
                     cb(data, e, extra);
                  }
               });
               e.preventDefault();
            }
         };

         n.addEventListener("dragover", overHandler);
         n.addEventListener("dragleave", outHandler);
         n.addEventListener("drop", dropHandler);
         return () => {
            n.removeEventListener("dragover", overHandler);
            n.removeEventListener("dragleave", outHandler);
            n.removeEventListener("drop", dropHandler);
         };
      }
   }, [handlers, ref]);

   return isDropping;
};

export default useDroppable;
