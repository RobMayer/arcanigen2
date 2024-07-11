/** @scope default .. */

import Page from "!/components/content/Page";
import styled from "styled-components";
import { Helmet } from "react-helmet";
// import NodeView from "./nodeView";
import { HTMLAttributes, useRef } from "react";
import NodeView from "./nodeView";
import NodeList from "./nodeList";
import OutputView from "./outputView";
import ArcaneGraphMenu from "./menu";
import { DragCanvasControls } from "../../components/containers/DragCanvas";
// import OutputView from "./outputView";
// import { StateProvider } from "./state";

const ArcanigenPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const originRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<DragCanvasControls>(null);

    return (
        <Page {...props}>
            <Helmet>
                <meta property="og:title" content="Arcanigen" />
                <meta property="og:url" content="https://www.thatrobhuman.com/arcanigen/" />
                <meta property="og:image" content="https://www.thatrobhuman.com/images/arcanigen.png" />
                <meta property="og:description" content="Tool for creating vaguely-radially-symmetrical shapes, like Magic Circles and other such sigils." />
                <title>ThatRobHuman - Arcanigen</title>
            </Helmet>
            <ArcaneGraphMenu />
            <TwoPane>
                <NodeView originRef={originRef} canvasRef={canvasRef} />
                <NodeList originRef={originRef} canvasRef={canvasRef} />
            </TwoPane>
            <OutputView />
        </Page>
    );
})`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0.25em;
    padding: 0.25em;
    place-content: stretch;
`;

export default ArcanigenPage;

const TwoPane = styled.div`
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 0.25em;
`;
