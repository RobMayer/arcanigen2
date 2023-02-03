import { HTMLAttributes } from "react";
import styled from "styled-components";
import { RootNodeRenderer } from "../definitions/values/resultNode";

const OutputView = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         <RootNodeRenderer />
      </div>
   );
})``;
export default OutputView;
