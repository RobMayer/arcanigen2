import { ReactNode, useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { useUi } from "../useUI";

type ArraySelectProps = {
    options: ReactNode[];
    onSelect: (v: number | null | ((p: number | null) => number | null)) => void;
    value: number | null;
    disabled?: boolean;
    tabIndex?: number;
    className?: string;
    flavour?: Flavour;
};

export const ArraySelect = styled(({ tabIndex = 1, className, options, value, onSelect, disabled = false, flavour = "accent" }: ArraySelectProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isFocus = useUi.focusContainer(wrapperRef);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${flavour} state-disabled`;
        }
        return [className ?? "", `flavour-${flavour}`, "state-enabled", isFocus ? "state-focus" : "state-blur"].join(" ");
    }, [className, flavour, disabled, isFocus]);

    return (
        <div className={cN} tabIndex={disabled ? undefined : tabIndex} ref={wrapperRef}>
            {options.map((item, i) => {
                return (
                    <Option key={i} selected={i === value} value={i} select={onSelect} disabled={disabled}>
                        {item}
                    </Option>
                );
            })}
        </div>
    );
})`
    width: auto;
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    justify-items: stretch;

    & > .part-option {
        cursor: var(--cursor-action);
        display: flex;
        padding: calc(var(--padding) - var(--framing) - 1px) calc(var(--padding-extra) - var(--framing) - 1px);
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-color);

    &:is(.state-focus) {
        border: 1px solid var(--theme-area_focushover-border);
    }

    & > .part-option {
        background: var(--theme-option-bg);
        color: var(--theme-option-text);

        &:is(.state-hover) {
            background: var(--theme-option_focushover-bg);
            color: var(--theme-option_focushover-text);
        }

        &:is(.state-active) {
            background: var(--theme-option_active-bg);
            color: var(--theme-option_active-text);
        }

        &:is(.state-selected) {
            background: var(--theme-option_selected-bg);
            color: var(--theme-option_selected-text);

            &:is(.state-hover) {
                background: var(--theme-option_selected_focushover-bg);
                color: var(--theme-option_selected_focushover-text);
            }

            &:is(.state-active) {
                background: var(--theme-option_selected_active-bg);
                color: var(--theme-option_selected_active-text);
            }
        }
    }
`;

const Option = ({
    selected = false,
    select,
    value,
    disabled = false,
    children,
    className,
}: {
    selected: boolean;
    select: (v: number | null | ((p: number | null) => number | null)) => void;
    value: number;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
}) => {
    const handleClick = useCallback(() => {
        select((v) => (v === value ? null : value));
    }, [value, select]);

    const ref = useRef<HTMLDivElement>(null);

    const isHover = useUi.hover(ref, disabled);
    const isActive = useUi.action(ref, handleClick, disabled);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} part-option ${selected ? "state-selected" : ""} state-disabled`;
        }
        return ["part-option", className ?? "", isHover ? "state-hover" : "state-away", selected ? "state-selected" : "", isActive ? "state-active" : "state-inactive"].join(" ");
    }, [disabled, className, selected, isHover, isActive]);

    return (
        <div className={cN} ref={ref}>
            {children}
        </div>
    );
};
