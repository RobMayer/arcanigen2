import BoundingBox from "!/components/containers/BoundingBox";
import DragCanvas, { DragCanvasControls } from "!/components/containers/DragCanvas";
import Slideout from "!/components/containers/Slideout";
import EventBus from "!/utility/eventbus";
import useDraggable from "!/utility/hooks/useDraggable";
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { getNodeHelper } from "../definitions";
import ArcaneGraph, { areSocketsCompatible } from "../definitions/graph";
import { NodeMoveEvent, LinkEvent, ConnectionEvent } from "../definitions/types";
import ConnectionCanvas from "./connections";
import useDroppable from "!/utility/hooks/useDroppable";
import { NodeTypes, SocketTypes, LinkTypes, LinkType, SocketType, NodeType } from "!/utility/enums";
import { Icon } from "../../../components/icons";
import { useUi } from "../../../components/useUI";
import { iconBlank } from "../../../components/icons/blank";

type NodeGraphEvents = {
    [key: `node[${string}].move`]: NodeMoveEvent;
    [key: `node[${string}].redraw`]: {};
    [key: `node[${string}].collapse`]: {};
    [key: `node[${string}].moveStart`]: NodeMoveEvent;
    [key: `node[${string}].moveEnd`]: NodeMoveEvent;
    "link.cancel": {};
    "link.start": LinkEvent;
    "link.attempt": LinkEvent;
    "link.made": ConnectionEvent;
};

const EventCTX = createContext<
    | {
          eventBus: RefObject<EventBus<NodeGraphEvents>>;
          origin: RefObject<HTMLDivElement>;
      }
    | undefined
>(undefined);

const NodeView = ({ canvasRef, originRef }: { canvasRef: RefObject<DragCanvasControls>; originRef: RefObject<HTMLDivElement> }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const eventBus = useRef(new EventBus<NodeGraphEvents>());

    const { connect, addNode } = ArcaneGraph.useGraph();
    const nodes = ArcaneGraph.useNodelist();

    useDroppable(
        wrapperRef,
        useMemo(
            () => ({
                "trh/new_node": [
                    "copy",
                    (type, ev) => {
                        if (originRef.current && canvasRef.current) {
                            const obb = originRef.current.getBoundingClientRect();
                            const zoom = canvasRef.current.getZoom();
                            addNode(type as NodeType, { x: (ev.clientX - obb.left) / zoom, y: (ev.clientY - obb.top) / zoom });
                        }
                    },
                ],
            }),
            [addNode]
        )
    );

    useEffect(() => {
        const n = originRef.current;
        const eb = eventBus.current;

        if (n && eb) {
            let linkStore: LinkEvent | undefined;

            let doCancel: (e: MouseEvent) => void;
            let startLinkup: (e: CustomEvent<LinkEvent>) => void;
            let attemptLinkup: (e: CustomEvent<LinkEvent>) => void;

            attemptLinkup = (e) => {
                document.removeEventListener("mouseup", doCancel);
                eb.unsub("link.attempt", attemptLinkup);
                if (linkStore && areSocketsCompatible(e.detail.type, linkStore.type) && e.detail.mode !== linkStore.mode && e.detail.nodeId !== linkStore.nodeId) {
                    const res = {
                        fromNode: e.detail.mode === "out" ? e.detail.nodeId : linkStore.nodeId,
                        fromSocket: e.detail.mode === "out" ? e.detail.socketId : linkStore.socketId,
                        toNode: e.detail.mode === "in" ? e.detail.nodeId : linkStore.nodeId,
                        toSocket: e.detail.mode === "in" ? e.detail.socketId : linkStore.socketId,
                        type: getLinkType(e.detail.type, linkStore.type),
                    };
                    connect(res.fromNode, res.fromSocket, res.toNode, res.toSocket, res.type);
                    eb.trigger("link.made", res);
                } else {
                    eb.trigger("link.cancel", {});
                }
                eb.subscribe("link.start", startLinkup);
            };

            doCancel = (e) => {
                if (!e.defaultPrevented) {
                    eb.trigger("link.cancel", {});
                    e.preventDefault();
                }
                linkStore = undefined;
                document.removeEventListener("mouseup", doCancel);
                eb.subscribe("link.start", startLinkup);
            };
            startLinkup = (e: CustomEvent<LinkEvent>) => {
                linkStore = e.detail;
                // wait for another node to attempt
                eb.subscribe("link.attempt", attemptLinkup);
                document.addEventListener("mouseup", doCancel);
                eb.unsub("link.start", startLinkup);
            };
            eb.subscribe("link.start", startLinkup);
            return () => {
                eb.unsub("link.start", startLinkup);
            };
        }
    }, [connect]);

    return (
        <CanvasWrapper ref={wrapperRef}>
            <Canvas ref={canvasRef}>
                <BoxContents ref={originRef}>
                    <EventCTX.Provider value={{ eventBus, origin: originRef }}>
                        <ConnectionCanvas />
                        {Object.values(nodes).map(({ nodeId, type }) => (
                            <EachNode key={nodeId} nodeId={nodeId} type={type} />
                        ))}
                    </EventCTX.Provider>
                </BoxContents>
            </Canvas>
        </CanvasWrapper>
    );
};

const BoxContents = styled(BoundingBox.Contents)`
    display: grid;
    justify-items: center;
`;

export default NodeView;

const CanvasWrapper = styled.div``;

const Canvas = styled(DragCanvas)`
    border: 1px solid #fff2;
`;

const EachNode = ({ type, nodeId }: { type: NodeType; nodeId: string }) => {
    const helper = useMemo(() => getNodeHelper(type), [type]);
    const ControlsComponent = useMemo(() => helper.controls, [helper]);
    return <ControlsComponent nodeId={nodeId} globals={TMP_GLOBALS} />;
};

const TMP_GLOBALS = {
    sequenceData: {},
    portalData: {},
};

const getLinkType = (a: SocketType, b: SocketType): LinkType => {
    if (a === SocketTypes.PORTAL && b === SocketTypes.PORTAL) {
        return LinkTypes.PORTAL;
    }
    if (a === SocketTypes.SHAPE && b === SocketTypes.SHAPE) {
        return LinkTypes.SHAPE;
    }
    if (a === SocketTypes.SEQUENCE && b === SocketTypes.SEQUENCE) {
        return LinkTypes.SEQUENCE;
    }
    if (a === SocketTypes.CURVE && b === SocketTypes.CURVE) {
        return LinkTypes.CURVE;
    }
    if (a === SocketTypes.PATH && b === SocketTypes.PATH) {
        return LinkTypes.PATH;
    }
    return LinkTypes.OTHER;
};

export const useNodeGraphEventBus = () => useContext(EventCTX)!;
