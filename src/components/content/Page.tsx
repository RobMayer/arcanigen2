import { HTMLAttributes } from "react";
import styled from "styled-components";

const Page = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return <div {...props} />;
})`
   background: var(--layer1);
   height: 100%;
   overflow-y: auto;
`;

export default Page;
