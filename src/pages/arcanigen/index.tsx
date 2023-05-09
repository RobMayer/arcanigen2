/** @scope default .. */

import Page from "!/components/content/Page";
import styled from "styled-components";
// import NodeView from "./nodeView";
import { HTMLAttributes } from "react";
import NodeView from "./nodeView";
import OutputView from "./outputView";
import ArcaneGraphMenu from "./menu";
// import OutputView from "./outputView";
// import { StateProvider } from "./state";

const ArcanigenPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <Page {...props}>
         <ArcaneGraphMenu />
         <NodeView />
         <OutputView />
      </Page>
   );
})`
   display: grid;
   grid-template-columns: 1fr 1fr;
   grid-template-rows: auto 1fr;
   gap: 0.25em;
   padding: 0.25em;
   place-content: stretch;
`;

export default ArcanigenPage;
