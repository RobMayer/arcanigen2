import BoundingBox from "!/components/containers/BoundingBox";
import DragCanvas from "!/components/containers/DragCanvas";
import { HTMLAttributes } from "react";
import styled from "styled-components";
import { RootNodeRenderer } from "../definitions/meta/resultNode";

const OutputView = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <Canvas>
            <BoxContents>
                <div {...props} id={"EXPORT_ME"}>
                    <RootNodeRenderer />
                </div>
            </BoxContents>
        </Canvas>
    );
})`
    position: absolute;
    pointer-events: none;

    display: grid;
    place-items: center;
    place-content: center;
`;
export default OutputView;

const Canvas = styled(DragCanvas)`
    border: 1px solid #fff2;
`;

const BoxContents = styled(BoundingBox.Contents)`
    display: grid;
    place-items: center;
`;
