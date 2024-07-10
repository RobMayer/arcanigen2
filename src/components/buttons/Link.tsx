import { AnchorHTMLAttributes, DetailedHTMLProps, HTMLAttributeAnchorTarget, MouseEvent, ReactNode, useMemo, useRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { useUi } from "../useUI";

const NOOP = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
};

export type LinkProps = {
    target?: HTMLAttributeAnchorTarget;
    url?: string;
    flavour?: Flavour;
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
    rel?: string;
};

const Link = styled(({ className, flavour = "accent", disabled = false, url, target, children, rel }: LinkProps) => {
    const ref = useRef<HTMLAnchorElement>(null);

    const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
    const isActive = useUi.action(ref, () => {}, disabled);
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
        <a ref={ref} className={cN} href={url} target={target} onClick={disabled ? NOOP : undefined} onAuxClick={disabled ? NOOP : undefined} rel={rel}>
            {children}
        </a>
    );
})`
    cursor: var(--cursor-action);
    color: var(--theme-link);
    text-decoration: underline;
    &.state-hover,
    &.state-hardfocus {
        color: var(--theme-link_focushover);
    }
    &.state-active {
        color: var(--theme-link_active);
    }
`;

export default Link;
