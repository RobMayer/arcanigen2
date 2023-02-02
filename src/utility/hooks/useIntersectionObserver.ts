import { RefObject, useCallback, useEffect, useRef } from "react";

const useIntersectionObserver = <T extends Element, E extends Element>(
   node: RefObject<T>,
   parent: RefObject<E>,
   cb: (entry: IntersectionObserverEntry) => void,
   options?: Omit<IntersectionObserverInit, "root">
) => {
   const theObserved = useCallback<IntersectionObserverCallback>(
      (entries, observer) => {
         cb(entries[0]);
      },
      [cb]
   );

   const observerRef = useRef<IntersectionObserver>();
   useEffect(() => {
      observerRef.current = new IntersectionObserver(theObserved, { ...(options ?? {}), root: parent.current });
      const observer = observerRef.current;
      const n = node.current;
      if (n) {
         observer.observe(n);
         return () => {
            observer.disconnect();
         };
      }
   }, [theObserved, node, parent, options]);
};

export default useIntersectionObserver;
