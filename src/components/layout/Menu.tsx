import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faMagicWandSparkles, faEye, faCog } from "@fortawesome/pro-solid-svg-icons";
import { HTMLAttributes, useCallback, MouseEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Flavour } from "..";
import { ButtonProps } from "../buttons/Button";
import IconButton from "../buttons/IconButton";

const Menu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         <Group>
            <MenuButton icon={faMagicWandSparkles} to={"/arcanigen/"} />
         </Group>
         <Group>
            <MenuButton icon={faEye} to={"/sandbox/"} />
            <MenuButton icon={faCog} to={"/elsewhere/"} />
         </Group>
      </div>
   );
})`
   display: grid;
   grid-template-rows: 1fr auto;
   background: var(--layer2);
   font-size: 1.375rem;
`;

export default Menu;

const Group = styled.div`
   display: flex;
   flex-direction: column;
`;

const MenuButton = styled(
   ({
      to,
      className,
      ...props
   }: {
      to: string;
      icon: IconProp;
      flavour?: Flavour;
   } & ButtonProps) => {
      const navigate = useNavigate();
      const { pathname: url } = useLocation();

      const handleClick = useCallback(
         (e: MouseEvent<HTMLDivElement>) => {
            if (!e.defaultPrevented) {
               navigate(to);
               e.preventDefault();
            }
         },
         [to, navigate]
      );

      return <IconButton className={`${className ?? ""} ${url === to ? "state-current" : ""}`} {...props} onClick={handleClick} />;
   }
)`
   padding-inline: 0.5em;
   aspect-ratio: 1;
   &.state-current {
      background: var(--layer1);
   }
`;
