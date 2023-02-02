import { useEffect, useMemo, useRef, useState, MouseEvent, ReactNode, HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import Backdrop, { Backdrops } from "./Backdrop";
import { Direction, Justification, ArrowProps, BoundingBox, Popup } from "./Popup";

const ContextMenu = ({
   align = "down right",
   justify = "start",
   onClose,
   controls,
   arrow,
   children,
   wrapper = ContextMenuWrappers.Typical as (p: HTMLAttributes<HTMLDivElement>) => JSX.Element,
}: ContextMenuProps) => {
   const containerRef = useRef<HTMLDivElement>(null);

   const { close, position } = controls;

   useEffect(() => {
      const container = containerRef.current;
      if (position && container) {
         const interceptClick = (e: globalThis.MouseEvent) => {
            const el = document.getElementById("widget-root");
            if (el && !e.defaultPrevented) {
               if (!el.contains(e.target as Node)) {
                  close();
                  e.preventDefault();
               }
            }
         };
         document.addEventListener("click", interceptClick, { capture: true });
         document.addEventListener("contextmenu", interceptClick);
         return () => {
            document.removeEventListener("click", interceptClick, {
               capture: true,
            });
            document.removeEventListener("contextmenu", interceptClick);
         };
      }
   }, [position, close]);

   return position ? (
      createPortal(
         <Backdrop action={close} wrapperRef={containerRef} element={Backdrops.Clear} passthrough closeOnScroll>
            <Popup target={position} align={align} justify={justify} arrow={arrow} wrapper={wrapper}>
               {children}
            </Popup>
         </Backdrop>,
         document.getElementById("widget-root")!
      )
   ) : (
      <></>
   );
};

export default ContextMenu;

export const ContextMenuWrappers = {
   Typical: styled.div`
      background: var(--layer1);
      border: 1px solid var(--effect-border-highlight);
      outline: 1px solid var(--effect-border-muted);
      color: var(--text);
      display: flex;
      flex-direction: column;
      box-shadow: 0px 0px 4px #0008;
   `,
};

type ContextMenuProps = {
   align?: Direction;
   justify?: Justification;
   onClose?: () => void;
   arrow?: Partial<ArrowProps>;
   controls: ContextMenuControls;
   children?: ReactNode;
   wrapper?: (p: HTMLAttributes<HTMLDivElement>) => JSX.Element;
};

export type ContextMenuControls = {
   open: {
      at: (x: number, y: number, width?: number, height?: number) => void;
      when: (e: MouseEvent) => void;
      on: (element: Element) => void;
      for: (e: MouseEvent) => void;
   };
   isOpen: boolean;
   close: () => void;
   position: BoundingBox | null;
};

export const useContextMenu = (onClose?: () => void) => {
   const [pos, setPos] = useState<BoundingBox | null>(null);

   return useMemo<ContextMenuControls>(() => {
      return {
         open: {
            at: (x: number, y: number, width: number = 0, height: number = 0) => {
               setPos({ x, y, width, height });
            },
            on: (element: Element) => {
               const { x, y, width, height } = element.getBoundingClientRect();
               setPos({ x, y, width, height });
            },
            when: (e: MouseEvent) => {
               setPos({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
            },
            for: (e: MouseEvent) => {
               const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
               setPos({ x, y, width, height });
            },
         },
         isOpen: pos !== null,
         close: () => {
            setPos(null);
            onClose && onClose();
         },
         position: pos,
      };
   }, [pos, onClose]);
};
