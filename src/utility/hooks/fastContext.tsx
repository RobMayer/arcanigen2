import { useRef, useCallback, createContext, useContext, useSyncExternalStore, useMemo } from "react";

export default function createFastContext<T>(initialState: T) {
   function useStoreData(): {
      get: () => T;
      set: (value: T | ((v: T) => T)) => void;
      subscribe: (callback: () => void) => () => void;
   } {
      const store = useRef(initialState);

      const get = useCallback(() => store.current, []);

      const subscribers = useRef(new Set<() => void>());

      const set = useCallback((arg: T | ((v: T) => T)) => {
         const prev = store.current;
         store.current = typeof arg === "function" ? (arg as (prev: T) => T)(prev) : arg;
         subscribers.current.forEach((callback) => callback());
      }, []);

      const subscribe = useCallback((callback: () => void) => {
         subscribers.current.add(callback);
         return () => subscribers.current.delete(callback);
      }, []);

      return useMemo(() => {
         return {
            get,
            set,
            subscribe,
         };
      }, [get, set, subscribe]);
   }

   type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

   const StoreContext = createContext<UseStoreDataReturnType | null>(null);

   function Provider({ children }: { children: React.ReactNode }) {
      return <StoreContext.Provider value={useStoreData()}>{children}</StoreContext.Provider>;
   }

   function useFastContext<R>(selector: (store: T) => R): [R, (value: T | ((v: T) => T)) => void] {
      const store = useContext(StoreContext);
      if (!store) {
         throw new Error("Store not found");
      }

      const state = useSyncExternalStore(
         store.subscribe,
         useCallback(() => selector(store.get()), [selector, store]),
         useCallback(() => selector(initialState), [selector])
      );

      return [state, store.set];
   }

   return {
      Provider,
      useFastContext,
      useStoreData,
   };
}
