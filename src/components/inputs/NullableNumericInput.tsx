import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ValidationHandler } from "../validation";
import { Icon, IconDefinition } from "../icons";
import { useUi } from "../useUI";
import { iconActionClose } from "../icons/action/close";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";

export type NumericInputProps = {
    onCommit?: (value: number | null) => void;
    onValidCommit?: (value: number | null) => void;
    onValue?: (value: number | null) => void;
    onValidValue?: (value: number | null) => void;
    validate?: (value: number | null) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    value: number | null;
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
    onClear?: (val: null) => void;
    required?: boolean;
    tooltip?: string;
};

export const NullableNumericInput = styled(
    ({
        onCommit,
        onValidCommit,
        onValue,
        onValidValue,
        className,
        validate,
        validator,
        onValidate,
        onClear,
        value,
        step = 0,
        min,
        max,
        magnitude = 1,
        disabled,
        icon,
        placeholder,
        required = false,
        flavour = "accent",
        precision = "none",
        tooltip,
    }: NumericInputProps) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [cache, setCache] = useState<string>(`${value ?? ""}`);
        const revertRef = useRef<number | null>(value);
        const holdRef = useRef<string>(`${value ?? ""}`);

        useEffect(() => {
            setCache((p) => {
                if ((value === null && holdRef.current === "") || Number(holdRef.current) !== value) {
                    return `${value ?? ""}`;
                }
                return p;
            });
            revertRef.current = value;
        }, [value]);

        useEffect(() => {
            holdRef.current = cache;
        }, [cache]);

        const isFocus = useUi.focusContainer(wrapperRef, disabled);
        const [isInvalid, setIsInvalid] = useState(false);

        const onValidateRef = useRef<typeof onValidate>(onValidate);
        useEffect(() => {
            onValidateRef.current = onValidate;
        }, [onValidate]);

        const validatorRef = useRef<ValidationHandler | undefined>(validator);
        useEffect(() => {
            validatorRef.current = validator;
        }, [validator]);

        useEffect(() => {
            return () => {
                validatorRef.current?.onDismount();
            };
        }, []);

        const doValidate = useCallback(
            (cur: string) => {
                const n = Number(cur.replace(/,/g, ""));
                const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
                if (isNaN(n)) {
                    reasons.add({ code: "BAD_INPUT", message: "must be numeric" });
                } else if (cur === "" && required) {
                    reasons.add({ code: "MISSING", message: "must contain a value" });
                } else if (cur !== "") {
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
            [max, min, step, validate, required]
        );

        const doValidateRef = useRef<typeof doValidate>(doValidate);
        useEffect(() => {
            doValidateRef.current = doValidate;
            doValidate(cache);
        }, [doValidate, cache]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doRevert = useCallback(() => {
            const revert = revertRef.current;
            if (revert === null) {
                onCommitRef.current?.(null);
            } else {
                onCommitRef.current?.(Number(revert));
            }
            setCache(`${revert ?? ""}`);
        }, [onCommitRef]);

        const doChange = useCallback(
            (val: string) => {
                val = val.replace(/,/g, "");
                const errors = doValidateRef.current(val);
                const n = Number(val);
                setCache(`${val}`);
                if (val === "") {
                    if (errors.length === 0) {
                        onValidValueRef.current?.(null);
                    }
                    onValueRef.current?.(null);
                } else if (!isNaN(n)) {
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
                if (val === "") {
                    setCache("");
                    revertRef.current = null;
                    onCommitRef.current?.(null);
                    if (reasons.length === 0) {
                        onValidCommitRef.current?.(null);
                    }
                } else if (isNaN(n)) {
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

        const handleClear = useCallback(() => {
            setCache("");
            onClear?.(null);
            inputRef.current?.focus();
        }, [onClear]);

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
        }, [step, magnitude, doCommit, doChange]);

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
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} state-disabled`;
            }
            return [className ?? "", `flavour-${flavour}`, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, disabled, flavour, isFocus, isInvalid]);

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
                    className={"part-input"}
                    value={cache}
                    onChange={handleInputChange}
                    disabled={disabled}
                    tabIndex={disabled ? undefined : 0}
                    placeholder={placeholder}
                    spellCheck={"false"}
                />
                {onClear && <ClearButton onAction={handleClear} className={"part-clear"} disabled={disabled || cache === ""} />}
            </div>
        );
    }
)`
    width: auto;
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);

    grid-template-columns: 1fr;

    &:has(.part-icon) {
        grid-template-columns: auto 1fr;
    }
    &:has(.part-clear) {
        grid-template-columns: auto 1fr auto;
    }
    &:has(.part-clear):has(.part-icon) {
        grid-template-columns: auto 1fr auto;
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
        --theme-icon: inherit;
        color: var(--theme-icon);
    }

    & > .part-clear {
        color: var(--theme-link);
        &:is(.state-hover) {
            color: var(--theme-link_focushover);
        }
        &:is(.state-active) {
            color: var(--theme-link_active);
        }
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

const ClearButton = styled(({ disabled, onAction, className }: { disabled?: boolean; onAction: () => void; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const isClickActive = useUi.mouseAction(ref, onAction, disabled);
    const isHover = useUi.hover(ref, disabled);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} state-disabled`;
        }
        return [className, isHover ? "state-hover" : "state-away", isClickActive ? "state-active" : ""].join(" ");
    }, [disabled, isHover, isClickActive, className]);

    return (
        <div className={cN} ref={ref} title={"Clear"}>
            <Icon value={iconActionClose} />
        </div>
    );
})`
    display: inline-flex;
    flex: 0 0 auto;
    cursor: pointer;
    &.state-disabled {
        cursor: default;
    }
`;
