import { ReactNode, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { ActionModifers, useUi } from "../useUI";

// type Variant = never;

type RadioButtonProps<T> = {
    className?: string;
    children?: ReactNode;
    value: T;
    target: T;
    onSelect?: (value: T, target: HTMLElement, buttons: ActionModifers) => void;
    disabled?: boolean;
    flavour?: Flavour;
    tooltip?: string;
    equalizer?: (a: T, b: T) => boolean;
    //  variant?: Variant;
};

const DEFAULT_EQUALIZER = (a: any, b: any) => a === b;

const RadioButton = styled(<T,>({ className, children, value, target, equalizer = DEFAULT_EQUALIZER, onSelect, disabled = false, flavour = "accent", tooltip }: RadioButtonProps<T>) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleAction = useCallback(
        (obj: HTMLElement, mods: ActionModifers) => {
            onSelect?.(target, obj, mods);
        },
        [onSelect, target]
    );

    const isHover = useUi.hover(ref, disabled);
    const isActive = useUi.action(ref, handleAction, disabled);
    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);

    const isChecked = useMemo(() => {
        return equalizer(target, value);
    }, [equalizer, target, value]);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${flavour} state-disabled ${isChecked ? "state-checked" : "state-unchecked"}`;
        }
        return [
            className,
            `flavour-${flavour}`,
            isChecked ? "state-checked" : "state-unchecked",
            isActive ? "state-active" : "state-inactive",
            isFocus ? "state-focus" : "",
            isFocusHard ? "state-hardfocus" : "",
            isFocusSoft ? "state-softfocus" : "",
            isHover ? "state-hover" : "state-away",
        ]
            .filter(Boolean)
            .join(" ");
    }, [className, disabled, flavour, isChecked, isActive, isFocus, isHover, isFocusHard, isFocusSoft]);

    return (
        <div role={"button"} className={cN} tabIndex={disabled ? undefined : 0} ref={ref} title={tooltip}>
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

export default RadioButton;
