import { Flavour } from "!/components";
import { HTMLAttributes, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { areSocketsCompatible } from "../definitions/graph";
import { useNodeGraphEventBus } from ".";
import { ConnectionEvent, INodeDefinition, LinkEvent, SocketTypes } from "../definitions/types";

type IProps<T extends INodeDefinition, D extends "inputs" | "outputs"> = {
   nodeId: string;
   socketId: keyof T[D];
   type: SocketTypes;
   children?: ReactNode;
};

type IPropsBoth<T extends INodeDefinition> = {
   nodeId: string;
   socketIn: keyof T["inputs"];
   socketOut: keyof T["outputs"];
   type: SocketTypes;
   children?: ReactNode;
};

export const SocketIn = <T extends INodeDefinition>({ children, socketId, nodeId, type }: IProps<T, "inputs">) => {
   return (
      <Wrapper className={"mode-in"}>
         <Orb nodeId={nodeId} type={type} socketId={socketId as string} mode={"in"} />
         <Label className={"mode-in"}>{children}</Label>
      </Wrapper>
   );
};

export const SocketOut = <T extends INodeDefinition>({ children, socketId, nodeId, type }: IProps<T, "outputs">) => {
   return (
      <Wrapper className={"mode-out"}>
         <Label className={"mode-out"}>{children}</Label>
         <Orb nodeId={nodeId} type={type} socketId={socketId as string} mode={"out"} />
      </Wrapper>
   );
};

export const SocketBoth = <T extends INodeDefinition>({ children, socketIn, socketOut, nodeId, type }: IPropsBoth<T>) => {
   return (
      <Wrapper className={"mode-both"}>
         <Orb nodeId={nodeId} type={type} socketId={socketIn as string} mode={"in"} />
         <Label className={"mode-both"}>{children}</Label>
         <Orb nodeId={nodeId} type={type} socketId={socketOut as string} mode={"out"} />
      </Wrapper>
   );
};

const Wrapper = styled.div`
   display: grid;
   align-items: center;
   justify-items: stretch;
   &.node-both {
      grid-template-columns: 0.625em 1fr 0.625em;
   }
   &.mode-in {
      grid-template-columns: 0.625em 1fr;
   }
   &.mode-out {
      grid-template-columns: 1fr 0.625em;
   }
`;

const Label = styled.div`
   &.mode-in,
   &.mode-both {
      text-align: start;
   }
   &.mode-out {
      text-align: end;
   }
`;

type IOrbProps = {
   nodeId: string;
   socketId: string;
   type: SocketTypes;
   children?: ReactNode;
};

const Orb = styled(({ nodeId, socketId, type, className, mode, ...rest }: IOrbProps & { mode: "in" | "out" } & HTMLAttributes<HTMLDivElement>) => {
   const { eventBus } = useNodeGraphEventBus();
   const ref = useRef<HTMLDivElement>(null);
   const [isValid, setIsValid] = useState<null | boolean>(null);
   const [isCurrent, setIsCurrent] = useState<boolean>(false);

   useEffect(() => {
      const n = ref.current;
      const eb = eventBus.current;
      if (n && eb) {
         let attempt = (e: MouseEvent) => {
            eb.trigger("link.attempt", {
               nodeId,
               type,
               mode,
               socketId,
            });
            n.removeEventListener("mouseup", attempt);
         };

         let cancel = (e: CustomEvent<LinkEvent>) => {
            setIsValid(null);
            setIsCurrent(false);
            eb.unsub(`link.cancel`, cancel);
         };

         let made = (e: CustomEvent<ConnectionEvent>) => {
            setIsValid(null);
            setIsCurrent(false);
            eb.unsub(`link.made`, made);
         };

         const start = (e: CustomEvent<LinkEvent>) => {
            setIsValid(areSocketsCompatible(e.detail.type, type) && e.detail.mode !== mode && e.detail.nodeId !== nodeId);
            eb.subscribe(`link.cancel`, cancel);
            eb.subscribe(`link.made`, made);
            n.addEventListener("mouseup", attempt);
         };

         // let eb know link is starting...
         const notify = (e: MouseEvent) => {
            setIsCurrent(true);
            eb.trigger(`link.start`, {
               type,
               nodeId,
               socketId,
               mode,
            });
         };

         n.addEventListener("mousedown", notify);
         eb.subscribe(`link.start`, start);
         return () => {
            n.removeEventListener("mousedown", notify);
            eb.unsub(`link.start`, start);
         };
      }
   }, [eventBus, type, mode, nodeId, socketId]);

   const flavour = useMemo(() => {
      return getSocketFlavour(type);
   }, [type]);

   return (
      <div
         {...rest}
         className={`
       ${className ?? ""}
       ${isValid === null ? "" : isValid ? "state-valid" : "state-invalid"}
       ${isCurrent ? "state-current" : ""}
       mode-${mode}
       flavour-${flavour}
    `}
         ref={ref}
         title={`node: ${nodeId} socket: ${socketId}`}
         data-trh-graph-sockethost={nodeId}
         data-trh-graph-socket={socketId}
      />
   );
})`
   width: 1.25em;
   aspect-ratio: 1;
   border-radius: 100%;
   background: var(--flavour-button);
   outline: 1px solid var(--effect-border-muted);
   justify-self: center;
   cursor: copy;
   &.state-valid {
      cursor: alias;
   }

   border: 1px solid var(--effect-border-highlight);
   &.state-valid,
   &:hover {
      background: var(--flavour-button-highlight);
   }
   &.state-valid:hover {
      background: var(--flavour-button-overlight);
   }
   &.state-invalid:not(.state-current) {
      background: var(--disabled-button);
      cursor: not-allowed;
   }
   &.state-current {
      background: var(--flavour-button-highlight);
   }
   &.mode-in {
      margin-left: -1.25em;
   }
   &.mode-out {
      margin-right: -1.25em;
   }
`;

const getSocketFlavour = (type: SocketTypes): Flavour => {
   switch (type) {
      case SocketTypes.LENGTH:
      case SocketTypes.COLOR:
         return "accent";
      case SocketTypes.SEQUENCE:
         return "emphasis";
      case SocketTypes.SHAPE:
         return "confirm";
   }
   return "accent";
};
