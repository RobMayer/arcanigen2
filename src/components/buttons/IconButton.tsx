import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ForwardedRef, forwardRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Icon from "!/components/icons";
import Button, { ButtonProps } from "./Button";

const IconButton = styled(
   forwardRef(
      (
         {
            icon,
            children,
            className,
            flavour = "accent",
            ...props
         }: {
            icon: IconProp;
            flavour?: Flavour;
         } & ButtonProps,
         ref: ForwardedRef<HTMLDivElement>
      ) => {
         return (
            <Button {...props} className={`${className ?? ""} flavour-${flavour}`} ref={ref}>
               <Icon icon={icon} className={`icon`} />​{(children ?? null) !== null && <span className={"text"}>{children}</span>}
            </Button>
         );
      }
   )
)`
   display: inline-flex;
   align-items: center;
   & > .icon {
      mix-blend-mode: var(--blend-icon);
      filter: drop-shadow(0px 2px 1px var(--app-box-shadow));
      vertical-align: -0.1875em;
      display: inline-flex;
      flex: 0 0 auto;
   }
   color: var(--flavour-icon);
   & > .text {
      mix-blend-mode: var(--blend-decoration);
      color: var(--flavour-text);
      margin-inline: 0.125em;
   }
   &:is(:focus-visible),
   &:is(:hover) {
      color: var(--flavour-icon-highlight);
      > .text {
         color: var(--flavour-text-highlight);
      }
   }
   &.state-disabled {
      color: var(--icon-disabled) !important;
      & > .text {
         color: var(--text-disabled) !important;
      }
   }
`;

export default IconButton;
