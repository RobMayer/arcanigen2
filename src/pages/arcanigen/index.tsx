/** @scope default .. */

import Page from "!/components/layout/Page";
import styled from "styled-components";
// import NodeView from "./nodeView";
import { HTMLAttributes } from "react";
// import OutputView from "./outputView";
// import { StateProvider } from "./state";

const ArcanigenPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      //   <StateProvider>
      <Page {...props}>
         {/* <NodeView /> */}
         {/* <OutputView /> */}
      </Page>
      //   </StateProvider>
   );
})`
   display: grid;
   grid-template-columns: 1fr 1fr;
   grid-template-rows: 1fr;
   gap: 0.5em;
   padding: 0.25em;
   place-content: stretch;
`;

export default ArcanigenPage;
