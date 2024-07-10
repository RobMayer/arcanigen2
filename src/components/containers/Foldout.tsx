import { ReactNode, HTMLAttributes, useCallback, ComponentType, useState, useRef, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import { Icon } from "../icons";
import { iconCaretDown } from "../icons/caret/down";
import { iconCaretRight } from "../icons/caret/right";
import { useUi } from "../useUI";

type Bar = {
    className?: string;
    onToggle: () => void;
    isOpen: boolean;
    flavour?: Flavour;
    children?: ReactNode;
    disabled?: boolean;
};

type FoldoutProps = {
    label: ReactNode;
    startOpen?: boolean;
    bar?: ComponentType<Bar>;
    barClass?: string;
    flavour?: Flavour;
    disabled?: boolean;
};

type ControlledFoldoutProps = {
    label: ReactNode;
    isOpen: boolean;
    onToggle: (v: boolean) => void;
    bar?: ComponentType<Bar>;
    barClass?: string;
    flavour?: Flavour;
    disabled?: boolean;
};

const Foldout = ({ bar: Bar = DefaultBar, startOpen = false, label, barClass, flavour = "accent", disabled, title, ...props }: HTMLAttributes<HTMLDivElement> & FoldoutProps) => {
    const [state, setState] = useState<boolean>(startOpen);

    const handleToggle = useCallback(() => {
        setState((p) => !p);
    }, []);

    return (
        <>
            <BarWrapper>
                <Bar onToggle={handleToggle} isOpen={state} className={barClass} flavour={flavour} disabled={disabled}>
                    {label}
                </Bar>
            </BarWrapper>
            {state && (
                <Body>
                    <div {...props} />
                </Body>
            )}
        </>
    );
};

const ControlledFoldout = ({ bar: Bar = DefaultBar, isOpen, onToggle, label, barClass, flavour = "accent", disabled, ...props }: HTMLAttributes<HTMLDivElement> & ControlledFoldoutProps) => {
    const handleToggle = useCallback(() => {
        onToggle(!isOpen);
    }, [onToggle, isOpen]);

    return (
        <>
            <BarWrapper>
                <Bar onToggle={handleToggle} isOpen={isOpen} className={barClass} flavour={flavour} disabled={disabled}>
                    {label}
                </Bar>
            </BarWrapper>
            {isOpen && (
                <Body>
                    <div {...props} />
                </Body>
            )}
        </>
    );
};

export { Foldout, ControlledFoldout };

const Body = styled.div`
    display: contents;
`;

const BarWrapper = styled.div`
    display: grid;
`;

const DefaultBar = styled(({ flavour, isOpen, onToggle, children, className, disabled }: Bar) => {
    const ref = useRef<HTMLDivElement>(null);

    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
    const isActive = useUi.action(ref, onToggle, disabled);
    const isHover = useUi.hover(ref, disabled);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${flavour} state-disabled ${isOpen ? "state-open" : "state-closed"}`;
        }
        return [
            className ?? "",
            "state-enabled",
            `flavour-${flavour}`,
            isActive ? "state-active" : "state-inactive",
            isFocus ? "state-focus" : "",
            isFocusHard ? "state-hardfocus" : "",
            isFocusSoft ? "state-softfocus" : "",
            isHover ? "state-hover" : "state-away",
            isOpen ? "state-open" : "state-closed",
        ].join(" ");
    }, [className, disabled, flavour, isActive, isFocus, isFocusHard, isFocusSoft, isHover, isOpen]);

    return (
        <div ref={ref} className={cN} tabIndex={disabled ? undefined : 0} role={"button"}>
            <Icon value={isOpen ? iconCaretDown : iconCaretRight} />
            <div>{children}</div>
        </div>
    );
})`
    position: relative;
    display: inline-flex;
    cursor: var(--cursor-action);
    padding: calc(var(--padding) - 1px) calc(var(--padding-extra) - 1px);
    gap: calc(var(--padding) - 1px) calc(var(--padding-extra) - 1px);

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
`;
