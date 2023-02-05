import { ForwardedRef, forwardRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button, { ButtonProps } from "./Button";

const ActionButton = styled(
   forwardRef(
      (
         {
            checked = false,
            className,
            flavour = "accent",
            ...props
         }: {
            checked?: boolean;
            flavour?: Flavour;
         } & ButtonProps,
         ref: ForwardedRef<HTMLDivElement>
      ) => {
         return <Button ref={ref} {...props} className={`${className ?? ""} flavour-${flavour} ${checked ? "state-checked" : "state-unchecked"}`} />;
      }
   )
)`
   position: relative;
   margin: 0.25rem;
   padding: 0.25em 0.5em;
   border: 1px solid transparent;
   text-align: center;
   justify-content: center;
   gap: 0.5em;
   &:is(.state-inactive) {
      cursor: default;
   }
   &:is(.rounded) {
      border-radius: 0.25rem;
   }
   &:is(.bolded) {
      font-weight: bold;
   }
   &:is(.small) {
      font-size: 0.875rem;
   }
   &:is(.slim) {
      margin: 0.125rem;
      padding: 0px 0.25em;
   }
   &:is(.pill) {
      padding-inline: 0.375em;
      border-radius: 100vw;
   }
   color: var(--flavour-button-text);
   background: var(--flavour-button);

   &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(:hover:not(.state-inactive)):not(.state-disabled) {
      color: var(--flavour-button-text-highlight);
      background: var(--flavour-button-highlight);
   }
   &:is(.state-checked) {
      border: 1px solid var(--effect-border-selected);
      background: var(--flavour-button-highlight);
   }
   &:is(.state-checked:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(.state-checked:hover:not(.state-inactive)):not(.state-disabled) {
      background: var(--flavour-button-overlight);
   }
   &.state-disabled {
      background: var(--disabled-button);
      color: var(--disabled-button-text);
   }
`;

export default ActionButton;
