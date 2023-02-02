import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { forwardRef, ForwardedRef } from "react";
import styled from "styled-components";
import Icon from "../icons";
import Button, { ButtonProps } from "./Button";

const BigButton = styled(
   forwardRef(
      (
         {
            icon,
            checked = false,
            className,
            children,
            ...props
         }: {
            icon: IconDefinition;
            checked?: boolean;
         } & ButtonProps,
         ref: ForwardedRef<HTMLDivElement>
      ) => {
         return (
            <Button {...props} className={`${className ?? ""} ${checked ? "state-checked" : "state-unchecked"}`} ref={ref}>
               <Icon icon={icon} className={`icon`} />
               {(children ?? null) !== null && <span className={"text"}>{children}</span>}
            </Button>
         );
      }
   )
)`
   display: inline-flex;
   flex-direction: column;
   align-items: center;
   padding: 0.5em 1em;
   gap: 0.375em;

   & > .icon {
      font-size: 2.5em;
      mix-blend-mode: var(--blend-icon);
   }
   color: var(--flavour-icon);
   & > .text {
      font-size: 0.875em;
      mix-blend-mode: var(--blend-decoration);
      color: var(--flavour-text);
   }

   &:focus-visible:not(.state-inactive):not(.state-disabled),
   &:hover:not(.state-inactive):not(.state-disabled) {
      background: var(--flavour-effect-bg-highlight);
      color: var(--flavour-icon-highlight);
      > .text {
         color: var(--flavour-text-highlight);
      }
   }
   &:is(.state-checked) {
      background: var(--flavour-effect-bg-highlight);
   }
   &:is(.state-checked:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(.state-checked:hover:not(.state-inactive)):not(.state-disabled) {
      background: var(--flavour-effect-bg-overlight);
   }
   &.state-disabled {
      color: var(--icon-disabled) !important;
      & > .text {
         color: var(--text-disabled) !important;
      }
   }
`;

export default BigButton;
