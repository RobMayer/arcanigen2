import ActionButton from "!/components/buttons/ActionButton";
import Link from "!/components/buttons/Link";
import Icon from "!/components/icons";
import Page from "!/components/content/Page";
import { faDiscord, faGithub, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { HTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ArcanigenPage from "./arcanigen";
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
};

export default Pages;

const Splash = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         <h1>Greetings</h1>
         <img src="/kdy.svg" alt="logo" />
         <Socials />
         <div>This is still a work in progress: use at your own peril</div>
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
            <Link href="https://www.instagram.com/thatrobhuman/" target="_blank" rel="noreferrer">
               <Icon icon={faInstagram} /> ThatRobHuman
            </Link>
         </div>
         <div>
            <Link href="https://github.com/RobMayer" target="_blank" rel="noreferrer">
               <Icon icon={faGithub} /> RobMayer
            </Link>
         </div>
         <div>
            <Link href="https://discord.gg/rxvVzyNtjb" target="_blank" rel="noreferrer">
               <Icon icon={faDiscord} /> Nerdforge
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
            onClick={() => {
               nav("/magic-circle/");
            }}
         >
            Proceed
         </ActionButton>
      </div>
   );
})`
   place-self: stretch;
   align-self: stretch;
   justify-self: stretch;
   display: grid;
   font-size: 1.5em;
   font-variant: small-caps;
`;
