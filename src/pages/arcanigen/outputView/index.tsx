import DragCanvas from "!/components/containers/DragCanvas";
import { HTMLAttributes } from "react";
import styled from "styled-components";
import { RootNodeRenderer } from "../definitions/values/resultNode";

const OutputView = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <DragCanvas>
         <div {...props}>
            <RootNodeRenderer />
         </div>
      </DragCanvas>
   );
})``;
export default OutputView;
