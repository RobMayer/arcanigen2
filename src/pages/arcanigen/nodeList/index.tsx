import { ReactNode, useRef, useCallback, useMemo, RefObject, useState, useEffect } from "react";
import styled from "styled-components";
import Slideout from "../../../components/containers/Slideout";
import { Icon } from "../../../components/icons";
import { iconBlank } from "../../../components/icons/blank";
import { useUi } from "../../../components/useUI";
import { NodeTypes, NodeType } from "../../../utility/enums";
import useDraggable from "../../../utility/hooks/useDraggable";
import useUIState from "!/utility/hooks/useUIState";
import { getNodeHelper } from "../definitions";
import { DragCanvasControls } from "../../../components/containers/DragCanvas";
import ArcaneGraph from "../definitions/graph";
import { TextInput } from "../../../components/inputs/TextInput";
import { iconActionSearch } from "../../../components/icons/action/search";
import { INodeHelper } from "../definitions/types";

const NodeList = ({ canvasRef, originRef }: { canvasRef: RefObject<DragCanvasControls>; originRef: RefObject<HTMLDivElement> }) => {
    const { addNode } = ArcaneGraph.useGraph();

    const [isDrawerOpen, setIsDrawerOpen] = useUIState("uistate.nodeview.drawer", true);

    const [filter, setFilter] = useState<string>("");

    const handleAdd = useCallback(
        (type: NodeType) => {
            if (originRef.current && canvasRef.current) {
                const el = canvasRef.current.getElement();
                if (el) {
                    const obb = originRef.current.getBoundingClientRect();
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

    const listOfNodes = useMemo(() => {
        return NODE_BUTTONS.filter((helper) => {
            return filter.trim() === "" ? true : helper.name.toLowerCase().includes(filter.toLowerCase());
        });
    }, [filter]);

    return (
        <Slideout
            label={"Nodes"}
            isOpen={isDrawerOpen}
            onToggle={() => {
                setIsDrawerOpen((p) => !p);
            }}
            direction={"up"}
            size={"clamp(100px, 20vmin, 400px)"}
        >
            <Searchbar>
                <TextInput value={filter} onValue={setFilter} placeholder="Filter..." onClear={setFilter} icon={iconActionSearch} />
            </Searchbar>
            <Grid>
                {listOfNodes.map((t) => (
                    <NodeButton key={t.type} onAction={handleAdd} helper={t} />
                ))}
            </Grid>
        </Slideout>
    );
};

const Searchbar = styled.div`
    padding: 0.25em;
    display: grid;
    position: sticky;
    top: 0;
    background: #222;
`;

const NODE_BUTTONS = Object.values(NodeTypes)
    .filter((v) => v !== NodeTypes.META_RESULT)
    .map(getNodeHelper);

const NodeButton = styled(({ helper, onAction, disabled, className }: { disabled?: boolean; helper: INodeHelper<any>; onAction: (type: NodeType) => void; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleAction = useCallback(() => {
        onAction?.(helper.type);
    }, [helper.type, onAction]);

    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
    const isActive = useUi.action(ref, handleAction, disabled);
    const isHover = useUi.hover(ref, disabled);

    useDraggable(
        ref,
        useMemo(() => {
            return {
                "trh/new_node": ["copy", () => helper.type],
            };
        }, [helper.type])
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

export default NodeList;
