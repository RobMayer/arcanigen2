import { ComponentProps, memo, useCallback, useEffect, useRef, useState } from "react";
import ArcaneGraph, { useNodePosition } from "../graph";
import { INodeDefinition, INodeHelper } from "../types";

import { faClose, faNoteSticky as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faNoteSticky as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import TextArea from "!/components/inputs/TextArea";
import IconButton from "!/components/buttons/IconButton";
import { useDragCanvasEvents } from "!/components/containers/DragCanvas";
import styled from "styled-components";
import { useNodeGraphEventBus } from "../../nodeView";
import TextInput from "!/components/inputs/TextInput";
import { NodeTypes } from "!/utility/enums";

interface INotesNode extends INodeDefinition {
   inputs: {};
   outputs: {};
   values: {
      title: string;
      text: string;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<INotesNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [initialPostion, commitPosition] = useNodePosition(nodeId);
   const { removeNode } = ArcaneGraph.useGraph();
   const { eventBus, origin } = useNodeGraphEventBus();
   const [title, setTitle] = nodeHooks.useValueState(nodeId, "title");
   const [text, setText] = nodeHooks.useValueState(nodeId, "text");

   const gripRef = useRef<HTMLInputElement>(null);
   const mainRef = useRef<HTMLDivElement>(null);

   const posRef = useRef<{ x: number; y: number }>(initialPostion);
   useEffect(() => {
      const m = mainRef.current;
      if (m) {
         m.style.translate = `${initialPostion.x}px ${initialPostion.y}px`;
      }
      posRef.current = initialPostion;
   }, [initialPostion]);

   const dragEventBus = useDragCanvasEvents();
   const zoomRef = useRef<number>(1);
   useEffect(() => {
      const eb = dragEventBus?.current;
      if (eb) {
         const unsub = eb.subscribe("trh:dragcanvas.zoom", (e) => {
            zoomRef.current = e.detail;
         });
         eb.trigger("trh:dragcanvas.refresh", {});
         return unsub;
      }
   }, [dragEventBus]);

   const nodeIdRef = useRef(nodeId);

   useEffect(() => {
      nodeIdRef.current = nodeId;
   }, [nodeId]);

   useEffect(() => {
      const n = mainRef.current;
      const c = origin?.current;
      if (n && c) {
         n.style.zIndex = "auto";
         const handleMe = (e: CustomEvent<HTMLElement>) => {
            n.style.zIndex = e.detail !== n ? "auto" : "2";
         };
         c.addEventListener("trh:dragpane.move", handleMe);
         return () => {
            c.removeEventListener("trh:dragpane.move", handleMe);
         };
      }
   }, [origin]);

   useEffect(() => {
      const n = gripRef.current;
      const m = mainRef.current;
      const c = origin?.current;
      if (n && m && c) {
         const move = (e: MouseEvent) => {
            // set position
            // fire nodemove event
            const { x: sX, y: sY } = posRef.current ?? { x: 0, y: 0 };

            const z = zoomRef.current ?? 1;
            const nX = sX + e.movementX / z;
            const nY = sY + e.movementY / z;

            m.style.translate = `${nX}px ${nY}px`;
            posRef.current.x = nX;
            posRef.current.y = nY;

            if (eventBus.current) {
               eventBus.current.trigger(`node[${nodeId}].move`, { nodeId, x: nX, y: nY });
            }
         };
         const up = (e: MouseEvent) => {
            m.style.zIndex = "1";
            commitPosition({ x: posRef.current.x, y: posRef.current.y });
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
         };
         const down = (e: MouseEvent) => {
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
         };

         const depther = () => {
            c.dispatchEvent(new CustomEvent<HTMLElement>("trh:dragpane.move", { detail: m }));
         };

         n.addEventListener("mousedown", down);
         m.addEventListener("focusin", depther);
         return () => {
            m.removeEventListener("focusin", depther);
            n.removeEventListener("mousedown", down);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
         };
      }
   }, [eventBus, nodeId, commitPosition, origin]);

   const handleRemove = useCallback(() => {
      removeNode(nodeId);
   }, [removeNode, nodeId]);

   useEffect(() => {
      if (mainRef.current) {
         mainRef.current.style.zIndex = "5";
      }
   }, []);

   const [textCache, setTextCache] = useState<string>(text);
   useEffect(() => {
      setTextCache(text);
   }, [text]);

   return (
      <>
         <MoveWrapper ref={mainRef} tabIndex={-1} data-trh-graph-node={nodeId}>
            <Main>
               <Label>
                  <MoveButton icon={NotesNodeHelper.nodeIcon} flavour={"bare"} ref={gripRef} />
                  <LargeTextInput value={title} onValidValue={setTitle} />
                  <IconButton flavour={"bare"} icon={faClose} onClick={handleRemove} />
               </Label>
               <NoteTextArea value={textCache} onValidValue={setTextCache} onValidCommit={setText} />
            </Main>
         </MoveWrapper>
      </>
   );
});

const NotesNodeHelper: INodeHelper<INotesNode> = {
   name: "Note",
   buttonIcon,
   nodeIcon,
   flavour: "confirm",
   type: NodeTypes.META_NOTES,
   getOutput: () => {},
   initialize: () => ({
      title: "Note Title",
      text: "Note Text",
   }),
   controls: Controls,
};

export default NotesNodeHelper;

const MoveButton = styled(IconButton)`
   cursor: move;
`;

const LargeTextInput = styled(TextInput)`
   font-size: 1.25em;
   background: transparent;
   border-color: transparent;
`;

const MoveWrapper = styled.div`
   position: absolute;
   width: max-content;
`;

const Main = memo(styled.div`
   display: grid;
   min-width: 14em;

   grid-template-columns: 1fr;

   gap: 0px 0px;

   background: #0006;
   border: none;
   gap: 3px;
   padding: 3px;
   font-size: 0.875em;
   grid-template-rows: auto 1fr;
`);

const NoteTextArea = styled(({ className, value, ...props }: ComponentProps<typeof TextArea>) => {
   return (
      <div className={className}>
         <TextHack data-replicated={value} />
         <TextAreaInner {...props} value={value} />
      </div>
   );
})`
   display: grid;
`;

const TextHack = styled.div`
   grid-area: 1 / 1 / 2 / 2;
   &::after {
      content: attr(data-replicated) " ";
      white-space: pre;
      visibility: hidden;
   }
   padding: 0.25em 0.5em;
   min-width: 350px;
   min-height: 4lh;
   width: auto;
   height: auto;
`;

const TextAreaInner = styled(TextArea)`
   grid-area: 1 / 1 / 2 / 2;
   background: transparent;
   border-color: transparent;
   width: auto;
   height: auto;
   resize: none;
   overflow: hidden;
   white-space: pre;
`;

const Label = styled.div`
   padding: 0;
   padding-left: 0.5em;

   text-align: center;
   display: grid;
   grid-template-columns: auto 1fr auto;
   align-items: center;
   font-weight: bold;
   font-variant: small-caps;
   font-size: 1.25em;
`;
