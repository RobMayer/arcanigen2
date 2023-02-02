import { HTMLAttributes } from "react";
import styled from "styled-components";

const Pane = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return <div {...props} />;
})`
   align-self: stretch;
   justify-self: stretch;
   overflow-y: scroll;
   height: 100%;
`;

export default Pane;
