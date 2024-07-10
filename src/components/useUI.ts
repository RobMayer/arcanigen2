import { RefObject, useEffect, useRef, useState } from "react";

export type ActionModifers = {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

export const ClickButtons = {
    0: "PRIMARY",
    1: "TERTIARY",
    2: "SECODARY",
    3: "BACK",
    4: "FORWARD",
} as const;

export type ClickButton = (typeof ClickButtons)[keyof typeof ClickButtons];

const useHover = (ref: RefObject<HTMLElement>, disabled = false) => {
    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const mouseLeave = (e: MouseEvent) => {
                setIsHover(false);
                n.removeEventListener("mouseleave", mouseLeave);
            };
            const mouseEnter = (e: MouseEvent) => {
                setIsHover(true);
                n.addEventListener("mouseleave", mouseLeave);
            };

            n.addEventListener("mouseenter", mouseEnter);
            n.addEventListener("mouseleave", mouseLeave);
            return () => {
                n.removeEventListener("mouseenter", mouseEnter);
                n.removeEventListener("mouseleave", mouseLeave);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsHover(false);
        }
    }, [disabled]);

    return isHover;
};

const useFocus = (ref: RefObject<HTMLElement>, disabled = false): [isFocus: boolean, isFocusSoft: boolean, isFocusHard: boolean] => {
    const [isFocus, setIsFocus] = useState(false);
    const [isFocusSoft, setIsFocusSoft] = useState(false);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const focus = (e: FocusEvent) => {
                setIsFocus(true);
            };

            const blur = (e: FocusEvent) => {
                setIsFocus(false);
                setIsFocusSoft(false);
            };

            const mouseDown = (e: MouseEvent) => {
                setIsFocusSoft(true);
            };

            n.addEventListener("focus", focus);
            n.addEventListener("blur", blur);
            n.addEventListener("mousedown", mouseDown);
            return () => {
                n.removeEventListener("focus", focus);
                n.removeEventListener("blur", blur);
                n.removeEventListener("mousedown", mouseDown);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsFocus(false);
            setIsFocusSoft(false);
        }
    }, [disabled]);

    return [isFocus, isFocusSoft, isFocus && !isFocusSoft];
};

const useFocusContainer = (ref: RefObject<HTMLElement>, disabled = false): boolean => {
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const focus = (e: FocusEvent) => {
                if (e.currentTarget && n.contains(e.currentTarget as Node)) {
                    setIsFocus(true);
                }
            };

            const blur = (e: FocusEvent) => {
                if (e.relatedTarget === null || !n.contains(e.relatedTarget as Node)) {
                    setIsFocus(false);
                }
            };

            n.addEventListener("focusin", focus);
            n.addEventListener("focusout", blur);
            return () => {
                n.removeEventListener("focusin", focus);
                n.removeEventListener("focusout", blur);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsFocus(false);
        }
    }, [disabled]);

    return isFocus;
};

const useMoveGrip = (ref: RefObject<HTMLElement>, onMove?: (e: MouseEvent) => void, disabled = false, onStart?: (e: MouseEvent) => void, onStop?: (e: MouseEvent) => void) => {
    const [isMoving, setIsMoving] = useState<boolean>(false);
    const onMoveRef = useRef<typeof onMove>(onMove);
    useEffect(() => {
        onMoveRef.current = onMove;
    }, [onMove]);

    const onStartRef = useRef<typeof onStart>(onStart);
    useEffect(() => {
        onStartRef.current = onStart;
    }, [onStart]);

    const onStopRef = useRef<typeof onStop>(onStop);
    useEffect(() => {
        onStopRef.current = onStop;
    }, [onStop]);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const move = (e: MouseEvent) => {
                onMoveRef.current?.(e);
            };

            const up = (e: MouseEvent) => {
                onStopRef.current?.(e);
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
                setIsMoving(false);
            };
            const down = (e: MouseEvent) => {
                onStartRef.current?.(e);
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", up);
                setIsMoving(true);
            };

            n.addEventListener("mousedown", down);
            return () => {
                n.removeEventListener("mousedown", down);
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            };
        }
    }, [disabled, ref]);

    useEffect(() => {
        if (disabled) {
            setIsMoving(false);
        }
    }, [disabled]);

    return isMoving;
};

const useKeyAction = (ref: RefObject<HTMLElement>, onAction?: (target: HTMLElement, modifiers: ActionModifers) => void, disabled = false) => {
    const [isActive, setIsActive] = useState(false);
    const onActionRef = useRef<typeof onAction>(onAction);
    useEffect(() => {
        onActionRef.current = onAction;
    }, [onAction]);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const blur = (e: FocusEvent) => {
                setIsActive(false);
                n.removeEventListener("keyup", keyUp);
            };

            const keyUp = (e: KeyboardEvent) => {
                if (e.key === " " || e.key === "Enter") {
                    setIsActive(false);
                    onActionRef.current?.(n, { shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey });
                    n.removeEventListener("keyup", keyUp);
                }
            };
            const keyDown = (e: KeyboardEvent) => {
                if (e.key === " " || e.key === "Enter") {
                    setIsActive(true);
                    n.addEventListener("keyup", keyUp);
                }
            };
            n.addEventListener("keydown", keyDown);
            n.addEventListener("blur", blur);
            return () => {
                n.removeEventListener("keydown", keyDown);
                n.removeEventListener("keyup", keyUp);
                n.addEventListener("keyup", keyUp);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsActive(false);
        }
    }, [disabled]);

    return isActive;
};

