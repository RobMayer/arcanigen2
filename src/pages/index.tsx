import Page from "!/components/layout/Page";
import { HTMLAttributes } from "react";
import styled from "styled-components";
import ArcanigenPage from "./arcanigen";
// import Sandbox from "./sandbox";

/** @scope default . */
const Home = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return <Page {...props}></Page>;
})``;

const Pages = {
   Home,
   Arcanigen: ArcanigenPage,
};

export default Pages;
