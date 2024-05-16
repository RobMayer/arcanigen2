import { v4 as uuid } from "uuid";
import { INodeDefinition, NodeRenderer, INodeHelper, INodeInstance, NodeRendererProps, ControlRendererProps, PortalBus, IArcaneGraph, GraphGlobals, ILinkInstance } from "../types";
import ArcaneGraph from "../graph";
import { memo, useCallback, useMemo } from "react";
import ActionButton from "!/components/buttons/ActionButton";
import IconButton from "!/components/buttons/IconButton";
import { Icon } from "!/components/icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import styled from "styled-components";
import { NumericInput } from "!/components/inputs/NumericInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";
import { iconActionClose } from "../../../../components/icons/action/close";
import { iconActionAdd } from "../../../../components/icons/action/add";

interface IPortalInNode extends INodeDefinition {
    inputs: {
        [key: string]: NodeRenderer;
    };
    values: {
        sockets: string[];
        channels: {
            [key: string]: number;
        };
    };
    outputs: {
        output: NodeRenderer;
        portalBus: PortalBus;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IPortalInNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [node, setNode, setGraph] = nodeHooks.useAlterNode(nodeId);

    const addChannel = useCallback(() => {
        const sId = uuid();
        setNode((p) => {
            return {
                ...p,
                sockets: [...p.sockets, sId],
                channels: { ...p.channels, [sId]: Math.max(...(Object.keys(p.channels).length === 0 ? [0] : Object.values(p.channels))) + 1 },
                in: {
                    ...p.in,
                    [sId]: null,
                },
            };
        });
    }, [setNode]);

    const removeChannel = useCallback(
        (sId: string) => {
            setGraph((prev) => {
                const linkId = prev.nodes[nodeId]?.in?.[sId] ?? undefined;
                const prevNode = prev.nodes[nodeId] as INodeInstance<IPortalInNode>;

                const otherNode = linkId
                    ? {
                          [prev.links[linkId].fromNode]: {
                              ...prev.nodes[prev.links[linkId].fromNode],
                              out: {
                                  ...prev.nodes[prev.links[linkId].fromNode].out,
                                  [prev.links[linkId].fromSocket]: prev.nodes[prev.links[linkId].fromNode].out[prev.links[linkId].fromSocket].filter((l) => l !== linkId),
                              },
                          },
                      }
                    : {};

                return {
                    ...prev,
                    nodes: {
                        ...prev.nodes,
                        ...otherNode,
                        [nodeId]: {
                            ...prev.nodes[nodeId],
                            sockets: prevNode.sockets.filter((n) => n !== sId),
                            channels: Object.entries(prevNode.channels).reduce((acc, [theId, theChannel]) => {
                                if (sId !== theId) {
                                    acc[theId] = theChannel;
                                }
                                return acc;
                            }, {} as { [key: string]: number }),
                            in: Object.entries(prevNode.in).reduce((acc, [k, v]) => {
                                if (k !== sId) {
                                    acc[k] = v;
                                }
                                return acc;
                            }, {} as { [key: string]: string | null }),
                        },
                    },
                    links: Object.entries(prev.links).reduce((acc, [k, v]) => {
                        if (k !== linkId) {
                            acc[k] = v;
                        }
                        return acc;
                    }, {} as { [key: string]: ILinkInstance }),
                };
            });
        },
        [setGraph, nodeId]
    );

    const setChannelValue = useCallback(
        (sId: string, val: number) => {
            setNode((p) => {
                return {
                    ...p,
                    channels: Object.entries(p.channels).reduce((acc, [k, v]) => {
                        if (k === sId) {
                            acc[k] = val;
                        } else {
                            acc[k] = v;
                        }
                        return acc;
                    }, {} as { [key: string]: number }),
                };
            });
        },
        [setNode]
    );

    return (
        <BaseNode<IPortalInNode> nodeId={nodeId} helper={PortalInNodeHelper} hooks={nodeHooks}>
            <SocketOut<IPortalInNode> nodeId={nodeId} socketId={"portalBus"} type={SocketTypes.PORTAL}>
                Portal Bus
            </SocketOut>
            <SocketOut<IPortalInNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Pipeline Output
            </SocketOut>
            <hr />
            <BaseNode.Input>
                <ActionButton variant={"slim"} onAction={addChannel}>
                    <Icon value={iconActionAdd} /> Add Channel
                </ActionButton>
            </BaseNode.Input>
            {node.sockets.map((id, i) => {
                return (
                    <SocketIn<IPortalInNode> nodeId={nodeId} socketId={id} type={SocketTypes.SHAPE} key={id}>
                        <ChannelDiv>
                            <span>Channel</span>
                            <NumericInput className={"small"} value={node.channels[id]} onCommit={(e) => setChannelValue(id, e)} />
                            <IconButton
                                onAction={() => {
                                    removeChannel(id);
                                }}
                                icon={iconActionClose}
                                flavour={"danger"}
                            />
                        </ChannelDiv>
                    </SocketIn>
                );
            })}
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
    const [myPortal, restOfGlobals] = useMemo(() => {
        const { portalData, ...rg } = globals;
        const { [nodeId]: mP, ...rp } = portalData ?? {};
        return [mP, { ...rg, portalData: rp ?? {} }];
    }, [globals, nodeId]);

    const channels = nodeHooks.useValue(nodeId, "channels");

    const theChannel = useMemo(() => {
        if (myPortal !== undefined && channels) {
            return Object.entries(channels).reduce((acc, [k, v]) => {
                if (acc === null && v === myPortal) {
                    return k;
                }
                return acc;
            }, null as null | string);
        }
        return null;
    }, [channels, myPortal]);

    if (theChannel !== null) {
        return (
            <g>
                <Member nodeId={nodeId} socketId={theChannel} host={nodeId} depth={depth} globals={restOfGlobals} overrides={overrides} />
            </g>
        );
    }

    return <></>;
});

const Member = ({
    nodeId,
    socketId,
    depth,
    host,
    globals,
    overrides,
}: NodeRendererProps & {
    socketId: string;
    host: string;
}) => {
    const [Comp, childId] = nodeHooks.useInputNode(nodeId, socketId, globals);
    return <g>{Comp && childId && <Comp nodeId={childId} depth={(depth ?? "") + `_${host}.${socketId}`} globals={globals} overrides={overrides} />}</g>;
};

const PortalInNodeHelper: INodeHelper<IPortalInNode> = {
    name: "Portal (In)",
    buttonIcon: nodeIcons.portalIn.buttonIcon,
    nodeIcon: nodeIcons.portalIn.nodeIcon,
    flavour: "danger",
    type: NodeTypes.COL_PORTAL_IN,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPortalInNode["outputs"], globals: GraphGlobals) => {
        if (socket === "portalBus") {
            return {
                senderId: nodeId,
                renderer: Renderer,
            };
        }
        return Renderer;
    },
    initialize: () => {
        const socketId = uuid();
        return {
            sockets: [socketId],
            in: {
                [socketId]: null,
            },
            channels: {
                [socketId]: 1,
            },
        };
    },
    controls: Controls,
};

export default PortalInNodeHelper;

const ChannelDiv = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    justify-items: center;
    gap: 0.25em;
`;
