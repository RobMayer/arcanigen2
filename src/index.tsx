import React, { HTMLAttributes } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import Menu from "./components/layout/Menu";
import Pages from "./pages";

const App = () => {
   return (
      <Router>
         <Layout>
            <Routes>
               <Route path={"/arcanigen/"} element={<Pages.Arcanigen />} />
               <Route path={"/"} element={<Pages.Home />} />
            </Routes>
         </Layout>
      </Router>
   );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
);

const Layout = styled(({ children, ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props} id="layout">
         <Menu />
         {children}
      </div>
   );
})`
   width: 100%;
   height: 100%;
   display: grid;
   grid-template-columns: auto 1fr;
`;
