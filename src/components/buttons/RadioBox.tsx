import { ReactNode, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { Icon, IconDefinition } from "../icons";
import { ActionModifers, useUi } from "../useUI";
import { iconUIRadioboxChecked } from "../icons/ui/radioboxChecked";
import { iconUIRadioboxUnchecked } from "../icons/ui/radioboxUnchecked";

// type Variant = never;

type CheckBoxProps<T> = {
    className?: string;
    children?: ReactNode;
    value: T;
    target: T;
    onSelect?: (value: T, target: HTMLElement, buttons: ActionModifers) => void;
    disabled?: boolean;
    iconChecked?: IconDefinition;
    iconUnchecked?: IconDefinition;
    flavour?: Flavour;
    tooltip?: string;
    equalizer?: (a: T, b: T) => boolean;
    //  variant?: Variant;
};

const DEFAULT_EQUALIZER = (a: any, b: any) => a === b;

const RadioBox = styled(
    <T,>({
        value,
        target,
        className,
        children,
        onSelect,
        disabled = false,
        iconChecked = iconUIRadioboxChecked,
        iconUnchecked = iconUIRadioboxUnchecked,
        flavour = "accent",
        tooltip,
        equalizer = DEFAULT_EQUALIZER,
    }: CheckBoxProps<T>) => {
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
            <div className={cN} ref={ref} tabIndex={disabled ? undefined : 0} title={tooltip}>
                <Icon className={"part-icon"} value={isChecked ? iconChecked : iconUnchecked} />
                {children && <div className={"part-label"}>{children}</div>}
            </div>
        );
    }
)`
    display: inline-flex;
    align-items: center;
    justify-items: start;
    align-content: center;
    justify-content: start;
    cursor: var(--cursor-action);
    padding-inline: calc(var(--padding) / 2);
    gap: calc(var(--padding) / 2);
    & > .part-label {
        color: inherit;
    }
    & > .part-icon {
        color: inherit;
    }
    color: var(--theme-link);
    &.state-hover,
    &.state-hardfocus {
        color: var(--theme-link_focushover);
    }
    &.state-active {
        color: var(--theme-link_active);
    }
`;

export default RadioBox;
