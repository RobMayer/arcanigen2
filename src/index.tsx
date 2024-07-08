import React, { HTMLAttributes } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import MainMenu from "./menu";
import Pages from "./pages";
import Globals from "./utility/globals";
import { GridfinityGamma } from "./pages/gridfinity-gamma";

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path={"/sandbox/*"} element={<Pages.Sandbox />} />
                    <Route path={"/magic-circle/"} element={<Pages.Arcanigen />} />
                    <Route path={"/laser/"} element={<Pages.Laser />} />
                    <Route path={"/gridfinity-gamma/"} element={<GridfinityGamma />} />
                    <Route path={"/"} element={<Pages.Home />} />
                </Routes>
            </Layout>
        </Router>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Globals>
        <App />
    </Globals>
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
