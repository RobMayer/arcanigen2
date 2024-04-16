import { faCaretDown, faCaretRight } from "@fortawesome/pro-solid-svg-icons";
import { ReactNode, HTMLAttributes, useCallback, ComponentType, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import Icon from "../icons";

type Bar = {
   className?: string;
   onToggle: () => void;
   isOpen: boolean;
   flavour?: Flavour;
   children?: ReactNode;
   disabled?: boolean;
   title?: string;
};

type FoldoutProps = {
   label: ReactNode;
   startOpen?: boolean;
   bar?: ComponentType<Bar>;
   barClass?: string;
   flavour?: Flavour;
   disabled?: boolean;
};

type ControlledFoldoutProps = {
   label: ReactNode;
   isOpen: boolean;
   onToggle: (v: boolean) => void;
   bar?: ComponentType<Bar>;
   barClass?: string;
   flavour?: Flavour;
   disabled?: boolean;
};

const Foldout = ({ bar: Bar = DefaultBar, startOpen = false, label, barClass, flavour = "accent", disabled, title, ...props }: HTMLAttributes<HTMLDivElement> & FoldoutProps) => {
   const [state, setState] = useState<boolean>(startOpen);

   const handleToggle = useCallback(() => {
      setState((p) => !p);
   }, []);

   return (
      <>
         <BarWrapper>
            <Bar onToggle={handleToggle} isOpen={state} className={barClass} flavour={flavour} disabled={disabled} title={title}>
               {label}
            </Bar>
         </BarWrapper>
         {state && (
            <Body>
               <div {...props} />
            </Body>
         )}
      </>
   );
};

const ControlledFoldout = ({ bar: Bar = DefaultBar, isOpen, onToggle, label, barClass, flavour = "accent", disabled, title, ...props }: HTMLAttributes<HTMLDivElement> & ControlledFoldoutProps) => {
   const handleToggle = useCallback(() => {
      onToggle(!isOpen);
   }, [onToggle, isOpen]);

   return (
      <>
         <BarWrapper>
            <Bar onToggle={handleToggle} isOpen={isOpen} className={barClass} flavour={flavour} disabled={disabled} title={title}>
               {label}
            </Bar>
         </BarWrapper>
         {isOpen && (
            <Body>
               <div {...props} />
            </Body>
         )}
      </>
   );
};

export { Foldout, ControlledFoldout };

const Body = styled.div`
   overflow-y: auto;
   flex: 1 0 0%;
`;

const BarWrapper = styled.div`
   display: grid;
`;

const DefaultBar = styled(({ flavour, isOpen, onToggle, children, title, className, ...props }: Bar) => {
   return (
      <Button {...props} className={`${className ?? ""} state-${isOpen ? "open" : "closed"}`} onClick={onToggle} title={title}>
         <Icon icon={isOpen ? faCaretDown : faCaretRight} />
         <div>{children}</div>
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
`;
