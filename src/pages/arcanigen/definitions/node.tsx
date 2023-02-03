import { Flavour } from "!/components";
import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import faBlank from "!/components/icons/faBlank";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight, faClose } from "@fortawesome/pro-solid-svg-icons";
import { HTMLAttributes, memo, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import ArcaneGraph, { useNodePosition } from "./graph";
import { useNodeGraphEventBus } from "../nodeView";
import { useDragCanvasValue } from "!/components/containers/DragCanvas";

type IProps = {
   nodeId: string;
   noRemove?: boolean;
   label: string;
   nodeIcon: IconProp;
   flavour?: Flavour;
} & HTMLAttributes<HTMLDivElement>;

const BaseNode = ({ nodeId, children, nodeIcon, flavour, label, noRemove = false, ...props }: IProps) => {
   const [initialPostion, commitPosition] = useNodePosition(nodeId);
   const { removeNode } = ArcaneGraph.useGraph();
   const [isOpen, setIsOpen] = useState<boolean>(true);
   const { eventBus, origin } = useNodeGraphEventBus();

   useLayoutEffect(() => {
      if (eventBus.current) {
         eventBus.current.trigger(`node[${nodeId}].collapse`, {});
      }
   }, [eventBus, nodeId, isOpen]);

   const gripRef = useRef<HTMLDivElement>(null);
   const mainRef = useRef<HTMLDivElement>(null);

   const [zoom] = useDragCanvasValue((p) => p.zoom);
   const zoomRef = useRef<number>(zoom);
   useEffect(() => {
      zoomRef.current = zoom;
   }, [zoom]);

   const nodeIdRef = useRef(nodeId);

   useEffect(() => {
      const m = mainRef.current;
      if (m) {
         m.style.left = `${initialPostion.x}px`;
         m.style.top = `${initialPostion.y}px`;
      }
   }, [initialPostion]);

   useEffect(() => {
      nodeIdRef.current = nodeId;
   }, [nodeId]);

   useEffect(() => {
      const n = mainRef.current;
      const c = origin.current ?? document;
      if (n && c) {
         n.style.zIndex = "auto";
         const handleMe = (e: CustomEvent<HTMLElement>) => {
            n.style.zIndex = e.detail !== n ? "auto" : "2";
         };
         c.addEventListener("trh:dragmove", handleMe);
         return () => {
            c.removeEventListener("trh:dragmove", handleMe);
         };
      }
   }, [origin]);

   useEffect(() => {
      const n = gripRef.current;
      const m = mainRef.current;
      const c = origin.current;
      if (n && m && c) {
         const move = (e: MouseEvent) => {
            // set position
            // fire nodemove event
            const sX = parseFloat(m.style.left);
            const sY = parseFloat(m.style.top);

            const z = zoomRef.current ?? 1;
            const nX = (isNaN(sX) ? 0 : sX) + e.movementX / z;
            const nY = (isNaN(sY) ? 0 : sY) + e.movementY / z;

            m.style.left = `${nX}px`;
            m.style.top = `${nY}px`;
            if (eventBus.current) {
               eventBus.current.trigger(`node[${nodeId}].move`, { nodeId, x: nX, y: nY });
            }
         };
         const up = (e: MouseEvent) => {
            const sX = parseFloat(m.style.left);
            const sY = parseFloat(m.style.top);
            m.style.zIndex = "1";
            commitPosition({ x: sX, y: sY });
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
         };
         const down = (e: MouseEvent) => {
            c.dispatchEvent(new CustomEvent<HTMLElement>("trh:dragmove", { detail: n }));
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
         };
         n.addEventListener("mousedown", down);
         return () => {
            n.removeEventListener("mousedown", down);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
         };
      }
   }, [eventBus, nodeId, commitPosition, origin]);

   const handleRemove = useCallback(() => {
      removeNode(nodeId);
   }, [removeNode, nodeId]);

   const handleToggle = useCallback(() => {
      setIsOpen((p) => !p);
   }, []);

   return (
      <MoveWrapper ref={mainRef}>
         <Main {...props} className={isOpen ? "state-open" : "state-closed"}>
            <Label className={`flavour-${flavour}`}>
               <ProxySocket className={"in"} data-trh-graph-sockethost={nodeId} data-trh-graph-fallback={"in"} />
               <IconButton flavour={"bare"} icon={nodeIcon} className={"muted"} onClick={handleToggle} />
               <LabelInner ref={gripRef}>{label}</LabelInner>
               {!noRemove ? <IconButton flavour={"bare"} icon={faClose} onClick={handleRemove} /> : <Icon icon={faBlank} />}
               <ProxySocket className={"out"} data-trh-graph-sockethost={nodeId} data-trh-graph-fallback={"out"} />
            </Label>
            {isOpen && <Params>{children}</Params>}
         </Main>
      </MoveWrapper>
   );
};

const MoveWrapper = styled.div`
   position: absolute;
   width: max-content;
`;

const LabelInner = styled.div`
   padding-inline: 0.5em;
   cursor: move;
`;

const Main = memo(styled.div`
   display: grid;
   min-width: 10em;

   grid-template-columns: 1fr;

   gap: 0px 0px;

   background: var(--layer2);
   border: 1px solid var(--effect-border-highlight);
   gap: 3px;
   padding: 3px;
   font-size: 0.875em;

   box-shadow: 0px 0px 8px #0008;
   .meta-dragcanvas.state-dragging & {
      box-shadow: none;
   }

   &.state-open {
      grid-template-rows: auto 1fr;
   }
   &.state-closed {
      grid-template-rows: auto;
   }
`);

export default BaseNode;

const Label = styled.div`
   background: var(--flavour-button-muted);
   border: 1px solid var(--effect-border-highlight);
   padding: 0;

   text-align: center;
   display: grid;
   grid-template-columns: 0px auto 1fr auto 0px;
   align-items: center;
   font-weight: bold;
   font-variant: small-caps;
   font-size: 1.25em;
`;

const Params = styled.div`
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: 0.625em 0;
   align-items: stretch;
   padding-inline: 0;
   & > hr {
      margin-block: -0.125em;
      margin-inline: 0;
   }
`;

const ProxySocket = styled.div`
   width: 0.5em;
   height: 0.5em;
   &.in {
      margin-left: -0.25em;
      justify-self: end;
   }
   &.out {
      margin-right: -0.25em;
      justify-self: start;
   }
`;

const Input = styled(({ label, children, ...props }: { label?: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         {label && <InputLabel>{label}</InputLabel>}
         <InputBody>{children}</InputBody>
      </div>
   );
})`
   display: grid;
   grid-template-rows: auto 1fr;
   grid-column: 2;
`;

const InputLabel = styled.div`
   font-size: 0.75em;
   justify-self: start;
   padding-inline: 0.5em;
`;

const InputBody = styled.div`
   display: grid;
`;

const Foldout = styled(
   ({
      nodeId,
      inputs,
      outputs,
      children,
      label,
      startOpen = false,
      ...props
   }: HTMLAttributes<HTMLDivElement> & { nodeId: string; inputs: string; outputs: string; startOpen?: boolean; label: ReactNode }) => {
      const [isOpen, setIsOpen] = useState<boolean>(startOpen);
      const { eventBus } = useNodeGraphEventBus();

      const handleToggle = useCallback(() => {
         setIsOpen((p) => !p);
      }, []);

      useLayoutEffect(() => {
         if (eventBus.current) {
            eventBus.current.trigger(`node[${nodeId}].collapse`, {});
         }
      }, [eventBus, nodeId, isOpen]);

      return (
         <>
            <div {...props}>
               <ProxySocket className={"in"} data-trh-graph-sockethost={nodeId} data-trh-graph-proxy={inputs} />
               <IconButton flavour={"bare"} icon={isOpen ? faCaretDown : faCaretRight} onClick={handleToggle}>
                  {label}
               </IconButton>
               <ProxySocket className={"out"} data-trh-graph-sockethost={nodeId} data-trh-graph-proxy={outputs} />
            </div>
            {isOpen && <>{children}</>}
         </>
      );
   }
)`
   display: grid;
   grid-template-columns: auto 1fr auto;
   align-items: center;
   margin-inline: -0.25em;
   background: var(--layer-up);
`;

BaseNode.Input = Input;
BaseNode.Foldout = Foldout;