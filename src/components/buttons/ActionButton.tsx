import { ForwardedRef, ReactNode, forwardRef, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { ActionModifers, useUi } from "../useUI";
import useMergedRef from "../../utility/hooks/useMergedRef";

type ActionButtonProps = {
    disabled?: boolean;
    onAction?: (target: HTMLElement, modifiers: ActionModifers) => void;
    children?: ReactNode;
    className?: string;
    flavour?: Flavour;
    variant?: string;
    tooltip?: string;
};

const ActionButton = styled(
    forwardRef(({ children, className, onAction, disabled, flavour = "accent", variant = "normal", tooltip }: ActionButtonProps, fRef: ForwardedRef<HTMLDivElement>) => {
        const [ref, setRef] = useMergedRef(fRef);

        const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
        const isActive = useUi.action(ref, onAction, disabled);
        const isHover = useUi.hover(ref, disabled);

        const cN = useMemo(() => {
            const vars = (variant ?? "")
                .split(" ")
                .map((e) => (Boolean(e) ? `variant-${e}` : ""))
                .join(" ");

            if (disabled) {
                return `${className ?? ""} flavour-${flavour} ${vars} state-disabled`;
            }
            return [
                className ?? "",
                "state-enabled",
                `flavour-${flavour}`,
                vars,
                isActive ? "state-active" : "state-inactive",
                isFocus ? "state-focus" : "",
                isFocusHard ? "state-hardfocus" : "",
                isFocusSoft ? "state-softfocus" : "",
                isHover ? "state-hover" : "state-away",
            ].join(" ");
        }, [className, disabled, flavour, variant, isActive, isFocus, isFocusHard, isFocusSoft, isHover]);

        return (
            <div role={"button"} className={cN} tabIndex={disabled ? undefined : 0} ref={setRef} title={tooltip}>
                {children}
            </div>
        );
    })
)`
    position: relative;
    display: inline-flex;
    cursor: var(--cursor-action);
    padding: calc(var(--padding) - 1px) calc(var(--padding-extra) - 1px);
    justify-content: center;
    align-items: center;

    background: var(--theme-button-bg);
    border: 1px solid var(--theme-button-border);
    color: var(--theme-button-text);

    &:is(.state-hover),
    &:is(.state-hardfocus) {
        background-color: var(--theme-button_focushover-bg);
        border-color: var(--theme-button_focushover-border);
        color: var(--theme-button_focushover-text);
    }
    &:is(.state-active) {
        background: var(--theme-button_active-bg);
        border-color: var(--theme-button_active-border);
        color: var(--theme-button_active-text);
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

export default ActionButton;