const useMouseAction = (ref: RefObject<HTMLElement>, onAction?: (target: HTMLElement, modifiers: ActionModifers) => void, disabled = false) => {
    const [isActive, setIsActive] = useState(false);
    const onActionRef = useRef<typeof onAction>(onAction);
    useEffect(() => {
        onActionRef.current = onAction;
    }, [onAction]);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const blur = (e: FocusEvent) => {
                setIsActive(false);
                n.removeEventListener("mouseup", actionUp);
            };
            const actionUp = (e: MouseEvent) => {
                if (e.button === 0) {
                    setIsActive(false);
                    onActionRef.current?.(n, { shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey });
                    n.removeEventListener("mouseup", actionUp);
                }
            };
            const actionDown = (e: MouseEvent) => {
                if (e.button === 0) {
                    setIsActive(true);
                    n.addEventListener("mouseup", actionUp);
                }
            };

            n.addEventListener("blur", blur);
            n.addEventListener("mousedown", actionDown);
            return () => {
                n.removeEventListener("blur", blur);
                n.removeEventListener("mousedown", actionDown);
                n.removeEventListener("mouseup", actionUp);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsActive(false);
        }
    }, [disabled]);

    return isActive;
};

const useAction = (ref: RefObject<HTMLElement>, onAction?: (target: HTMLElement, modifiers: ActionModifers) => void, disabled = false) => {
    const isMouse = useMouseAction(ref, onAction, disabled);
    const isKey = useKeyAction(ref, onAction, disabled);
    return isMouse || isKey;
};

const useDroppable = (ref: RefObject<HTMLElement>, onDrop: { [mime: string]: (payload: string) => void }, disabled?: boolean) => {
    const [isDropping, setIsDropping] = useState<boolean>(false);

    const onDropRef = useRef<typeof onDrop>(onDrop);
    useEffect(() => {
        onDropRef.current = onDrop;
    }, [onDrop]);

    useEffect(() => {
        const n = ref.current;
        if (n && !disabled) {
            const dragOver = (e: DragEvent) => {
                if (e.dataTransfer) {
                    const res = Object.keys(onDropRef.current).reduce((prev, each) => {
                        return prev || (e.dataTransfer?.types?.includes(each) ?? false);
                    }, false);
                    setIsDropping(res);
                    e.preventDefault();
                }
            };

            const dragOut = (e: DragEvent) => {
                setIsDropping(false);
            };

            const drop = (e: DragEvent) => {
                setIsDropping(false);
                if (e.dataTransfer) {
                    Object.entries(onDropRef.current).reduce((prev, [type, cb]) => {
                        if (prev) {
                            return true;
                        }
                        if (e.dataTransfer) {
                            if (e.dataTransfer.types?.includes(type) ?? false) {
                                cb(e.dataTransfer.getData(type));
                                return true;
                            }
                        }
                        return false;
                    }, false);
                }
            };

            n.addEventListener("dragover", dragOver);
            n.addEventListener("dragleave", dragOut);
            n.addEventListener("drop", drop);
            return () => {
                n.removeEventListener("dragover", dragOver);
                n.removeEventListener("dragleave", dragOut);
                n.removeEventListener("drop", drop);
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsDropping(false);
        }
    }, [disabled]);

    return isDropping;
};

const useDraggable = (ref: RefObject<HTMLElement>, data: { [mime: string]: string }, disabled?: boolean) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const dataRef = useRef<typeof data>(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        const n = ref.current;
        console.log(n, !!disabled);
        if (n && !disabled) {
            const startDrag = (e: DragEvent) => {
                console.log("starting drag");
                setIsDragging(true);
                if (e.dataTransfer) {
                    Object.entries(dataRef.current).forEach(([type, value]) => {
                        e.dataTransfer?.setData(type, value);
                    });
                }
            };

            const stopDrag = (e: DragEvent) => {
                setIsDragging(false);
            };

            n.setAttribute("draggable", "true");
            n.addEventListener("dragstart", startDrag);
            n.addEventListener("dragend", stopDrag);
            return () => {
                n.removeEventListener("dragstart", startDrag);
                n.removeEventListener("dragend", stopDrag);
                n.removeAttribute("draggable");
            };
        }
    }, [ref, disabled]);

    useEffect(() => {
        if (disabled) {
            setIsDragging(false);
        }
    }, [disabled]);

    return isDragging;
};

export const useUi = {
    draggable: useDraggable,
    droppable: useDroppable,
    keyAction: useKeyAction,
    mouseAction: useMouseAction,
    action: useAction,
    focus: useFocus,
    hover: useHover,
    focusContainer: useFocusContainer,
    moveGrip: useMoveGrip,
};
