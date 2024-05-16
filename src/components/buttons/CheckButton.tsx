import { ReactNode, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { ActionModifers, useUi } from "../useUI";

// type Variant = never;

type CheckButtonProps = {
    className?: string;
    children?: ReactNode;
    checked: boolean;
    onToggle?: (value: boolean, target: HTMLElement, buttons: ActionModifers) => void;
    disabled?: boolean;
    flavour?: Flavour;
    tooltip?: string;
    //  variant?: Variant;
};

const CheckButton = styled(({ className, children, checked = false, onToggle, disabled = false, flavour = "accent", tooltip }: CheckButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleAction = useCallback(
        (target: HTMLElement, mods: ActionModifers) => {
            console.log("CHECKED", checked);
            onToggle?.(!checked, target, mods);
        },
        [onToggle, checked]
    );

    const isHover = useUi.hover(ref, disabled);
    const isActive = useUi.action(ref, handleAction, disabled);
    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${flavour} state-disabled ${checked ? "state-checked" : "state-unchecked"}`;
        }
        return [
            className,
            `flavour-${flavour}`,
            checked ? "state-checked" : "state-unchecked",
            isActive ? "state-active" : "state-inactive",
            isFocus ? "state-focus" : "",
            isFocusHard ? "state-hardfocus" : "",
            isFocusSoft ? "state-softfocus" : "",
            isHover ? "state-hover" : "state-away",
        ]
            .filter(Boolean)
            .join(" ");
    }, [className, disabled, flavour, checked, isActive, isFocus, isHover, isFocusHard, isFocusSoft]);

    return (
        <div className={cN} tabIndex={disabled ? undefined : 0} ref={ref} title={tooltip}>
            {children}
        </div>
    );
})`
    position: relative;
    display: inline-flex;
    cursor: var(--cursor-action);
    padding: calc(var(--padding) - 1px) calc(var(--padding-extra) - 1px);
    justify-content: center;
    align-items: center;

    background: var(--theme-option-bg);
    border: 1px solid var(--theme-option-border);
    color: var(--theme-option-text);

    &.state-hover,
    &.state-hardfocus {
        background-color: var(--theme-option_focushover-bg);
        border-color: var(--theme-option_focushover-border);
        color: var(--theme-option_focushover-text);
    }
    &.state-active {
        background: var(--theme-option_active-bg);
        border-color: var(--theme-option_active-border);
        color: var(--theme-option_active-text);
    }

    &:is(.state-checked) {
        background: var(--theme-option_selected-bg);
        border: 1px solid var(--theme-option_selected-border);
        color: var(--theme-option_selected-text);

        &.state-hover,
        &.state-hardfocus {
            background-color: var(--theme-option_selected_focushover-bg);
            border-color: var(--theme-option_selected_focushover-border);
            color: var(--theme-option_selected_focushover-text);
        }
        &.state-active {
            background: var(--theme-option_selected_active-bg);
            border-color: var(--theme-option_selected_active-border);
            color: var(--theme-option_selected_active-text);
        }
    }

    &:is(.variant-rounded) {
        border-radius: 0.25rem;
    }
    &:is(.variant-bolded) {
        font-weight: bold;
    }
    &:is(.variant-small) {
        font-size: 0.875rem;
    }
    &:is(.variant-slim) {
    }
    &:is(.variant-pill) {
        border-radius: 100vw;
    }
`;

export default CheckButton;
