// Hook

import { useCallback } from "react";

const useLocalStorage = (key: string) => {
   const load = useCallback(() => {
      const v = localStorage.getItem(key);
      if (v) {
         return JSON.parse(v);
      }
   }, [key]);

   const save = useCallback(
      (v: any) => {
         localStorage.setItem(key, JSON.stringify(v));
      },
      [key]
   );

   const remove = useCallback(() => {
      localStorage.removeItem(key);
   }, [key]);

   return { load, save, remove };
};

export default useLocalStorage;
