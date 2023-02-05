import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import styled from "styled-components";
import { Flavour } from "..";

const Link = styled(
   ({ className, flavour = "accent", ...props }: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & { flavour?: Flavour }) => {
      return <a className={`${className ?? ""} flavour-${flavour}`} {...props} />;
   }
)`
   cursor: pointer;
   margin-inline: 0.25em;
   color: var(--flavour-text);
   mix-blend-mode: var(--blend-decoration);
   text-decoration: underline solid var(--flavour-text-muted);
   &:focus-visible,
   &:hover {
      color: var(--flavour-text-highlight);
      text-decoration: underline solid var(--flavour-text);
      background: var(--flavour-effect-bg-highlight);
   }
   &:disabled {
      color: var(--text-disabled);
      text-decoration: underline solid var(--text-disabled-muted);
      &:focus-visible,
      &:hover {
         text-decoration: underline solid var(--emphasis-text-muted);
      }
   }
`;

export default Link;
