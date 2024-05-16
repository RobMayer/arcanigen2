import { HTMLAttributes, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import IconButton from "../buttons/IconButton";
import { DragCanvasControls, useDragCanvasEvents } from "./DragCanvas";
import { iconArrowCardinal } from "../icons/arrow/cardinal";
import { iconArrowOrdinalIn } from "../icons/arrow/ordinalIn";
import SliderInput from "../inputs/SliderInput";

type IProps = {
    controls: DragCanvasControls;
};

const DragCanvasControlBar = styled(({ controls, ...props }: HTMLAttributes<HTMLDivElement> & IProps) => {
    const dragMoveRef = useRef<HTMLDivElement>(null);

    const dragEventBus = useDragCanvasEvents();
    const [currentZoom, setCurrentZoom] = useState<number>(controls.getZoom());

    useEffect(() => {
        const eb = dragEventBus?.current;
        if (eb) {
            return eb.subscribe("trh:dragcanvas.zoom", (e) => {
                setCurrentZoom(e.detail);
            });
        }
    }, [dragEventBus]);

    useEffect(() => {
        const n = dragMoveRef.current;
        if (n) {
            const doMove = (e: MouseEvent) => {
                controls.move(e.movementX, e.movementY);
            };
            const up = () => {
                document.removeEventListener("mousemove", doMove);
                document.removeEventListener("mouseup", up);
            };
            const down = () => {
                document.addEventListener("mousemove", doMove);
                document.addEventListener("mouseup", up);
            };

            n.addEventListener("mousedown", down);
            return () => {
                n.removeEventListener("mousedown", down);
                document.removeEventListener("mouseup", up);
                document.removeEventListener("mousemove", doMove);
            };
        }
    }, [controls]);

    return (
        <div {...props}>
            <SliderInput value={currentZoom} onValue={controls.setZoom} min={0.1} max={4} step={0.1} precision={6} />
            <DragButton ref={dragMoveRef} icon={iconArrowCardinal} />
            <ExtentsButton onAction={controls.center} icon={iconArrowOrdinalIn} />
        </div>
    );
})`
    background: #0002;
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;

    padding: 0.5em;
    gap: 0.5em;
`;

export default DragCanvasControlBar;

const DragButton = styled(IconButton)`
    cursor: move;
    font-size: 1.5em;
`;

const ExtentsButton = styled(IconButton)`
    font-size: 1.5em;
`;
