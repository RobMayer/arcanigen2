import { FontAwesomeIconProps, FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const Icon = styled(({ className, ...props }: FontAwesomeIconProps) => {
   return <FontAwesomeIcon className={`${className ?? ""} fa-fw`} {...props} />;
})`
   position: relative;
   mix-blend-mode: var(--blend-icon);
   &.muted {
      color: var(--icon-muted);
   }
   &.flavour-accent,
   &.flavour-emphasis,
   &.flavour-danger,
   &.flavour-info,
   &.flavour-help,
   &.flavour-confirm {
      color: var(--flavour-icon);
   }
`;

export default Icon;
