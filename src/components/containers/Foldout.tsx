import { faCaretDown, faCaretRight } from "@fortawesome/pro-solid-svg-icons";
import { ReactNode, HTMLAttributes, useCallback, ComponentType, useEffect, useState } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import Icon from "../icons";

type FoldoutBarProps = {
   className?: string;
   onToggle: () => void;
   isOpen: boolean;
   flavour?: Flavour;
   children?: ReactNode;
   disabled?: boolean;
   title?: string;
};

type IProps = {
   label: ReactNode;
   isOpen?: boolean;
   onToggle?: () => void;
   bar?: ComponentType<FoldoutBarProps>;
   barClass?: string;
   flavour?: Flavour;
   disabled?: boolean;
};

const Foldout = ({
   bar: Bar = DefaultBar,
   isOpen = false,
   label,
   onToggle,
   barClass,
   flavour = "accent",
   disabled,
   title,
   ...props
}: HTMLAttributes<HTMLDivElement> & IProps) => {
   const [state, setState] = useState<boolean>(isOpen);

   useEffect(() => {
      setState(isOpen);
   }, [isOpen]);

   const handleToggle = useCallback(() => {
      setState((p) => !p);
      onToggle && onToggle();
   }, [onToggle]);

   return (
      <PassThrough>
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
      </PassThrough>
   );
};

export default Foldout;

const PassThrough = styled.div`
   display: contents;
`;

const Body = styled.div`
   overflow-y: auto;
   flex: 1 0 0%;
`;

const BarWrapper = styled.div`
   display: grid;
`;

const DefaultBar = styled(({ flavour, isOpen, onToggle, children, title, className, ...props }: FoldoutBarProps) => {
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
