import { ReactNode, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { Icon, IconDefinition } from "../icons";
import { iconUICheckboxChecked } from "../icons/ui/checkboxChecked";
import { iconUICheckboxUnchecked } from "../icons/ui/checkboxUnchecked";
import { ActionModifers, useUi } from "../useUI";

// type Variant = never;

type CheckBoxProps = {
    className?: string;
    children?: ReactNode;
    checked: boolean;
    onToggle?: (value: boolean, target: HTMLElement, buttons: ActionModifers) => void;
    disabled?: boolean;
    iconChecked?: IconDefinition;
    iconUnchecked?: IconDefinition;
    flavour?: Flavour;
    tooltip?: string;
    //  variant?: Variant;
};

const CheckBox = styled(
    ({
        className,
        children,
        checked = false,
        onToggle,
        disabled = false,
        iconChecked = iconUICheckboxChecked,
        iconUnchecked = iconUICheckboxUnchecked,
        flavour = "accent",
        tooltip,
    }: CheckBoxProps) => {
        const ref = useRef<HTMLDivElement>(null);

        const handleAction = useCallback(
            (target: HTMLElement, mods: ActionModifers) => {
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
            <div className={cN} ref={ref} tabIndex={disabled ? undefined : 0} title={tooltip}>
                <Icon className={"part-icon"} value={checked ? iconChecked : iconUnchecked} />
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

export default CheckBox;
