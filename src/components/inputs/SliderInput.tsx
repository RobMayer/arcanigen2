import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { ValidationHandler } from "../validation";
import { useStable } from "../../utility/hooks/useStable";
import { Icon, IconDefinition } from "../icons";
import { useUi } from "../useUI";
import lodash from "lodash";
import MathHelper from "../../utility/mathhelper";

type SliderProps = {
    onCommit?: (value: number) => void;
    onValidCommit?: (value: number) => void;
    onValue?: (value: number) => void;
    onValidValue?: (value: number) => void;
    validate?: (value: number) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    value: number;
    step?: number;
    min?: number;
    max?: number;
    magnitude?: number;
    className?: string;
    disabled?: boolean;
    icon?: IconDefinition;
    placeholder?: string;
    validator?: ValidationHandler;
    flavour?: Flavour;
    precision?: number | "none";
    variant?: string;
    tooltip?: string;
};

const SliderInput = styled(
    ({
        flavour = "accent",
        className,
        disabled,
        value,
        onValue,
        onCommit,
        onValidValue,
        onValidCommit,
        min = 0,
        max = 1,
        step = 0.01,
        precision = 6,
        validator,
        icon,
        magnitude = 1,
        onValidate,
        validate,
        variant,
        placeholder,
        tooltip,
    }: SliderProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        const holdRef = useRef<string>(`${value}`);
        const [strCache, setStrCache] = useState(`${value}`);
        const [numCache, setNumCache] = useState(value);

        const numCacheRef = useRef<number>(numCache);
        const strCacheRef = useRef<string>(strCache);

        useEffect(() => {
            numCacheRef.current = numCache;
        }, [numCache]);

        useEffect(() => {
            strCacheRef.current = strCache;
            holdRef.current = strCache;
        }, [strCache]);

        const revertRef = useRef<number>(value);

        useEffect(() => {
            setStrCache((p) => {
                if (Number(holdRef.current) !== value || holdRef.current === "") {
                    return `${value}`;
                }
                return p;
            });

            setNumCache((p) => {
                if (Number(holdRef.current) !== value || holdRef.current === "") {
                    return value;
                }
                return p;
            });
            revertRef.current = value;
        }, [value]);

        const isFocus = useUi.focusContainer(wrapperRef, disabled);
        const [isInvalid, setIsInvalid] = useState(false);

        const onValidateRef = useStable<typeof onValidate>(onValidate);
        const validatorRef = useStable<ValidationHandler | undefined>(validator);

        useEffect(() => {
            const r = validatorRef.current;
            return () => {
                r?.onDismount();
            };
        }, [validatorRef]);

        const doValidate = useCallback(
            (cur: string) => {
                const n = Number(cur.replace(/,/g, ""));
                const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
                if (isNaN(n) || cur === "") {
                    reasons.add({ code: "BAD_INPUT", message: "must be numeric" });
                } else {
                    validate?.(Number(n))?.forEach((e) => reasons.add(e));
                    if (max !== undefined && n > max) {
                        reasons.add({ code: "RANGE_OVERFLOW", message: `cannot be above ${max}` });
                    }
                    if (min !== undefined && n < min) {
                        reasons.add({ code: "RANGE_UNDERFLOW", message: `cannot be below ${min}` });
                    }
                    if (step !== 0 && !MathHelper.isMultipleOf(n, step)) {
                        reasons.add({ code: "STEP_MISMATCH", message: `must be a multiple of ${step}` });
                    }
                    validate?.(n)?.forEach((e) => reasons.add(e));
                }
                const ary = Array.from(reasons);
                onValidateRef.current?.(ary);
                validatorRef.current?.check(ary);
                setIsInvalid(ary.length !== 0);
                return ary;
            },
            [max, min, onValidateRef, step, validate, validatorRef]
        );

        const doValidateRef = useStable<typeof doValidate>(doValidate);
        useEffect(() => {
            doValidate(strCache);
        }, [doValidate, strCache]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doRevert = useCallback(() => {
            setStrCache(`${revertRef.current}`);
            setNumCache(revertRef.current);
        }, []);

        const doChange = useCallback(
            (val: string) => {
                val = val.replace(/,/g, "");
                const errors = doValidateRef.current(val);
                const n = Number(val);
                setStrCache(val);
                if (!isNaN(n) && val !== "") {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
                    setNumCache(nV);
                    if (errors.length === 0) {
                        onValidValueRef.current?.(nV);
                    }
                    onValueRef.current?.(nV);
                }
            },
            [doValidateRef, onValidValueRef, onValueRef, precision]
        );

        const doCommit = useCallback(
            (val: string) => {
                val = val.replace(/,/g, "");
                const reasons = doValidateRef.current(val);
                const n = Number(val);
                if (isNaN(Number(val)) || val === "") {
                    doRevert();
                } else {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
                    setStrCache(`${nV}`);
                    setNumCache(nV);
                    revertRef.current = nV;
                    onCommitRef.current?.(nV);
                    if (reasons.length === 0) {
                        onValidCommitRef.current?.(nV);
                    }
                }
            },
            [doValidateRef, onValidCommitRef, onCommitRef, doRevert, precision]
        );

        const handleInputChange = useCallback(
            (evt: React.ChangeEvent<HTMLInputElement>) => {
                evt.stopPropagation();
                doChange(evt.target.value);
            },
            [doChange]
        );

        useEffect(() => {
            const el = wrapperRef.current;
            if (el) {
                const onIncDec = (evt: globalThis.KeyboardEvent) => {
                    if (evt.key === "ArrowUp") {
                        evt.preventDefault();
                        const val = numCacheRef.current;
                        const n = Number(val);
                        if (!isNaN(n)) {
                            const add = step === 0 ? 1 : step;
                            const nValue = n + (evt.shiftKey ? add * magnitude : add);
                            doChange(`${nValue}`);
                            doCommit(`${nValue}`);
                        }
                    }
                    if (evt.key === "ArrowDown") {
                        evt.preventDefault();
                        const val = numCacheRef.current;
                        const n = Number(val);
                        if (!isNaN(n)) {
                            const add = step === 0 ? 1 : step;
                            const nValue = n - (evt.shiftKey ? add * magnitude : add);
                            doChange(`${nValue}`);
                            doCommit(`${nValue}`);
                        }
                    }
                };
                el.addEventListener("keydown", onIncDec);
                return () => {
                    el.removeEventListener("keydown", onIncDec);
                };
            }
        }, [doCommit, magnitude, step, doChange]);

        useEffect(() => {
            const el = inputRef.current;
            const n = wrapperRef.current;
            if (n && el) {
                const redirectFocus = () => {
                    el.focus();
                };

                n.addEventListener("focusin", redirectFocus);
                return () => {
                    n.removeEventListener("focusin", redirectFocus);
                };
            }
        }, []);

        useEffect(() => {
            const n = wrapperRef.current;
            if (n) {
                const blur = (evt: FocusEvent) => {
                    if (!(evt.currentTarget as HTMLElement).contains(evt.relatedTarget as Node)) {
                        doCommit(strCacheRef.current);
                        n.removeEventListener("focusout", blur);
                    }
                };

                const focus = (evt: FocusEvent) => {
                    if (!(evt.currentTarget as HTMLElement).contains(evt.relatedTarget as Node)) {
                        n.addEventListener("focusout", blur);
                    }
                };

                const keyUp = (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                        doCommit(strCacheRef.current);
                        n.removeEventListener("keyup", keyUp);
                    }
                };

                const keyDown = (evt: KeyboardEvent) => {
                    if (evt.key === "Enter") {
                        n.addEventListener("keyup", keyUp);
                    }
                };

                n.addEventListener("focusin", focus);
                n.addEventListener("keydown", keyDown);
                return () => {
                    n.removeEventListener("focusin", focus);
                    n.removeEventListener("keydown", keyDown);
                };
            }
        }, [doCommit]);

        /* SVG STUFF */

        const handleDragValue = useMemo(() => {
            return lodash.throttle((val: string) => {
                doChange(val);
            }, 50);
        }, [doChange]);

        useEffect(() => {
            const n = containerRef.current;
            if (n && !disabled) {
                const move = (e: MouseEvent) => {
                    const bb = n.getBoundingClientRect();
                    const sX = bb.left;
                    const eX = bb.left + bb.width;
                    const aX = MathHelper.clamp(MathHelper.delerp(e.clientX, sX, eX), 0, 1);
                    const vX = MathHelper.lerp(aX, min, max);
                    const s = MathHelper.snap(vX, step);
                    handleDragValue(`${precision === "none" ? s : Number(s.toPrecision(precision))}`);
                };

                const up = () => {
                    const val = `${numCacheRef.current}`;
                    doCommit(val);
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", up);
                };
                const down = (e: MouseEvent) => {
                    const bb = n.getBoundingClientRect();
                    const sX = bb.left;
                    const eX = bb.left + bb.width;
                    const aX = MathHelper.clamp(MathHelper.delerp(e.clientX, sX, eX), 0, 1);
                    const vX = MathHelper.lerp(aX, min, max);
                    const nV = precision === "none" ? vX : Math.round(vX * 10 ** precision) / 10 ** precision;
                    doChange(`${MathHelper.snap(nV, step)}`);
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                };

                n.addEventListener("mousedown", down);
                return () => {
                    n.removeEventListener("mousedown", down);
                    document.removeEventListener("mouseup", up);
                    document.removeEventListener("mousemove", move);
                };
            }
        }, [disabled, doChange, doCommit, handleDragValue, step, min, max, precision]);

        const pos = useMemo(() => {
            return {
                left: `${MathHelper.clamp(MathHelper.delerp(numCache, min, max) * 100 - 50, -50, 50)}%`,
            };
        }, [numCache, min, max]);

        const buttonRef = useRef<HTMLDivElement>(null);

        const isButtonHover = useUi.hover(buttonRef);

        const cN = useMemo(() => {
            const vars = (variant ?? "")
                .split(" ")
                .map((e) => (Boolean(e) ? `variant-${e}` : ""))
                .join(" ");

            if (disabled) {
                return `${className ?? ""} flavour-${flavour} ${vars} state-disabled`;
            }
            return [className ?? "", `flavour-${flavour}`, vars, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, variant, flavour, disabled, isFocus, isInvalid]);
        return (
            <div className={cN} tabIndex={-1} ref={wrapperRef} title={tooltip}>
                <div className={"part-container"} ref={containerRef}>
                    <svg className={"part-canvas"} preserveAspectRatio={"none"}>
                        <line className={"part-border"} x1={0} x2={"100%"} y1={"50%"} y2={"50%"} />
                        <line className={"part-track"} x1={0} x2={"100%"} y1={"50%"} y2={"50%"} />
                    </svg>
                    <div className={`part-handle ${disabled ? "" : isButtonHover ? "state-hover" : ""}`} style={pos} ref={buttonRef}>
                        {icon ? <Icon value={icon} /> : null}
                    </div>
                </div>
                <div className={"part-value"}>
                    <input
                        type={"text"}
                        ref={inputRef}
                        className={"part-input"}
                        value={strCache}
                        onChange={handleInputChange}
                        disabled={disabled}
                        tabIndex={disabled ? undefined : 0}
                        placeholder={placeholder}
                        spellCheck={"false"}
                    />
                </div>
            </div>
        );
    }
)`
    flex: 0 0 auto;
    display: inline-grid;
    padding: 1px;
    gap: 1px;
    align-items: center;

    & > .part-container {
        overflow: visible;
        container-type: inline-size;
        margin-inline: 1.5em;

        justify-self: stretch;
        width: auto;

        grid-column: 1;
        pointer-events: none;
        display: grid;
        place-items: center;
        align-content: center;
        justify-content: center;
        position: relative;

        & > .part-canvas {
            position: relative;
            overflow: visible;
            height: 1lh;
            width: 100%;
            grid-column: 1;
            grid-row: 1;
            justify-self: stretch;
            align-self: stretch;
            pointer-events: stroke;

            vector-effect: non-scaling-stroke;

            & > .part-border {
                vector-effect: non-scaling-stroke;
                fill: none;
                stroke-width: calc(0.5em + 2px);
                stroke-linecap: round;
            }
            & > .part-track {
                vector-effect: non-scaling-stroke;
                fill: none;
                stroke-width: 0.5em;
                pointer-events: stroke;
                stroke-linecap: round;
            }
        }

        & > .part-handle {
            grid-column: 1;
            grid-row: 1;
            pointer-events: initial;
            min-width: 1.5em;
            border-radius: 100%;
            height: auto;
            aspect-ratio: 1;
            position: relative;
            height: auto;
            display: grid;
            place-items: center;
            border: 1px solid transparent;
        }
    }

    & > .part-value {
        display: grid;
        padding: var(--framing);
        gap: var(--framing);

        & > .part-input {
            padding: calc(var(--padding) - var(--framing) - 1px);
            text-align: center;
        }
    }

    & > .part-value {
        background: var(--theme-area-bg);
        border: 1px solid var(--theme-area-border);
        color: var(--theme-area-text);
        & > .part-input {
            &::placeholder {
                color: var(--theme-placeholder);
            }
            &::selection {
                background: var(--theme-highlight);
            }
            caret-color: var(--theme-caret);
        }
    }

    & > .part-container > .part-handle {
        cursor: var(--cursor-move);
        background-color: var(--theme-button-bg);
        border: 1px solid var(--theme-button-border);
        color: var(--theme-button-text);
        &:is(.state-hover) {
            background-color: var(--theme-button_focushover-bg);
            border: 1px solid var(--theme-button_focushover-border);
            color: var(--theme-button_focushover-text);
        }
    }

    & > .part-container > .part-canvas {
        & > .part-track {
            stroke: var(--theme-area-bg);
        }
        & > .part-border {
            stroke: var(--theme-area-border);
        }
    }

    &:is(.state-focus) {
        & > .part-container > .part-handle {
            background-color: var(--theme-button_focushover-bg);
            border-color: var(--theme-button_focushover-border);
            color: var(--theme-button_focushover-text);
        }
        & > .part-value {
            border-color: var(--theme-area_focushover-border);
        }
    }

    width: auto;
    grid-template-columns: minmax(10em, 1fr) 6em;
    &:is(.variant-huge) {
        width: 24em;
    }
    &:is(.variant-large) {
        width: 16em;
    }
    &:is(.variant-medium) {
        width: 12em;
    }
    &:is(.variant-small) {
        width: 8em;
    }
`;

export default SliderInput;
