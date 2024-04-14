import React, { HTMLAttributes } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import MainMenu from "./menu";
import Pages from "./pages";
import Globals from "./utility/globals";
import { BoxBuilder } from "./pages/lasercutter/definitions/box";
import Page from "./components/content/Page";
import LaserPage, { LaserMenu } from "./pages/lasercutter";

const App = () => {
   return (
      <Router>
         <Layout>
            <Routes>
               {/* <Route path={"/sandbox/"} element={<Pages.Sandbox />} /> */}
               <Route path={"/magic-circle/"} element={<Pages.Arcanigen />} />
               <Route
                  path={"/laser/"}
                  element={
                     <Page>
                        <LaserMenu />
                     </Page>
                  }
               />
               <Route
                  path={"/laser/box/"}
                  element={
                     <LaserPage>
                        <BoxBuilder.Editor />
                     </LaserPage>
                  }
               />
               <Route path={"/"} element={<Pages.Home />} />
            </Routes>
         </Layout>
      </Router>
   );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
   <React.StrictMode>
      <Globals>
         <App />
      </Globals>
   </React.StrictMode>
);

const Layout = styled(({ children, ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props} id="layout">
         <MainMenu />
         {children}
      </div>
   );
})`
   width: 100%;
   height: 100%;
   display: grid;
   grid-template-columns: auto 1fr;
`;
