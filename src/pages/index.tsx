import ActionButton from "!/components/buttons/ActionButton";
import Link from "!/components/buttons/Link";
import Page from "!/components/content/Page";
import { HTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ArcanigenPage from "./arcanigen";
import SandboxPage from "./sandbox";
import LaserPage from "./lasercutter";
import { iconSocialInstagram } from "../components/icons/social/instagram";
import { iconSocialGithub } from "../components/icons/social/github";
import { iconSocialDiscord } from "../components/icons/social/discord";
import { Icon } from "../components/icons";
// import Sandbox from "./sandbox";

/** @scope default . */
const Home = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <Page {...props}>
            <Splash />
        </Page>
    );
})`
    display: grid;
    place-items: center;
`;

const Pages = {
    Home,
    Arcanigen: ArcanigenPage,
    Laser: LaserPage,
    Sandbox: SandboxPage,
};

export default Pages;

const Splash = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props}>
            <h1>Greetings</h1>
            <img src="/kdy.svg" alt="logo" />
            <Socials />
            <div>Projects</div>
            <GoButton />
        </div>
    );
})`
    display: grid;
    justify-items: center;
    justify-content: center;
    gap: 1em;
    & > img {
        width: 30vmin;
        aspect-ratio: 1;
    }
    & > h1 {
        text-align: center;
        font-size: 2rem;
        font-variant: small-caps;
    }
`;

const Socials = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props}>
            <div>
                <Link url="https://www.instagram.com/thatrobhuman/" target="_blank" rel="noreferrer">
                    <Icon value={iconSocialInstagram} /> ThatRobHuman
                </Link>
            </div>
            <div>
                <Link url="https://github.com/RobMayer" target="_blank" rel="noreferrer">
                    <Icon value={iconSocialGithub} /> RobMayer
                </Link>
            </div>
            <div>
                <Link url="https://discord.gg/rxvVzyNtjb" target="_blank" rel="noreferrer">
                    <Icon value={iconSocialDiscord} /> Nerdforge
                </Link>
            </div>
        </div>
    );
})`
    display: flex;
    gap: 1em;
    align-items: center;
    justify-self: center;
`;

const GoButton = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const nav = useNavigate();
    return (
        <div {...props}>
            <ActionButton
                onAction={() => {
                    nav("/magic-circle/");
                }}
            >
                Arcanigen
            </ActionButton>
            <ActionButton
                onAction={() => {
                    nav("/gridfinity-gamma/");
                }}
            >
                GridFinity Gamma
            </ActionButton>
        </div>
    );
})`
    place-self: stretch;
    align-self: stretch;
    justify-self: stretch;
    display: grid;
    font-size: 1.25em;
    font-variant: small-caps;
    gap: 0.5em;
`;
