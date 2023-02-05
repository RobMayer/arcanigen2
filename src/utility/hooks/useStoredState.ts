import lodash from "lodash";
import { useEffect, useState } from "react";

// export default useStoredState;

const useStoredState = <T>(lens: string, initial: T) => {
   const [state, setState] = useState<T>(() => {
      if (typeof window === "undefined") {
         return initial;
      }
      try {
         const path = lodash.toPath(lens);
         const item = window.localStorage.getItem(path[0]);
         if (item) {
            const res = JSON.parse(item);
            if (path.length === 1) {
               return res;
            }
            return lodash.get(res, path);
         }
         return initial;
      } catch (error) {
         // If error also return initialValue
         return initial;
      }
   });

   useEffect(() => {
      if (typeof window !== "undefined") {
         const path = lodash.toPath(lens);
         if (path.length > 1) {
            const item = window.localStorage.getItem(path[0]);
            try {
               const res = JSON.parse(item ?? "{}") ?? {};
               lodash.set(res, path, state);
               window.localStorage.setItem(path[0], JSON.stringify(res));
            } catch (e) {
               console.error(e);
            }
         } else {
            window.localStorage.setItem(path[0], JSON.stringify(state));
         }
      }
   }, [lens, state]);

   return [state, setState] as [typeof state, typeof setState];
};

export default useStoredState;
