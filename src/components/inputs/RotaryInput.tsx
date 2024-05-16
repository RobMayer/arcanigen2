import MathHelper from "!/utility/mathhelper";
import lodash from "lodash";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";
import { useUi } from "../useUI";
import { ValidationHandler } from "../validation";
import { Icon, IconDefinition } from "../icons";

type RotaryInputProps = {
    wrap?: boolean;
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
    placeholder?: string;
    validator?: ValidationHandler;
    flavour?: Flavour;
    precision?: number | "none";
    tooltip?: string;
    icon?: IconDefinition;
    variant?: string;
};

// TODO: CLEAN THIS UP!

const RotaryInput = styled(
    ({
        value,
        onValue,
        onValidValue,
        onCommit,
        onValidCommit,
        className,
        flavour = "accent",
        disabled,
        max,
        min,
        magnitude = 1,
        step = 0,
        wrap = false,
        validator,
        onValidate,
        validate,
        placeholder,
        precision = "none",
        tooltip,
        variant = "",
        icon,
    }: RotaryInputProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        const holdRef = useRef<string>(`${value}`);
        const [strCache, setStrCache] = useState(`${value}`);
        const [numCache, setNumCache] = useState(value);

        const quadrent = useRef<number>(Math.floor(numCache / 90));
        const numCacheRef = useRef<number>(numCache);
        const strCacheRef = useRef<string>(strCache);

        useEffect(() => {
            quadrent.current = Math.floor(numCache / 90);
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
                    if (step !== 0 && n % step !== 0) {
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
                    onValueRef.current?.(nV);
                    if (errors.length === 0) {
                        onValidValueRef.current?.(nV);
                    }
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
                    const wF = wrap ? nV : nV % 360;
                    setStrCache(`${wF}`);
                    setNumCache(wF);
                    revertRef.current = wF;
                    onCommitRef.current?.(wF);
                    onValueRef.current?.(wF);
                    if (reasons.length === 0) {
                        onValidCommitRef.current?.(wF);
                        onValidValueRef.current?.(wF);
                    }
                }
            },
            [doValidateRef, doRevert, precision, wrap, onCommitRef, onValueRef, onValidCommitRef, onValidValueRef]
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
                            doCommit(`${wrap ? nValue : MathHelper.mod(nValue, 360)}`);
                        }
                    }
                    if (evt.key === "ArrowDown") {
                        evt.preventDefault();
                        const val = numCacheRef.current;
                        const n = Number(val);
                        if (!isNaN(n)) {
                            const add = step === 0 ? 1 : step;
                            const nValue = n - (evt.shiftKey ? add * magnitude : add);
                            doCommit(`${wrap ? nValue : MathHelper.mod(nValue, 360)}`);
                        }
                    }
                };
                el.addEventListener("keydown", onIncDec);
                return () => {
                    el.removeEventListener("keydown", onIncDec);
                };
            }
        }, [doCommit, magnitude, step, wrap]);

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
                    const eX = bb.left + bb.width / 2 - e.clientX;
                    const eY = bb.top + bb.height / 2 - e.clientY;
                    if (wrap) {
                        const newPoint = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);

                        const oldQ = quadrent.current;

                        const cQ = MathHelper.shortestQuadrent(MathHelper.mod(oldQ, 4), Math.floor(newPoint / 90));
                        quadrent.current = oldQ + cQ;
                        const r = (oldQ + cQ) * 90 + MathHelper.mod(newPoint, 90);
                        handleDragValue(`${MathHelper.snap(r, step)}`);
                    } else {
                        const r = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);
                        handleDragValue(`${MathHelper.snap(r, step)}`);
                    }
                };

                const up = () => {
                    const val = `${numCacheRef.current}`;
                    doCommit(val);
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", up);
                };
                const down = (e: MouseEvent) => {
                    const bb = n.getBoundingClientRect();
                    const eX = bb.left + bb.width / 2 - e.clientX;
                    const eY = bb.top + bb.height / 2 - e.clientY;

                    if (wrap) {
                        const oldAngle = numCacheRef.current;
                        const newAngle = (Math.atan2(eX, eY) * -180) / Math.PI;
                        const dist = MathHelper.shortestArc(oldAngle, newAngle);
                        const r = oldAngle + dist;
                        doChange(`${MathHelper.snap(r, step)}`);
                    } else {
                        const r = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);
                        doChange(`${MathHelper.snap(r, step)}`);
                    }
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
        }, [disabled, doChange, doCommit, wrap, handleDragValue, step]);

        const cN = useMemo(() => {
            const vars = (variant ?? "")
                .split(" ")
                .map((e) => (Boolean(e) ? `variant-${e}` : ""))
                .join(" ");

            if (disabled) {
                return `${className ?? ""} flavour-${flavour} ${vars} state-disabled`;
            }
            return [className ?? "", `flavour-${flavour}`, "state-enabled", vars, isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, flavour, disabled, isFocus, isInvalid, variant]);

        const pos = useMemo(() => {
            return {
                left: `${Math.cos(((numCache - 90) * Math.PI) / 180) * 50}%`,
                top: `${Math.sin(((numCache - 90) * Math.PI) / 180) * 50}%`,
            };
        }, [numCache]);

        const buttonRef = useRef<HTMLDivElement>(null);

        const isButtonHover = useUi.hover(buttonRef);

        return (
            <div className={cN} tabIndex={-1} ref={wrapperRef} title={tooltip}>
                <div className={"part-container"} ref={containerRef}>
                    <svg className={"part-canvas"} width={"100%"} height={"100%"} viewBox={"0 0 1 1"}>
                        <circle className={"part-border"} r={0.5} cx={0.5} cy={0.5} />
                        <circle className={"part-track"} r={0.5} cx={0.5} cy={0.5} />
                    </svg>
                    <div className={`part-handle ${disabled ? "" : isButtonHover ? "state-hover" : ""}`} style={pos} ref={buttonRef}>
                        {icon ? <Icon value={icon} /> : null}
                    </div>
                </div>
                <div className={"part-value"}>
                    <input
                        spellCheck={"false"}
                        type={"text"}
                        ref={inputRef}
                        className={"part-input"}
                        value={strCache}
                        onChange={handleInputChange}
                        disabled={disabled}
                        tabIndex={disabled ? undefined : 0}
                        placeholder={placeholder}
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

    grid-template-columns: 6em 1fr;
    & > .part-container {
        container-type: inline-size;
        overflow: visible;
        padding: 1em;
        aspect-ratio: 1;
        min-height: 0;
        height: auto;
        grid-column: 1;
        pointer-events: none;
        display: grid;
        place-items: center;

        & > .part-canvas {
            overflow: visible;
            grid-column: 1;
            grid-row: 1;
            pointer-events: stroke;

            vector-effect: non-scaling-stroke;

            & > .part-border {
                vector-effect: non-scaling-stroke;
                fill: none;
                stroke-width: calc(0.5em + 2px);
            }
            & > .part-track {
                vector-effect: non-scaling-stroke;
                fill: none;
                stroke-width: 0.5em;
                pointer-events: stroke;
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
    grid-template-columns: 6em 1fr;
    &:is(.variant-large) {
        grid-template-columns: 6em 1fr;
    }
    &:is(.variant-medium) {
        width: 12em;
    }
`;

export default RotaryInput;
