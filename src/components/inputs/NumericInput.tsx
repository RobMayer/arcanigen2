import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ValidationHandler } from "../validation";
import { Icon, IconDefinition } from "../icons";
import { useUi } from "../useUI";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";

export type NumericInputProps = {
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
    minExclusive?: boolean;
    maxExclusive?: boolean;
};

export const NumericInput = styled(
    ({
        onCommit,
        onValidCommit,
        onValue,
        onValidValue,
        className,
        validate,
        onValidate,
        value,
        step = 0,
        min,
        max,
        magnitude = 1,
        disabled,
        icon,
        placeholder,
        validator,
        flavour = "accent",
        precision = "none",
        variant,
        tooltip,
        minExclusive = false,
        maxExclusive = false,
    }: NumericInputProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const [cache, setCache] = useState<string>(`${value}`);
        const revertRef = useRef<number>(value);
        const holdRef = useRef<string>(`${value}`);

        useEffect(() => {
            setCache((p) => {
                if (Number(holdRef.current) !== value || holdRef.current === "") {
                    return `${value}`;
                }
                return p;
            });
            revertRef.current = value;
        }, [value]);

        useEffect(() => {
            holdRef.current = cache;
        }, [cache]);

        const [isFocus] = useUi.focus(inputRef, disabled);
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
                    if (max !== undefined && (maxExclusive ? n >= max : n > max)) {
                        reasons.add({ code: "RANGE_OVERFLOW", message: `cannot be above ${max}` });
                    }
                    if (min !== undefined && (minExclusive ? n <= min : n < min)) {
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
            [max, min, onValidateRef, step, validate, validatorRef, minExclusive, maxExclusive]
        );

        const doValidateRef = useStable<typeof doValidate>(doValidate);
        useEffect(() => {
            doValidate(cache);
        }, [doValidate, cache]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doRevert = useCallback(() => {
            const revert = revertRef.current;
            onCommitRef.current?.(Number(revert));
            setCache(`${revert}`);
        }, [onCommitRef]);

        const doChange = useCallback(
            (val: string) => {
                val = val.replace(/,/g, "");
                const errors = doValidateRef.current(val);
                const n = Number(val);
                setCache(`${val}`);
                if (!isNaN(n) && val !== "") {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
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
                if (isNaN(n) || val === "") {
                    doRevert();
                } else {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
                    setCache(`${nV}`);
                    revertRef.current = nV;
                    onCommitRef.current?.(nV);
                    if (reasons.length === 0) {
                        onValidCommitRef.current?.(nV);
                    }
                }
            },
            [doValidateRef, doRevert, precision, onCommitRef, onValidCommitRef]
        );

        const handleInputChange = useCallback(
            (evt: React.ChangeEvent<HTMLInputElement>) => {
                evt.stopPropagation();
                doChange(evt.target.value);
            },
            [doChange]
        );

        useEffect(() => {
            const el = inputRef.current;
            if (el) {
                const onIncDec = (evt: globalThis.KeyboardEvent) => {
                    if (evt.key === "ArrowUp") {
                        evt.preventDefault();
                        const el = evt.target as HTMLInputElement;
                        const val = el.value.replace(/,/g, "");
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
                        const el = evt.target as HTMLInputElement;
                        const val = el.value.replace(/,/g, "");
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
        }, [doCommit, doChange, magnitude, step]);

        useEffect(() => {
            const el = inputRef.current;
            const n = wrapperRef.current;
            if (el && n) {
                const blur = (evt: FocusEvent) => {
                    if (!(evt.currentTarget as HTMLElement).contains(evt.relatedTarget as Node)) {
                        // console.log("Leaving Wrapper");
                        doCommit(el.value);
                        n.removeEventListener("focusout", blur);
                    }
                };

                const focus = (evt: FocusEvent) => {
                    if (!(evt.currentTarget as HTMLElement).contains(evt.relatedTarget as Node)) {
                        // console.log("Came from outside wrapper");
                        n.addEventListener("focusout", blur);
                    }
                };

                const keyUp = (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                        doCommit(el.value);
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

        const cN = useMemo(() => {
            const vars = (variant ?? "")
                .split(" ")
                .map((e) => (e ? `variant-${e}` : ""))
                .join(" ");
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} ${vars} state-disabled`;
            }
            return [className ?? "", `flavour-${flavour}`, vars, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, flavour, disabled, variant, isFocus, isInvalid]);

        return (
            <div className={cN} tabIndex={disabled ? undefined : -1} ref={wrapperRef} title={tooltip}>
                {icon && (
                    <div className={"part-icon"}>
                        <Icon value={icon} />
                    </div>
                )}
                <input
                    type={"text"}
                    ref={inputRef}
                    spellCheck={"false"}
                    className={"part-input"}
                    value={cache}
                    onChange={handleInputChange}
                    disabled={disabled}
                    tabIndex={disabled ? undefined : 0}
                    placeholder={placeholder}
                />
            </div>
        );
    }
)`
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);

    grid-template-columns: 1fr;
    &:has(.part-icon) {
        grid-template-columns: auto 1fr;
    }

    & > .part-icon,
    & > .part-clear {
        flex: 0 0 auto;
        padding-inline: calc(var(--padding) - var(--framing) - 1px);
        align-self: center;
    }

    & > .part-input {
        padding: calc(var(--padding) - var(--framing) - 1px);
        text-align: center;
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-text);
    &:is(.state-focus) {
        border-color: var(--theme-area_focushover-border);
    }

    & > .part-input {
        &::placeholder {
            color: var(--theme-placeholder);
        }
        &::selection {
            background: var(--theme-highlight);
        }
        caret-color: var(--theme-caret);
    }

    & > .part-icon {
        color: var(--theme-icon);
    }

    width: auto;
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
    &:is(.variant-tiny) {
        width: 4em;
    }
`;
