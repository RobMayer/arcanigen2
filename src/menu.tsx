import { HTMLAttributes, useCallback, MouseEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Flavour } from "./components";
import { ButtonProps } from "./components/buttons/Button";
import IconButton from "./components/buttons/IconButton";
import { IconDefinition } from "./components/icons";

const ICON_HOME = {
    width: 576,
    height: 512,
    path: "M511.8 287.6H576V240L288.4 0 0 240v47.6H64.1V512H224V352H352V512H512.8l-1-224.4z",
};

const ICON_MAGIC = {
    width: 576,
    height: 512,
    path: "M234.7 42.7L192 64l42.7 21.3L256 128l21.3-42.7L320 64 277.3 42.7 256 0 234.7 42.7zM384.4 192.4l-32.8-32.8L432 79.2 464.8 112l-80.4 80.4zM96 32L64 96 0 128l64 32 32 64 32-64 64-32L128 96 96 32zM416 352l-64 32 64 32 32 64 32-64 64-32-64-32-32-64-32 64zM144 512l39.6-39.6L504.4 151.6 544 112 504.4 72.4 471.6 39.6 432 0 392.4 39.6 71.6 360.4 32 400l39.6 39.6 32.8 32.8L144 512z",
};

const ICON_BOX = {
    width: 448,
    height: 512,
    path: "M64 32L0 160H208V32H64zM240 160H448L384 32H240V160zm208 32H0V480H448V192z",
};

const MainMenu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props}>
            <Group>
                <MenuButton icon={ICON_HOME} to={"/"} />
                <MenuButton icon={ICON_MAGIC} to={"/magic-circle/"} />
                <MenuButton icon={ICON_BOX} to={"/laser/"} />
                {/* <MenuButton icon={faEye} to={"/sandbox/"} /> */}
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
        flavour,
        icon,
    }: {
        to: string;
        icon: IconDefinition;
        flavour?: Flavour;
    } & ButtonProps) => {
        const navigate = useNavigate();
        const { pathname: url } = useLocation();

        const handleClick = useCallback(() => {
            navigate(to);
        }, [to, navigate]);

        return <IconButton className={`${className ?? ""} ${url === to ? "state-current" : ""}`} flavour={flavour} icon={icon} onAction={handleClick} />;
    }
)`
    padding: 0.25em;
    aspect-ratio: 1;
    &.state-current {
        background: var(--layer1);
    }
`;
