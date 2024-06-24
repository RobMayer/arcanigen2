/** @scope default .. */

import Page from "!/components/content/Page";
import styled from "styled-components";
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
