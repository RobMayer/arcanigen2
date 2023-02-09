import fp from "lodash/fp";
import { ReactNode, useRef, useCallback, useMemo, createContext, useContext, useState } from "react";

type Methods<T> = {
   get: (lens: string) => any;
   set: (lens: string, value: T | ((prev: T) => T)) => void;
};

const CTX = createContext<Methods<any> | undefined>(undefined);

export const UIStateProvider = ({ children }: { children?: ReactNode }) => {
   const store = useRef<{ [key: string]: any }>({});

   const set = useCallback(<T,>(lens: string, value: T | ((prev: T) => T)) => {
      const prev = fp.get(lens, store.current);
      const nV = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      store.current = fp.set(lens, nV, store.current);
   }, []);

   const get = useCallback((lens: string) => {
      return fp.get(lens, store.current);
   }, []);

   const ctx = useMemo(
      () => ({
         get,
         set,
      }),
      [get, set]
   );

   return <CTX.Provider value={ctx}>{children}</CTX.Provider>;
};

const useUIState = <T,>(lens: string, initial: T) => {
   const store = useContext(CTX)!;

   const [state, setState] = useState<T>(() => {
      const t = store.get(lens);
      if (t === undefined) {
         store.set(lens, initial);
         return initial;
      }
      return t;
   });

   const set = useCallback(
      (v: T | ((prev: T) => T)) => {
         store.set(lens, v);
         setState(v);
      },
      [store, lens]
   );

   return [state, set] as [T, typeof set];
};

export default useUIState;
