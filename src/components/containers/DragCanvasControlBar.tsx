import { faArrowsToCircle, faArrowsUpDownLeftRight } from "@fortawesome/pro-light-svg-icons";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import IconButton from "../buttons/IconButton";
import Slider from "../inputs/Slider";
import { DragCanvasControls, useDragCanvasEvents } from "./DragCanvas";

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
         <Slider value={currentZoom} onValue={controls.setZoom} min={0.125} max={4} />
         <DragButton ref={dragMoveRef} icon={faArrowsUpDownLeftRight} />
         <IconButton onClick={controls.center} icon={faArrowsToCircle} />
      </div>
   );
})`
   background: var(--layer-dn);
   position: absolute;
   right: 0;
   top: 0;
   display: flex;
   align-items: center;
   font-size: 1.5em;
   padding: 0.5em;
   gap: 0.5em;
`;

export default DragCanvasControlBar;

const DragButton = styled(IconButton)`
   cursor: move;
`;
