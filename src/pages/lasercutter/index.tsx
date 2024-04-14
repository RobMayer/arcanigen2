import { HTMLAttributes } from "react";
import styled from "styled-components";
import Page from "../../components/content/Page";
import { NavLink } from "react-router-dom";

const LaserPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return <Page {...props} />;
})`
   display: grid;
   grid-template-columns: 2fr 1fr;
   grid-template-rows: auto;
   gap: 0.25em;
   padding: 0.25em;
   place-content: stretch;
`;

export default LaserPage;

export const LaserMenu = () => {
   return (
      <div>
         <NavLink to={"/laser/box/"}>Box</NavLink>
      </div>
   );
};
