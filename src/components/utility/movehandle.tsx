import { ReactNode, useRef, useMemo } from "react";
import { useUi } from "../useUI";
import styled from "styled-components";

type MoveHandleProps = {
    onStart?: (e: MouseEvent) => void;
    onMove?: (e: MouseEvent) => void;
    onEnd?: (e: MouseEvent) => void;
    className?: string;
    disabled?: boolean;
    children?: ReactNode;
};

export const MoveHandle = styled(({ onStart, onMove, onEnd, className, children, disabled = false }: MoveHandleProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const isMoving = useUi.moveGrip(ref, onMove, disabled, onStart, onEnd);

    const cN = useMemo(() => {
        return `${className ?? ""} ${disabled ? "state-disabled" : isMoving ? "state-moving" : ""}`;
    }, [className, disabled, isMoving]);

    return (
        <div className={cN} ref={ref}>
            {children}
        </div>
    );
})`
    display: contents;
`;
