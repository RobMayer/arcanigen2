import lodash from "lodash";
import {
   createContext,
   ForwardedRef,
   forwardRef,
   HTMLAttributes,
   memo,
   MutableRefObject,
   useCallback,
   useContext,
   useEffect,
   useLayoutEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import styled from "styled-components";
import { useDragCanvasEvents } from "./DragCanvas";

const CTX = createContext<{ add: (element: HTMLElement) => void; remove: (element: HTMLElement) => void }>({ add: () => {}, remove: () => {} });

const Contents = styled(
   forwardRef(({ children, ...props }: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<HTMLDivElement>) => {
      const { add, remove } = useContext(CTX);
      const ref = useRef<HTMLDivElement>();

      const setRef = useCallback(
         (el: HTMLDivElement) => {
            ref.current = el;
            if (fRef) {
               if (typeof fRef === "function") {
                  fRef(el);
               } else {
                  fRef.current = el;
               }
            }
         },
         [fRef]
      );

      useLayoutEffect(() => {
         const n = ref.current;
         if (n) {
            add(n);
            return () => {
               remove(n);
            };
         }
      }, [add, remove, ref]);
      return (
         <div {...props} ref={setRef}>
            {children}
         </div>
      );
   })
)`
   width: max-content;
   height: max-content;
   position: relative;
   pointer-events: none;

   & > * {
      pointer-events: initial;
   }
`;

const Wrapper = memo(styled(
   forwardRef(({ children, ...props }: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<HTMLDivElement>) => {
      const [watched, setWatched] = useState<HTMLElement[]>([]);
      const [boundChildren, setBoundChildren] = useState<Element[]>([]);

      const boundsRef = useRef<HTMLDivElement>(null);
      const anchorRef = useRef<HTMLDivElement>(null);
      const zoomRef = useRef<number>(1);

      const dragEventBus = useDragCanvasEvents();

      const [bounds, setBounds] = useState<{ innerH: string; innerV: string; outer: string }>({
         outer: "10px 10px 10px 10px",
         innerH: "0px 20px 20px 0px",
         innerV: "10px 0px 0px 10px",
      });

      const value = useMemo(() => {
         return {
            add: (el: HTMLElement) => {
               setWatched((p) => (p.includes(el) ? p : [...p, el]));
               setBoundChildren((p) => {
                  const c = [...el.children];
                  return [...p, ...c];
               });
            },
            remove: (el: HTMLElement) => {
               setWatched((p) => (p.includes(el) ? p.filter((e) => e !== el) : p));
               setBoundChildren((p) => {
                  const c = [...el.children];
                  return p.filter((n) => c.includes(n));
               });
            },
         };
      }, []);

      const mutationObserver = useRef<MutationObserver>(
         new MutationObserver((r: MutationRecord[]) => {
            setBoundChildren((prev) => {
               return r.reduce((acc, each) => {
                  const toAdd = [...each.addedNodes].filter((n) => n instanceof Element) as Element[];
                  const toRemove = [...each.removedNodes].filter((n) => n instanceof Element) as Element[];
                  return [...acc, ...toAdd].filter((n) => !toRemove.includes(n));
               }, prev);
            });
         })
      );

      useEffect(() => {
         const n = mutationObserver.current;
         watched.forEach((e) => {
            n.observe(e, { childList: true });
         });
         return () => {
            return n.disconnect();
         };
      }, [watched]);

      const redraw = useCallback((c: Element[]) => {
         return () => {
            const bb = c.reduce(
               (acc, each) => {
                  const ib = each.getBoundingClientRect();
                  if (ib.width < 1 && ib.height < 1) {
                     return acc;
                  }
                  return {
                     top: Math.min(acc.top, ib.top),
                     left: Math.min(acc.left, ib.left),
                     right: Math.max(acc.right, ib.right),
                     bottom: Math.max(acc.bottom, ib.bottom),
                  };
               },
               { top: Infinity, left: Infinity, right: -Infinity, bottom: -Infinity }
            );
            if (bb.top !== Infinity && anchorRef.current && boundsRef.current) {
               const wb = anchorRef.current.getBoundingClientRect();
               boundsRef.current.style.left = bb.left - wb.left + "px";
               boundsRef.current.style.top = bb.top - wb.top + "px";
               boundsRef.current.style.width = bb.right - bb.left + "px";
               boundsRef.current.style.height = bb.bottom - bb.top + "px";

               const t = {
                  outer: `${wb.top - bb.top + 5}px ${bb.right - wb.right + 5}px ${bb.bottom - wb.bottom + 5}px ${wb.left - bb.left + 5}px`,
                  innerH: `${wb.top - bb.top - 5}px ${bb.right - wb.right + 10}px ${bb.bottom - wb.bottom - 5}px ${wb.left - bb.left + 10}px`,
                  innerV: `${wb.top - bb.top + 10}px ${bb.right - wb.right - 5}px ${bb.bottom - wb.bottom + 10}px ${wb.left - bb.left - 5}px`,
               };

               setBounds((p) => {
                  if (p.outer !== t.outer || p.innerH !== t.innerH || p.innerV !== t.innerV) {
                     return t;
                  }
                  return p;
               });
            }
         };
      }, []);

      useEffect(() => {
         if (dragEventBus?.current) {
            return dragEventBus.current.subscribe("trh:dragcanvas.zoom", (v) => {
               zoomRef.current = v.detail;
               redraw(boundChildren);
            });
         }
      }, [redraw, dragEventBus, boundChildren]);

      useEffect(() => {
         const onResize = lodash.debounce(redraw(boundChildren), 30);
         const n = new ResizeObserver(onResize);
         boundChildren.forEach((el) => {
            n.observe(el);
         });
         return () => {
            n.disconnect();
         };
      }, [boundChildren, redraw]);

      useEffect(() => {
         const i = anchorRef.current;
         if (i) {
            const onIntersection = redraw(boundChildren);

            const innerVObserver = new IntersectionObserver(onIntersection, { root: i, rootMargin: bounds.innerV, threshold: 1.0 });
            const innerHObserver = new IntersectionObserver(onIntersection, { root: i, rootMargin: bounds.innerH, threshold: 1.0 });
            const outerObserver = new IntersectionObserver(onIntersection, { root: i, rootMargin: bounds.outer, threshold: 1.0 });
            boundChildren.forEach((l) => {
               innerHObserver.observe(l);
               innerVObserver.observe(l);
               outerObserver.observe(l);
            });
            return () => {
               innerHObserver.disconnect();
               innerVObserver.disconnect();
               outerObserver.disconnect();
            };
         }
      }, [bounds, boundChildren, redraw]);

      const createBoundsRef = useCallback(
         (el: HTMLDivElement) => {
            (boundsRef as MutableRefObject<HTMLDivElement>).current = el;
            if (fRef) {
               if (typeof fRef === "function") {
                  fRef(el);
               } else {
                  fRef.current = el;
               }
            }
         },
         [fRef]
      );

      return (
         <div {...props}>
            <Anchor ref={anchorRef}>
               <Bounds ref={createBoundsRef} />
               <CTX.Provider value={value}>{children}</CTX.Provider>
            </Anchor>
         </div>
      );
   })
)`
   width: max-content;
   height: max-content;
`);

type Exportable = typeof Wrapper & { Contents: typeof Contents };

const BoundingBox = Wrapper as Exportable;
BoundingBox.Contents = Contents;

export default BoundingBox;

const Anchor = styled.div`
   position: relative;
   width: 0px;
   height: 0px;
`;

const Bounds = styled.div`
   position: absolute;
   pointer-events: none;
   &::after {
      content: "";
      background: #ffffff06;
      position: absolute;
      inset: -2em;
   }
`;
