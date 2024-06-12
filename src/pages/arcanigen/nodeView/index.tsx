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
import useUIState from "!/utility/hooks/useUIState";
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

const NodeView = () => {
    const origin = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<DragCanvasControls>(null);
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
                        if (origin.current && canvasRef.current) {
                            const obb = origin.current.getBoundingClientRect();
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
        const n = origin.current;
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

    const handleAdd = useCallback(
        (type: NodeType) => {
            if (origin.current && canvasRef.current) {
                const el = canvasRef.current.getElement();
                if (el) {
                    const obb = origin.current.getBoundingClientRect();
                    const cbb = el.getBoundingClientRect();
                    const zoom = canvasRef.current.getZoom();

                    const at = {
                        x: (cbb.left + cbb.width / 2 - obb.left) / zoom,
                        y: (cbb.top + cbb.height / 2 - obb.top) / zoom,
                    };

                    addNode(type, at);
                }
            }
        },
        [addNode]
    );

    const [isDrawerOpen, setIsDrawerOpen] = useUIState("uistate.nodeview.drawer", true);

    return (
        <Wrapper>
            <CanvasWrapper ref={wrapperRef}>
                <Canvas ref={canvasRef}>
                    <BoxContents ref={origin}>
                        <EventCTX.Provider value={{ eventBus, origin }}>
                            <ConnectionCanvas />
                            {Object.values(nodes).map(({ nodeId, type }) => (
                                <EachNode key={nodeId} nodeId={nodeId} type={type} />
                            ))}
                        </EventCTX.Provider>
                    </BoxContents>
                </Canvas>
            </CanvasWrapper>
            <Slideout
                label={"Nodes"}
                isOpen={isDrawerOpen}
                onToggle={() => {
                    setIsDrawerOpen((p) => !p);
                }}
                direction={"up"}
                size={"clamp(100px, 20vmin, 400px)"}
            >
                <Grid>
                    {NODE_BUTTONS.map((t) => {
                        return <NodeButton key={t as string} onAction={handleAdd} type={t} />;
                    })}
                </Grid>
            </Slideout>
        </Wrapper>
    );
};

const NODE_BUTTONS = Object.values(NodeTypes).filter((v) => v !== NodeTypes.META_RESULT);

const BoxContents = styled(BoundingBox.Contents)`
    display: grid;
    justify-items: center;
`;

export default NodeView;

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 0.25em;
`;

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

const NodeButton = styled(({ children, type, onAction, disabled, className }: { disabled?: boolean; children?: ReactNode; type: NodeType; onAction: (type: NodeType) => void; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleAction = useCallback(() => {
        onAction?.(type);
    }, [type, onAction]);

    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
    const isActive = useUi.action(ref, handleAction, disabled);
    const isHover = useUi.hover(ref, disabled);

    const helper = useMemo(() => getNodeHelper(type), [type]);

    useDraggable(
        ref,
        useMemo(() => {
            return {
                "trh/new_node": ["copy", () => type],
            };
        }, [type])
    );

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${helper.flavour} state-disabled`;
        }
        return [
            className ?? "",
            "state-enabled",
            `flavour-${helper.flavour}`,
            isActive ? "state-active" : "state-inactive",
            isFocus ? "state-focus" : "",
            isFocusHard ? "state-hardfocus" : "",
            isFocusSoft ? "state-softfocus" : "",
            isHover ? "state-hover" : "state-away",
        ].join(" ");
    }, [className, disabled, helper.flavour, isActive, isFocus, isFocusHard, isFocusSoft, isHover]);

    return (
        <div role={"button"} className={cN} ref={ref}>
            <div className={"part-name"}>{helper.name}</div>
            <Icon className={"part-icon"} value={helper.buttonIcon ?? iconBlank} />
        </div>
    );
})`
    display: inline-grid;

    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    aspect-ratio: 0.825;
    align-items: stretch;
    align-content: center;
    border: 1px solid transparent;
    padding: 3px;

    & > .part-icon {
        font-size: 3.5vmin;
        padding: 0.25em;
        align-self: center;
        justify-self: center;
        flex: 1 1 auto;
    }

    & > .part-name {
        font-size: min(1vmin, 0.875em);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow-x: hidden;

        text-align: center;
        border: none;
        padding-inline: 0.5em;
    }

    &:not(.state-disabled) {
        border: 1px solid #fff3;
        & > .part-icon {
            color: var(--theme-link);
        }
        & > .part-name {
            background: var(--theme-detail-bg);
            border: 1px solid var(--theme-detail-border);
        }

        &.state-hover,
        &.state-focus {
            border-color: #fff6;
            & > .part-icon {
                color: var(--theme-link_focushover);
            }
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 8vmin));
    justify-content: center;
    grid-auto-rows: min-content;
    padding: 0.25em;
    gap: 0.5em;
`;
