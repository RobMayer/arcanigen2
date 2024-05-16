import { HTMLAttributes, ReactNode, useCallback, useEffect, useState, MouseEvent, useMemo, useRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import { Icon } from "../icons";
import { iconCaretDown } from "../icons/caret/down";
import { iconCaretUp } from "../icons/caret/up";
import { iconCaretLeft } from "../icons/caret/left";
import { iconCaretRight } from "../icons/caret/right";
import { useUi } from "../useUI";

type Direction = "up" | "down" | "left" | "right";

export type SlideoutBarProps = {
    flavour?: Flavour;
    isOpen: boolean;
    direction: Direction;
    onToggle: () => void;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    title?: string;
};

type IProps<T extends SlideoutBarProps> = Omit<T, keyof SlideoutBarProps> & {
    direction: Direction;
    isOpen?: boolean;
    flavour?: Flavour;
    label?: ReactNode;
    onToggle?: () => void;
    bar?: (p: T) => JSX.Element;
    disabled?: boolean;
    size?: string;
    title?: string;
    children?: ReactNode;
};

const Slideout = styled(
    <T extends SlideoutBarProps = SlideoutBarProps>({
        bar: Bar = SlideoutBars.Typical as (p: T) => JSX.Element,
        direction,
        isOpen = false,
        onToggle,
        label,
        flavour = "accent",
        title,
        disabled = false,
        size = "auto",
        children,
        ...rest
    }: IProps<T>) => {
        const [state, setState] = useState<boolean>(isOpen);

        useEffect(() => {
            setState(isOpen);
        }, [isOpen]);

        const handleToggle = useCallback(() => {
            setState((p) => !p);
            onToggle && onToggle();
        }, [onToggle]);

        const nS = useMemo(() => {
            return {
                width: direction === "up" || direction === "down" ? "auto" : state ? size : "auto",
                height: direction === "left" || direction === "right" ? "auto" : state ? size : "auto",
            };
        }, [direction, state, size]);

        return (
            <Wrapper direction={direction} isOpen={state} style={nS}>
                <BarWrapper>
                    <Bar flavour={flavour} {...((rest ?? {}) as T)} isOpen={state} direction={direction} onToggle={handleToggle} disabled={disabled} title={title}>
                        {label}
                    </Bar>
                </BarWrapper>
                {state && <Inner>{children}</Inner>}
            </Wrapper>
        );
    }
)``;

export default Slideout;

const Inner = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    writing-mode: horizontal-tb;
`;

const getIconDirection = (direction: Direction, isOpen: boolean) => {
    switch (direction) {
        case "down":
            return isOpen ? "up" : "down";
        case "up":
            return isOpen ? "down" : "up";
        case "right":
            return isOpen ? "left" : "right";
        case "left":
            return isOpen ? "right" : "left";
    }
};

const SlideoutBars = {
    getIconDirection,
    Minimal: styled(({ flavour = "accent", isOpen, direction, onToggle, children, className, disabled, title, ...props }: SlideoutBarProps) => {
        const handleToggle = useCallback(
            (e: MouseEvent<HTMLDivElement>) => {
                if (!e.defaultPrevented) {
                    onToggle();
                    e.preventDefault();
                }
            },
            [onToggle]
        );

        const icon = useMemo(() => getCaret(direction, isOpen), [direction, isOpen]);

        return (
            <Button {...props} onClick={handleToggle} className={`${className ?? ""} flavour-${flavour} direction-${direction}`} disabled={disabled} title={title}>
                <Icon value={icon} />
            </Button>
        );
    })`
        text-align: start;
        justify-self: stretch;
        padding: var(--padding);
        gap: var(--padding);
        display: grid;
        grid-template-columns: auto;
        align-items: center;
        color: var(--theme-button-text);
        background: var(--theme-button-bg);
        border: 1px solid var(--theme-button-border);

        &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
        &:is(:hover:not(.state-inactive)):not(.state-disabled) {
            color: var(--theme-button_focushover-text);
            background: var(--theme-button_focushover-bg);
        }
    `,
    Typical: styled(({ flavour = "accent", isOpen, direction, onToggle, children, className, disabled, title }: SlideoutBarProps) => {
        const ref = useRef<HTMLDivElement>(null);

        const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);
        const isActive = useUi.action(ref, onToggle, disabled);
        const isHover = useUi.hover(ref, disabled);

        const icon = useMemo(() => getCaret(direction, isOpen), [direction, isOpen]);

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
                <Icon value={icon} />
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
    `,
};

const Wrapper = styled(({ direction, className, children, isOpen, style }: { direction: Direction; className?: string; children?: ReactNode; isOpen: boolean } & HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={`${className ?? ""} direction-${direction} ${isOpen ? "state-open" : "state-closed"}`} style={style}>
            {children}
        </div>
    );
})`
    display: flex;
    &.direction-down {
        flex-direction: column-reverse;
    }
    &.direction-up {
        flex-direction: column;
    }

    &.direction-left {
        flex-direction: column;
        writing-mode: vertical-lr;
    }
    &.direction-right {
        flex-direction: column-reverse;
        writing-mode: vertical-lr;
    }
    section:has(> &.direction-left),
    section:has(> &.direction-right) {
        writing-mode: vertical-lr;
    }
`;

const BarWrapper = styled.div`
    display: grid;
    flex: 0 0 auto;
    inline-size: 100%;
`;

const getCaret = (direction: Direction, isOpen: boolean) => {
    switch (SlideoutBars.getIconDirection(direction, isOpen)) {
        case "down":
            return iconCaretDown;
        case "up":
            return iconCaretUp;
        case "left":
            return iconCaretLeft;
        case "right":
            return iconCaretRight;
    }
};
