import { RefObject, useEffect, useRef } from "react";

const useMutationObserver = <T extends Element>(node: RefObject<T>, cb: MutationCallback, config?: MutationObserverInit) => {
   const observerRef = useRef<MutationObserver>();
   useEffect(() => {
      observerRef.current = new MutationObserver(cb);
      const observer = observerRef.current;
      const n = node.current;
      if (n) {
         observer.observe(n, config);
         return () => {
            observer.disconnect();
         };
      }
   }, [cb, node, config]);
};

export default useMutationObserver;
