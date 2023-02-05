import { faCaretDown, faCaretLeft, faCaretRight, faCaretUp } from "@fortawesome/pro-solid-svg-icons";
import { HTMLAttributes, ReactNode, useCallback, useEffect, useState, MouseEvent, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import Icon from "../icons";

type Direction = "up" | "down" | "left" | "right";

export type SlideoutBarProps = {
   flavour?: Flavour;
   isOpen: boolean;
   direction: Direction;
   onToggle: () => void;
   className?: string;
   children?: ReactNode;
   disabled?: boolean;
   title?: string;
};

type IProps<T extends SlideoutBarProps> = Omit<T, keyof SlideoutBarProps> & {
   direction: Direction;
   isOpen?: boolean;
   flavour?: Flavour;
   label?: ReactNode;
   onToggle?: () => void;
   bar?: (p: T) => JSX.Element;
   disabled?: boolean;
   size?: string;
   title?: string;
   children?: ReactNode;
};

const Slideout = styled(
   <T extends SlideoutBarProps = SlideoutBarProps>({
      bar: Bar = SlideoutBars.Typical as (p: T) => JSX.Element,
      direction,
      isOpen = false,
      onToggle,
      label,
      flavour,
      title,
      disabled = false,
      size = "auto",
      children,
      ...rest
   }: IProps<T>) => {
      const [state, setState] = useState<boolean>(isOpen);

      useEffect(() => {
         setState(isOpen);
      }, [isOpen]);

      const handleToggle = useCallback(() => {
         setState((p) => !p);
         onToggle && onToggle();
      }, [onToggle]);

      const nS = useMemo(() => {
         return {
            width: direction === "up" || direction === "down" ? "auto" : state ? size : "auto",
            height: direction === "left" || direction === "right" ? "auto" : state ? size : "auto",
         };
      }, [direction, state, size]);

      return (
         <Wrapper direction={direction} isOpen={state} style={nS}>
            <BarWrapper>
               <Bar flavour={flavour} {...((rest ?? {}) as T)} isOpen={state} direction={direction} onToggle={handleToggle} disabled={disabled} title={title}>
                  {label}
               </Bar>
            </BarWrapper>
            {state && <Inner>{children}</Inner>}
         </Wrapper>
      );
   }
)``;

export default Slideout;

const Inner = styled.div`
   overflow-y: auto;
   display: flex;
   flex-direction: column;
   flex: 1 1 auto;
   writing-mode: horizontal-tb;
`;

const getIconDirection = (direction: Direction, isOpen: boolean) => {
   switch (direction) {
      case "down":
         return isOpen ? "up" : "down";
      case "up":
         return isOpen ? "down" : "up";
      case "right":
         return isOpen ? "left" : "right";
      case "left":
         return isOpen ? "right" : "left";
   }
};

const SlideoutBars = {
   getIconDirection,
   Minimal: styled(({ flavour = "accent", isOpen, direction, onToggle, children, className, disabled, title, ...props }: SlideoutBarProps) => {
      const handleToggle = useCallback(
         (e: MouseEvent<HTMLDivElement>) => {
            if (!e.defaultPrevented) {
               onToggle();
               e.preventDefault();
            }
         },
         [onToggle]
      );

      const icon = useMemo(() => getCaret(direction, isOpen), [direction, isOpen]);

      return (
         <Button {...props} onClick={handleToggle} className={`${className ?? ""} flavour-${flavour} direction-${direction}`} disabled={disabled} title={title}>
            <Icon icon={icon} />
         </Button>
      );
   })`
      text-align: start;
      justify-self: stretch;
      display: grid;
      grid-template-columns: auto;
      align-items: center;
      color: var(--flavour-button-text);
      background: var(--flavour-button);
      border: 1px solid var(--effect-border-reduced);

      &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
      &:is(:hover:not(.state-inactive)):not(.state-disabled) {
         color: var(--flavour-button-text-highlight);
         background: var(--flavour-button-highlight);
      }
      &.state-disabled {
         background: var(--disabled-button);
         color: var(--disabled-button-text);
      }
   `,
   Typical: styled(({ flavour = "accent", isOpen, direction, onToggle, children, className, disabled, title }: SlideoutBarProps) => {
      const handleToggle = useCallback(
         (e: MouseEvent<HTMLDivElement>) => {
            if (!e.defaultPrevented) {
               onToggle();
               e.preventDefault();
            }
         },
         [onToggle]
      );

      const icon = useMemo(() => getCaret(direction, isOpen), [direction, isOpen]);

      return (
         <Button onClick={handleToggle} className={`${className ?? ""} flavour-${flavour} direction-${direction}`} disabled={disabled} title={title}>
            <Icon icon={icon} />
            {children}
         </Button>
      );
   })`
      text-align: start;
      justify-self: stretch;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      color: var(--flavour-button-text);
      background: var(--flavour-button);
      border: 1px solid var(--effect-border-reduced);

      &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
      &:is(:hover:not(.state-inactive)):not(.state-disabled) {
         color: var(--flavour-button-text-highlight);
         background: var(--flavour-button-highlight);
      }
      &.state-disabled {
         background: var(--disabled-button);
         color: var(--disabled-button-text);
      }
   `,
};

const Wrapper = styled(
   ({
      direction,
      className,
      children,
      isOpen,
      style,
   }: { direction: Direction; className?: string; children?: ReactNode; isOpen: boolean } & HTMLAttributes<HTMLDivElement>) => {
      return (
         <div className={`${className ?? ""} direction-${direction} ${isOpen ? "state-open" : "state-closed"}`} style={style}>
            {children}
         </div>
      );
   }
)`
   display: flex;
   &.direction-down {
      flex-direction: column-reverse;
   }
   &.direction-up {
      flex-direction: column;
   }

   &.direction-left {
      flex-direction: column;
      writing-mode: vertical-lr;
   }
   &.direction-right {
      flex-direction: column-reverse;
      writing-mode: vertical-lr;
   }
   section:has(> &.direction-left),
   section:has(> &.direction-right) {
      writing-mode: vertical-lr;
   }
`;

const BarWrapper = styled.div`
   display: grid;
   flex: 0 0 auto;
   inline-size: 100%;
`;

const getCaret = (direction: Direction, isOpen: boolean) => {
   switch (SlideoutBars.getIconDirection(direction, isOpen)) {
      case "down":
         return faCaretDown;
      case "up":
         return faCaretUp;
      case "left":
         return faCaretLeft;
      case "right":
         return faCaretRight;
   }
};
