import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SocketTypes, NodeTypes } from "../../../../utility/enums";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import ArcaneGraph from "../graph";
import { nodeIcons } from "../icons";
import SliderInputOld from "!/components/inputs/SliderInput";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodePather, NodeRenderer, NodeRendererProps } from "../types";

interface IAlongPathNode extends INodeDefinition {
    inputs: {
        input: NodeRenderer;
        along: number;
        path: NodePather;
    };
    outputs: {
        output: NodeRenderer;
    };
    values: {
        along: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IAlongPathNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const hasAlong = nodeHooks.useHasLink(nodeId, "along");
    const [along, setAlong] = nodeHooks.useValueState(nodeId, "along");

    return (
        <BaseNode<IAlongPathNode> nodeId={nodeId} helper={AlongPathNodeHelper} hooks={nodeHooks}>
            <SocketOut<IAlongPathNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
                Output
            </SocketOut>
            <hr />
            <SocketIn<IAlongPathNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
                Input
            </SocketIn>
            <SocketIn<IAlongPathNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
                Conformal Path
            </SocketIn>
            <SocketIn<IAlongPathNode> nodeId={nodeId} socketId={"along"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Along %"}>
                    <SliderInputOld value={along} onValue={setAlong} disabled={hasAlong} min={0} max={1} />
                </BaseNode.Input>
            </SocketIn>
        </BaseNode>
    );
});

const Renderer = memo(({ nodeId, globals, depth, overrides = {} }: NodeRendererProps) => {
    const along = nodeHooks.useCoalesce(nodeId, "along", "along", globals);
    const [pathData, pId] = nodeHooks.useInputNode(nodeId, "path", globals);
    const [Output, cid] = nodeHooks.useInputNode(nodeId, "input", globals);

    const pos = useMemo(() => {
        if (pathData?.d) {
            const n = document.createElementNS("http://www.w3.org/2000/svg", "path");

            n.setAttribute("d", pathData.d);

            const len = n.getTotalLength();
            if (len) {
                const p = n.getPointAtLength(len * along);
                return p;
            }
        }

        return null;
    }, [along, pathData?.transform, pathData?.d]);

    if (!pathData || !Output) {
        return null;
    }
    return (
        <>
            <g transform={`${pathData?.transform ?? ""}`}>
                <g transform={`translate(${pos?.x ?? 0}, ${pos?.y ?? 0})`}>
                    <Output overrides={overrides} nodeId={cid} depth={`${depth}_${nodeId}`} globals={globals} />
                </g>
            </g>
        </>
    );
});

const AlongPathNodeHelper: INodeHelper<IAlongPathNode> = {
    name: "Along Path",
    buttonIcon: nodeIcons.alongPath.buttonIcon,
    nodeIcon: nodeIcons.alongPath.nodeIcon,
    flavour: "danger",
    type: NodeTypes.COL_ALONG,
    getOutput: () => Renderer,
    initialize: () => ({
        along: 0.5,
    }),
    controls: Controls,
};

export default AlongPathNodeHelper;
