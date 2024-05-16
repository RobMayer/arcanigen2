import IconButton from "!/components/buttons/IconButton";
import { Icon } from "!/components/icons";
import { HTMLAttributes, memo, ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import ArcaneGraph, { useNodePanelToggle, useNodePosition, useNodeToggle } from "../definitions/graph";
import { useNodeGraphEventBus } from ".";
import { useDragCanvasEvents } from "!/components/containers/DragCanvas";
import { INodeDefinition, INodeHelper } from "../definitions/types";
import ContextMenu, { useContextMenu } from "!/components/popups/ContextMenu";
import { iconActionCopy } from "../../../components/icons/action/copy";
import { iconActionTrash } from "../../../components/icons/action/trash";
import { iconCaretDown } from "../../../components/icons/caret/down";
import { iconCaretRight } from "../../../components/icons/caret/right";
import { iconBlank } from "../../../components/icons/blank";
import { MoveHandle } from "../../../components/utility/movehandle";

type IProps<T extends INodeDefinition> = {
    nodeId: string;
    helper: INodeHelper<T>;
    noRemove?: boolean;
    hooks: ReturnType<(typeof ArcaneGraph)["nodeHooks"]>;
} & HTMLAttributes<HTMLDivElement>;

const BaseNode = <T extends INodeDefinition>({ nodeId, children, helper, hooks, className, noRemove = false, ...props }: IProps<T>) => {
    const [initialPostion, commitPosition] = useNodePosition(nodeId);
    const { removeNode, duplicateNode } = ArcaneGraph.useGraph();
    const [isOpen, setIsOpen] = useNodeToggle(nodeId);
    const { eventBus, origin } = useNodeGraphEventBus();
    const name = hooks.useValue(nodeId, "name") ?? "";

    useLayoutEffect(() => {
        if (eventBus.current) {
            eventBus.current.trigger(`node[${nodeId}].collapse`, {});
        }
    }, [eventBus, nodeId, isOpen]);

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

    const moveMove = useCallback(
        (e: MouseEvent) => {
            const { x: sX, y: sY } = posRef.current ?? { x: 0, y: 0 };

            const z = zoomRef.current ?? 1;
            const nX = sX + e.movementX / z;
            const nY = sY + e.movementY / z;

            if (mainRef.current) {
                mainRef.current.style.translate = `${nX}px ${nY}px`;
            }
            posRef.current.x = nX;
            posRef.current.y = nY;

            if (eventBus.current) {
                eventBus.current.trigger(`node[${nodeId}].move`, { nodeId, x: nX, y: nY });
            }
        },
        [eventBus, nodeId]
    );

    const moveUp = useCallback(
        (e: MouseEvent) => {
            if (mainRef.current) {
                mainRef.current.style.zIndex = "1";
                commitPosition({ x: posRef.current.x, y: posRef.current.y });
            }
        },
        [commitPosition]
    );

    useEffect(() => {
        const m = mainRef.current;
        const c = origin?.current;
        if (m && c) {
            const depther = () => {
                c.dispatchEvent(new CustomEvent<HTMLElement>("trh:dragpane.move", { detail: m }));
            };

            m.addEventListener("focusin", depther);
            return () => {
                m.removeEventListener("focusin", depther);
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

    const controls = useContextMenu();

    return (
        <>
            <ContextMenu controls={controls}>
                <IconButton
                    icon={iconActionCopy}
                    onAction={() => {
                        duplicateNode(nodeId);
                        controls.close();
                    }}
                >
                    Duplicate Node
                </IconButton>
                <IconButton
                    icon={iconActionTrash}
                    onAction={() => {
                        removeNode(nodeId);
                        controls.close();
                    }}
                    flavour={"danger"}
                >
                    Remove Node
                </IconButton>
            </ContextMenu>
            <MoveWrapper ref={mainRef} tabIndex={-1} data-trh-graph-node={nodeId}>
                <Main {...props} className={`${className} ${isOpen ? "state-open" : "state-closed"}`}>
                    <Label
                        className={`flavour-${helper.flavour}`}
                        onContextMenu={
                            !noRemove
                                ? (e) => {
                                      e.preventDefault();
                                      controls.open.when(e);
                                  }
                                : undefined
                        }
                    >
                        <ProxySocket className={"in"} data-trh-graph-sockethost={nodeId} data-trh-graph-fallback={"in"} />
                        <IconButton flavour={"inherit"} icon={isOpen ? iconCaretDown : iconCaretRight} className={"muted"} onAction={handleToggle} />
                        <MoveHandle onEnd={moveUp} onMove={moveMove}>
                            <LabelInner>
                                <NodeIcon value={helper.nodeIcon} className={`flavour-${helper.flavour}`} />
                                <span>{name ? `"${name}"` : helper.name}</span>
                                <Icon value={iconBlank} />
                            </LabelInner>
                        </MoveHandle>
                        {!noRemove ? <IconButton flavour={"inherit"} icon={iconActionTrash} onAction={handleRemove} /> : <Icon value={iconBlank} />}
                        <ProxySocket className={"out"} data-trh-graph-sockethost={nodeId} data-trh-graph-fallback={"out"} />
                    </Label>
                    {isOpen && <Params>{children}</Params>}
                </Main>
            </MoveWrapper>
        </>
    );
};

const MoveWrapper = styled.div`
    position: absolute;
    width: max-content;
`;

const LabelInner = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5em;
    cursor: move;
    align-items: center;
`;

const NodeIcon = styled(Icon)`
    color: var(--theme-icon);
`;

const Main = memo(styled.div`
    display: grid;
    min-width: 14em;

    grid-template-columns: 1fr;

    gap: 0px 0px;

    background: var(--layer2);
    border: 1px solid var(--layer3);
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
    background: var(--theme-detail-bg);
    border: 1px solid var(--theme-detail-border);
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
    .slim > & {
        gap: 0.25em;
    }
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
    background: #0002;
    border: 1px solid #fff2;
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
                    <IconButton flavour={"bare"} icon={isOpen ? iconCaretDown : iconCaretRight} onAction={handleToggle}>
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
    background: #fff1;
`;

BaseNode.Input = Input;
BaseNode.Output = Output;
BaseNode.Foldout = Foldout;
