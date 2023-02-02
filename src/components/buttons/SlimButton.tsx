import { forwardRef, ForwardedRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button, { ButtonProps } from "./Button";

const SlimButton = styled(
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
         return (
            <Button
               ref={ref}
               {...props}
               className={`
        ${className ?? ""}
        flavour-${flavour}
        ${checked ? "state-checked" : "state-unchecked"}
      `}
            />
         );
      }
   )
)`
   padding: 0 0.25em;
   mix-blend-mode: var(--blend-decoration);
   text-align: left;
   &.state-inactive {
      cursor: default;
   }
   color: var(--flavour-icon);
   &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(:hover:not(.state-inactive)):not(.state-disabled) {
      color: var(--flavour-icon-highlight);
      background: var(--flavour-effect-bg-highlight);
   }
   &:is(.state-checked) {
      color: var(--flavour-icon-highlight);
      background: var(--flavour-effect-bg-highlight);
   }
   &:is(.state-checked:focus-visible:not(.state-inactive)):not(.state-disabled),
   &:is(.state-checked:hover:not(.state-inactive)):not(.state-disabled) {
      color: var(--flavour-icon-overlight);
      background: var(--flavour-effect-bg-overlight);
   }
   &.state-disabled {
      color: var(--icon-disabled);
      &:hover {
         background: none;
      }
   }
`;

export default SlimButton;
