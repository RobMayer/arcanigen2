import { RefObject, useCallback, useEffect, useRef } from "react";

const useResizeObserver = <T extends Element>(node: RefObject<T | undefined>, cb: (entry: ResizeObserverEntry) => void) => {
   const theObserved = useCallback<ResizeObserverCallback>(
      (entries, observer) => {
         cb(entries[0]);
      },
      [cb]
   );

   const observerRef = useRef<ResizeObserver>();
   useEffect(() => {
      observerRef.current = new ResizeObserver(theObserved);
      const observer = observerRef.current;
      const n = node.current;
      if (n) {
         observer.observe(n);
         return () => {
            observer.disconnect();
         };
      }
   }, [theObserved, node]);
};

export default useResizeObserver;
