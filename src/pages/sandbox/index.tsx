import Page from "!/components/content/Page";
import { HTMLAttributes } from "react";
import styled from "styled-components";
import { ButtonsDemo } from "./demos/buttons";
import { InputDemo } from "./demos/inputs";

const SandboxPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <Page {...props}>
         <ButtonsDemo />
         <InputDemo />
      </Page>
   );
})`
   display: grid;
   grid-template-columns: 1fr;
   align-items: start;
   align-content: start;
`;

export default SandboxPage;
