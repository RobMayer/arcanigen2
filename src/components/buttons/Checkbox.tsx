import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheckSquare, faSquare } from "@fortawesome/pro-solid-svg-icons";
import styled from "styled-components";
import { Flavour } from "..";
import Icon from "../icons";
import Button, { ButtonProps } from "./Button";
import { MouseEvent, useCallback, useEffect, useRef } from "react";

const Checkbox = styled(
   ({
      icon,
      checked = false,
      className,
      disabled,
      children,
      flavour = "accent",
      onToggle,
      onClick,
      ...props
   }: {
      icon?: IconProp;
      checked: boolean;
      flavour?: Flavour;
      onToggle: (v: boolean) => void;
   } & ButtonProps) => {
      const cache = useRef<boolean>(checked);
      useEffect(() => {
         cache.current = checked;
      }, [checked]);

      const handleClick = useCallback(
         (e: MouseEvent<HTMLDivElement>) => {
            onClick && onClick(e);
            onToggle && onToggle(!cache.current);
         },
         [onClick, onToggle]
      );

      return (
         <Button {...props} className={`${className ?? ""} flavour-${flavour} ${checked ? "state-checked" : ""}`} disabled={disabled} onClick={handleClick}>
            <Icon icon={icon ?? checked ? faCheckSquare : faSquare} className={`icon`} />
            {(children ?? null) !== null && <span className={"text"}>{children}</span>}
         </Button>
      );
   }
)`
   & > .icon {
      mix-blend-mode: var(--blend-icon);
   }
   & > .text {
      padding-inline: 0.125em;
      color: var(--text);
      mix-blend-mode: var(--blend-decoration);
   }
   color: var(--flavour-icon);
   &:is(:hover),
   &:is(:focus-visible),
   &:is(.state-checked) {
      color: var(--flavour-icon-highlight);
      > .text {
         color: var(--text-highlight);
      }
   }
   &:is(.state-checked:focus-visible),
   &:is(.state-checked:hover) {
      color: var(--flavour-icon-overlight);
   }
   &.state-disabled {
      color: var(--icon-disabled);
      &:is(.state-checked) {
         color: var(--icon-disabled-checked);
      }
      > .text {
         color: var(--text-muted);
      }
   }
`;

export default Checkbox;
