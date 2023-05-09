import { HTMLAttributes } from "react";
import styled from "styled-components";
import SaveGraph from "./saveGraph";
import LoadGraph from "./loadGraph";
import ExportSVG from "./exportSvg";
import ExportPNG from "./exportPng";
import ResetGraph from "./resetGraph";
import LoadExample from "./loadExample";

const ArcaneGraphMenu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <>
         <div {...props}>
            <SaveGraph />
            <LoadGraph />
            <LoadExample />
            <ExportSVG />
            <ExportPNG />
            <ResetGraph />
            {/* <ActionButton flavour={"info"} onClick={debug} title={"outputs the current state into the console"}>
                <Icon icon={faBug} />
             </ActionButton> */}
         </div>
      </>
   );
})`
   display: flex;
   grid-column: 1 / -1;
   border: 1px solid var(--effect-border-highlight);
   align-items: center;
`;

export default ArcaneGraphMenu;
