import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { forwardRef, ForwardedRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Icon from "../icons";
import Button, { ButtonProps } from "./Button";

const CardButton = styled(
   forwardRef(
      (
         {
            icon,
            checked = false,
            className,
            children,
            flavour = "accent",
            ...props
         }: {
            icon: IconProp;
            checked?: boolean;
            flavour?: Flavour;
         } & ButtonProps,
         ref: ForwardedRef<HTMLDivElement>
      ) => {
         return (
            <Button {...props} className={`${className ?? ""} flavour-${flavour} ${checked ? "state-checked" : "state-unchecked"}`} ref={ref}>
               <span className={"text"}>{children}</span>
               <Icon icon={icon} className={`icon`} />
            </Button>
         );
      }
   )
)`
   display: inline-flex;
   flex-direction: column;
   align-items: stretch;
   align-content: center;
   border: 1px solid var(--effect-border-highlight);
   padding: 3px;
   color: var(--text);
   background: var(--layer-up);
   aspect-ratio: 0.825;

   & > .icon {
      font-size: 3.5vmin;
      mix-blend-mode: var(--blend-icon);
      padding: 0.25em;

      align-self: center;
      justify-self: center;
      color: var(--flavour-icon);
      flex: 1 1 auto;
   }

   & > .text {
      font-size: min(1vmin, 0.875em);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow-x: hidden;
      background: var(--flavour-button-muted);
      text-align: center;
      border: none;
      padding-inline: 0.5em;
      border: 1px solid var(--effect-border-highlight);
   }

   &:focus-visible:not(.state-inactive):not(.state-disabled),
   &:hover:not(.state-inactive):not(.state-disabled) {
      border: 1px solid var(--effect-border-highlight);
      background: var(--layer-up-highlight);
      & > .text {
         background: var(--flavour-button);
      }
      & > .icon {
         color: var(--flavour-icon-highlight);
      }
   }
   &:is(.state-checked) {
      background: var(--layer-up-highlight);
   }
   &:is(.state-checked:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(.state-checked:hover:not(.state-inactive)):not(.state-disabled) {
      background: var(--layer-up-overlight);
   }
   &.state-disabled {
      color: var(--icon-disabled) !important;
      & > .text {
         color: var(--text-disabled) !important;
      }
   }
`;

export default CardButton;
