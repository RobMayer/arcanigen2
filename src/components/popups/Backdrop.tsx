/** @scope default . */

import useResizeObserver from "!/utility/hooks/useResizeObserver";
import { HTMLAttributes, useRef, useEffect, MutableRefObject, ComponentType, useCallback, RefObject, useState } from "react";
import styled from "styled-components";

/** @scope * */

export const Backdrops = {
   Glass: styled.div`
      position: absolute;
      inset: 0;
      background: #0002;
      backdrop-filter: blur(8px);
   `,
   Clear: styled.div`
      position: absolute;
      inset: 0;
   `,
};

type BackdropProps = {
   action: () => void;
   noFocusTrap?: boolean;
   noFocusIn?: boolean;
   noEscapeKey?: boolean;
   noBackdropClose?: boolean;
   wrapperRef?: MutableRefObject<HTMLDivElement | null>;
   passthrough?: boolean;
   closeOnScroll?: boolean;
   focusRef?: RefObject<HTMLElement>;
   element?: ComponentType;
   target?: string;
} & HTMLAttributes<HTMLDivElement>;

type InsetBox = {
   top: string;
   left: string;
   width: string;
   height: string;
};

const Backdrop = ({
   action,
   noFocusTrap = false,
   noFocusIn = false,
   noEscapeKey = false,
   noBackdropClose = false,
   passthrough = false,
   closeOnScroll = false,
   children,
   style,
   wrapperRef,
   element: Element,
   focusRef,
   target,
   ...props
}: BackdropProps) => {
   const focusHold = useRef<HTMLElement>(document.activeElement as HTMLElement);
   const trapCatchStart = useRef<HTMLDivElement>(null);
   const trapCatchEnd = useRef<HTMLDivElement>(null);
   const trapInit = useRef<HTMLDivElement>(null);
   const backdrop = useRef<HTMLDivElement>(null);
   const wrapper = useRef<HTMLDivElement | null>(null);

   const [bounds, setBounds] = useState<InsetBox | null | undefined>(null);

   useEffect(() => {
      focusHold.current = document.activeElement as HTMLElement;
   }, []);

   const targetRef = useRef(target ? document.getElementById(target) : null);

   useEffect(() => {
      const n = targetRef.current;
      if (n) {
         const { top, left, width, height } = n.getBoundingClientRect();
         setBounds({ top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
         return () => {
            setBounds(null);
         };
      } else {
         setBounds(undefined);
      }
   }, []);

   useResizeObserver(
      targetRef,
      useCallback((e) => {
         const { top, left, width, height } = e.target.getBoundingClientRect();
         setBounds({ top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
      }, [])
   );

   useEffect(() => {
      if (!noFocusTrap || !noFocusIn) {
         if (!wrapper.current?.contains(focusHold.current)) {
            if (focusRef?.current) {
               focusRef.current.focus();
            } else if (trapInit.current) {
               trapInit.current.focus();
            }
         }
         const n = focusHold.current;
         return () => {
            n?.focus();
         };
      }
   }, [noFocusTrap, noFocusIn, focusRef]);

   useEffect(() => {
      if (!noFocusTrap) {
         const catchFocus = (e: FocusEvent) => {
            if (e.relatedTarget === null || e.relatedTarget === document.body) {
               if (focusRef?.current) {
                  focusRef.current.focus();
               } else if (trapInit.current) {
                  trapInit.current.focus();
               }
            }
         };
         document.addEventListener("focusout", catchFocus, {
            capture: true,
         });
         return () => {
            document.removeEventListener("focusout", catchFocus, {
               capture: true,
            });
         };
      }
   }, [noFocusTrap, focusRef]);

   useEffect(() => {
      const listener = (e: KeyboardEvent) => {
         if (!e.defaultPrevented && e.key === "Escape") {
            action();
            e.preventDefault();
         }
      };
      if (!noEscapeKey) {
         document.addEventListener("keyup", listener);
         return () => {
            document.removeEventListener("keyup", listener);
         };
      }
   }, [noEscapeKey, action]);

   useEffect(() => {
      const n = backdrop.current;
      const w = wrapper.current;
      if (n && w) {
         const clickListener = (e: MouseEvent) => {
            if (!e.defaultPrevented && (n.contains(e.target as Node) || n === e.target) && !noBackdropClose) {
               action();
               e.preventDefault();
            }
         };

         const scrollListener = (e: Event) => {
            if (closeOnScroll) {
               if (!w.contains(e.target as Node)) {
                  action();
               }
            }
         };
         n.addEventListener("click", clickListener);
         n.addEventListener("contextmenu", clickListener);
         document.addEventListener("wheel", scrollListener);
         return () => {
            n.removeEventListener("click", clickListener);
            n.removeEventListener("contextmenu", clickListener);
            document.removeEventListener("wheel", scrollListener);
         };
      }
   }, [action, noEscapeKey, noBackdropClose, closeOnScroll]);

   const focusToStart = useCallback(() => {
      if (focusRef && focusRef.current) {
         focusRef.current.focus();
      } else {
         trapCatchStart.current?.focus();
      }
   }, [focusRef]);

   const focusToEnd = useCallback(() => {
      trapCatchEnd.current?.focus();
   }, []);

   return (
      <div
         ref={(element) => {
            if (wrapperRef) {
               wrapperRef.current = element;
            }
            wrapper.current = element;
         }}
         style={{
            position: "absolute",
            inset: "0",
            ...(bounds ?? {}),
            pointerEvents: "none",
            display: target && bounds === null ? "none" : "grid",
            gridTemplateRows: "1fr",
            gridTemplateColumns: "1fr",
            alignItems: "center",
            justifyItems: "center",
            isolation: "isolate",
         }}
         tabIndex={!noFocusTrap ? -1 : undefined}
      >
         <div
            ref={backdrop}
            style={{
               pointerEvents: passthrough ? "none" : "initial",
               ...style,
               position: "absolute",
               inset: "0",
               zIndex: -1,
            }}
            {...props}
         >
            {Element && <Element />}
         </div>
         <>
            <FocusTrap tabIndex={!noFocusTrap ? 0 : undefined} onFocus={focusToEnd} />
            <FocusTrap tabIndex={-1} ref={trapCatchStart} />
            <FocusTrap tabIndex={-1} ref={trapInit} />
            <Container>{children}</Container>
            <FocusTrap tabIndex={-1} ref={trapCatchEnd} />
            <FocusTrap tabIndex={!noFocusTrap ? 0 : undefined} onFocus={focusToStart} />
         </>
      </div>
   );
};

export default Backdrop;

export const FocusTrap = styled.div`
   position: absolute;
   inset: 0;
   outline: none;
   pointer-events: none;
`;

const Container = styled.div`
   display: contents;
   pointer-events: initial;
   & > * {
      isolation: isolate;
   }
`;
