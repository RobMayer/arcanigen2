import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faHome, faMagicWandSparkles } from "@fortawesome/pro-solid-svg-icons";
import { HTMLAttributes, useCallback, MouseEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Flavour } from "./components";
import { ButtonProps } from "./components/buttons/Button";
import IconButton from "./components/buttons/IconButton";

const MainMenu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         <Group>
            <MenuButton icon={faHome} to={"/"} />
            <MenuButton icon={faMagicWandSparkles} to={"/magic-circle/"} />
         </Group>
         <Group></Group>
      </div>
   );
})`
   display: grid;
   grid-template-rows: 1fr auto;
   background: var(--layer2);
   font-size: 1.375rem;
`;

export default MainMenu;

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
