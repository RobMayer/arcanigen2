import { ArcaneGraphProvider } from "!/pages/arcanigen/definitions/graph";
import { ReactNode } from "react";
import { UIStateProvider } from "./hooks/useUIState";

const Globals = ({ children }: { children?: ReactNode }) => {
   return (
      <UIStateProvider>
         <ArcaneGraphProvider>{children}</ArcaneGraphProvider>
      </UIStateProvider>
   );
};

export default Globals;
