import IconButton from "!/components/buttons/IconButton";
import Icon from "!/components/icons";
import faBlank from "!/components/icons/faBlank";
import { faCaretDown, faCaretRight, faClose } from "@fortawesome/pro-solid-svg-icons";
import { HTMLAttributes, memo, ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import ArcaneGraph, { useNodePanelToggle, useNodePosition, useNodeToggle } from "../definitions/graph";
import { useNodeGraphEventBus } from ".";
import { useDragCanvasEvents } from "!/components/containers/DragCanvas";
import { INodeDefinition, INodeHelper } from "../definitions/types";

type IProps<T extends INodeDefinition> = {
   nodeId: string;
   helper: INodeHelper<T>;
   noRemove?: boolean;
   hooks: ReturnType<typeof ArcaneGraph["nodeHooks"]>;
} & HTMLAttributes<HTMLDivElement>;

const BaseNode = <T extends INodeDefinition>({ nodeId, children, helper, hooks, noRemove = false, ...props }: IProps<T>) => {
   const [initialPostion, commitPosition] = useNodePosition(nodeId);
   const { removeNode } = ArcaneGraph.useGraph();
   const [isOpen, setIsOpen] = useNodeToggle(nodeId);
   const { eventBus, origin } = useNodeGraphEventBus();
   const name = hooks.useValue(nodeId, "name") ?? "";

   useLayoutEffect(() => {
      if (eventBus.current) {
         eventBus.current.trigger(`node[${nodeId}].collapse`, {});
      }
   }, [eventBus, nodeId, isOpen]);

   const gripRef = useRef<HTMLDivElement>(null);
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

   const handleToggle = useCallback(() => {
      setIsOpen((p) => !p);
   }, [setIsOpen]);

   useEffect(() => {
      if (mainRef.current) {
         mainRef.current.style.zIndex = "5";
      }
   }, []);

   return (
      <MoveWrapper ref={mainRef} tabIndex={-1} data-trh-graph-node={nodeId}>
         <Main {...props} className={`${isOpen ? "state-open" : "state-closed"}`}>
            <Label className={`flavour-${helper.flavour}`}>
               <ProxySocket className={"in"} data-trh-graph-sockethost={nodeId} data-trh-graph-fallback={"in"} />
               <IconButton flavour={"bare"} icon={helper.nodeIcon} className={"muted"} onClick={handleToggle} />
               <LabelInner ref={gripRef}>{name ? `"${name}"` : helper.name}</LabelInner>
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
   min-width: 14em;

   grid-template-columns: 1fr;

   gap: 0px 0px;

   background: var(--layer2);
   border: 1px solid var(--effect-border-highlight);
   gap: 3px;
   padding: 3px;
   font-size: 0.875em;

   box-shadow: 0px 0px 8px var(--app-box-shadow);

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
   .has-importance > & {
      background: var(--flavour-button);
   }
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

const Output = styled(({ label, children, ...props }: { label?: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
   return (
      <div {...props}>
         {label && <InputLabel>{label}</InputLabel>}
         <InputBody>
            <OutputContent>{children}</OutputContent>
         </InputBody>
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

const OutputContent = styled.div`
   display: flex;
   justify-content: center;
   background: var(--layer-dn);
   border: 1px solid var(--effect-border-highlight);
   user-select: text;
   overflow: clip;
   text-overflow: ellipsis;
`;

const Foldout = styled(
   ({
      nodeId,
      inputs,
      outputs,
      children,
      label,
      panelId,
      startOpen = false,
      ...props
   }: HTMLAttributes<HTMLDivElement> & { nodeId: string; inputs: string; outputs: string; panelId: string; startOpen?: boolean; label: ReactNode }) => {
      const [isOpen, setIsOpen] = useNodePanelToggle(nodeId, panelId, startOpen);
      const { eventBus } = useNodeGraphEventBus();

      const handleToggle = useCallback(() => {
         setIsOpen((p) => !p);
      }, [setIsOpen]);

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
BaseNode.Output = Output;
BaseNode.Foldout = Foldout;
