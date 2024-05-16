import styled from "styled-components";
import { Flavour } from "..";
import { Icon, IconDefinition } from "../icons";
import { ReactNode, useMemo, ForwardedRef, forwardRef } from "react";
import { ActionModifers, useUi } from "../useUI";
import useMergedRef from "../../utility/hooks/useMergedRef";

type IconButtonProps = {
    icon: IconDefinition;
    disabled?: boolean;
    onAction?: (target: HTMLElement, modifiers: ActionModifers) => void;
    children?: ReactNode;
    className?: string;
    flavour?: Flavour;
    tooltip?: string;
};

const IconButton = styled(
    forwardRef(({ icon, children, className, disabled, flavour = "accent", onAction, tooltip }: IconButtonProps, fRef: ForwardedRef<HTMLDivElement>) => {
        const [ref, setRef] = useMergedRef(fRef);

        const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
        const isActive = useUi.action(ref, onAction, disabled);
        const isHover = useUi.hover(ref, disabled);

        const cN = useMemo(() => {
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} state-disabled`;
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
            ].join(" ");
        }, [className, disabled, flavour, isActive, isFocus, isFocusHard, isFocusSoft, isHover]);

        return (
            <div role={"button"} className={cN} tabIndex={disabled ? undefined : 0} ref={setRef} title={tooltip}>
                <Icon value={icon} className={`part-icon`} />
                {(children ?? null) !== null && <span className={"part-text"}>{children}</span>}
            </div>
        );
    })
)`
    display: inline-flex;
    align-items: center;
    justify-items: start;
    vertical-align: middle;
    align-content: center;
    justify-content: start;
    padding: calc(0.125em + 1px);
    cursor: var(--cursor-action);
    gap: 1px;
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

export default IconButton;
