import { useEffect, useMemo, useRef, useState, MouseEvent, ReactNode, HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import Backdrop, { Backdrops } from "./Backdrop";
import { Direction, Justification, ArrowProps, BoundingBox, Popup } from "./Popup";

const Hint = ({ align = "down right", justify = "start", controls, arrow, children, wrapper = HintWrappers.Typical as (p: HTMLAttributes<HTMLDivElement>) => JSX.Element }: HintProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { close, position } = controls;

    return position ? (
        createPortal(
            <Backdrop action={close} wrapperRef={containerRef} element={Backdrops.Glass} closeOnScroll>
                <Popup target={position} align={align} justify={justify} arrow={arrow} wrapper={wrapper}>
                    {children}
                </Popup>
            </Backdrop>,
            document.getElementById("widget-root")!
        )
    ) : (
        <></>
    );
};

export default Hint;

export const HintWrappers = {
    Typical: styled.div`
        background: var(--layer1);
        border: 1px solid var(--effect-border-highlight);
        outline: 1px solid var(--effect-border-muted);
        color: var(--text);
        display: flex;
        flex-direction: column;
        box-shadow: 0px 0px 4px var(--app-box-shadow);
        padding: 0.25em;
        gap: 0.25em;
    `,
};

type HintProps = {
    align?: Direction;
    justify?: Justification;
    arrow?: Partial<ArrowProps>;
    controls: HintControls;
    children?: ReactNode;
    wrapper?: (p: HTMLAttributes<HTMLDivElement>) => JSX.Element;
};

export type HintControls = {
    open: {
        at: (x: number, y: number, width?: number, height?: number) => void;
        when: (e: MouseEvent) => void;
        on: (element: Element) => void;
        for: (e: MouseEvent) => void;
    };
    isOpen: boolean;
    close: () => void;
    position: BoundingBox | null;
};

export const useHint = (onClose?: () => void) => {
    const [pos, setPos] = useState<BoundingBox | null>(null);

    return useMemo<HintControls>(() => {
        return {
            open: {
                at: (x: number, y: number, width: number = 0, height: number = 0) => {
                    setPos({ x, y, width, height });
                },
                on: (element: Element) => {
                    const { x, y, width, height } = element.getBoundingClientRect();
                    setPos({ x, y, width, height });
                },
                when: (e: MouseEvent) => {
                    setPos({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
                },
                for: (e: MouseEvent) => {
                    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
                    setPos({ x, y, width, height });
                },
            },
            isOpen: pos !== null,
            close: () => {
                setPos(null);
                onClose && onClose();
            },
            position: pos,
        };
    }, [pos, onClose]);
};
