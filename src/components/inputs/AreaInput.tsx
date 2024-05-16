import styled from "styled-components";
import { Flavour } from "..";
import { ValidationHandler } from "../validation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStable } from "../../utility/hooks/useStable";
import { useUi } from "../useUI";

export type AreaInputProps = {
    onValue?: (value: string) => void;
    className?: string;
    onValidValue?: (value: string) => void;
    onCommit?: (value: string) => void;
    onValidCommit?: (value: string) => void;
    validate?: (value: string) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    value: string;
    validator?: ValidationHandler;
    disabled?: boolean;
    variant?: string;
    flavour?: Flavour;
    tooltip?: string;
    placeholder?: string;
    tabIndex?: number;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    spellcheck?: boolean;
};

export const AreaInput = styled(
    ({
        onValue,
        onValidValue,
        onCommit,
        onValidCommit,
        validate,
        onValidate,
        className,
        min,
        max,
        pattern,
        value,
        validator,
        disabled = false,
        variant,
        flavour = "accent",
        tooltip,
        placeholder,
        tabIndex,
        required = false,
        spellcheck = false,
    }: AreaInputProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLTextAreaElement>(null);
        const [cache, setCache] = useState(value);

        const valueHistoryRef = useRef<string>(value);
        const commitHistoryRef = useRef<string>(value);

        useEffect(() => {
            setCache(value);
            valueHistoryRef.current = value;
            commitHistoryRef.current = value;
        }, [value]);

        const onValidateRef = useStable<typeof onValidate>(onValidate);

        const validatorRef = useRef<ValidationHandler | undefined>(validator);
        useEffect(() => {
            validatorRef.current = validator;
        }, [validator]);

        useEffect(() => {
            return () => {
                validatorRef.current?.onDismount();
            };
        }, []);
        const [isInvalid, setIsInvalid] = useState(false);

        const isFocus = useUi.focusContainer(wrapperRef, disabled);

        const doValidate = useCallback(
            (cur: string) => {
                const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
                if (required && cur === "") {
                    reasons.add({ code: "MISSING", message: "must contain a value" });
                }
                if (required && cur === "") {
                    reasons.add({ code: "MISSING", message: "must contain a value" });
                }
                if (min !== undefined && cur.length < min) {
                    reasons.add({ code: "LENGTH_UNDERFLOW", message: `must be at least ${min} characters` });
                }
                if (max !== undefined && cur.length > max) {
                    reasons.add({ code: "LENGTH_OVERFLOW", message: `must be no more than ${max} characters` });
                }
                if (pattern !== undefined && !pattern.test(cur)) {
                    reasons.add({ code: "PATTERN_MISMATCH", message: `must match pattern ${pattern.source}` });
                }
                validate?.(cur)?.forEach((e) => reasons.add(e));
                const ary = Array.from(reasons);
                onValidateRef.current?.(ary);
                validatorRef.current?.check(ary);
                setIsInvalid(ary.length !== 0);
                return ary;
            },
            [required, min, max, pattern, validate, onValidateRef]
        );

        const doValidateRef = useRef<typeof doValidate>(doValidate);
        useEffect(() => {
            doValidateRef.current = doValidate;
            if (inputRef.current) {
                const errors = doValidateRef.current(inputRef.current.value);
                setIsInvalid(errors.length !== 0);
            }
        }, [doValidate]);
        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.value = `${value}`;
                const errors = doValidateRef.current(`${value}`);
                setIsInvalid(errors.length !== 0);
            }
        }, [value]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doChange = useCallback(
            (val: string) => {
                const errors = doValidateRef.current(val);
                setCache(val);
                if (valueHistoryRef.current !== val) {
                    onValueRef.current?.(val);
                    if (errors.length === 0) {
                        onValidValueRef.current?.(val);
                    }
                }
            },
            [onValidValueRef, onValueRef]
        );

        const doCommit = useCallback(
            (val: string) => {
                const errors = doValidateRef.current(val);
                setCache(val);
                if (commitHistoryRef.current !== val) {
                    if (errors.length === 0) {
                        onValidCommitRef.current?.(val);
                        onValidValueRef.current?.(val);
                    }
                    onCommitRef.current?.(val);
                }
                if (valueHistoryRef.current !== val) {
                    onValueRef.current?.(val);
                    if (errors.length === 0) {
                        onValidValueRef.current?.(val);
                    }
                }
            },
            [onCommitRef, onValidCommitRef, onValueRef, onValidValueRef]
        );

        const handleChange = useCallback(
            (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                evt.stopPropagation();
                doChange(evt.target.value);
            },
            [doChange]
        );

        useEffect(() => {
            const el = inputRef.current;
            const n = wrapperRef.current;
            if (el && n) {
                const blur = (evt: FocusEvent) => {
                    if (!(evt.target as HTMLElement).contains(evt.relatedTarget as Node)) {
                        // console.log("Leaving Wrapper");
                        doCommit(el.value);
                        n.removeEventListener("focusout", blur);
                    }
                };

                const focus = (evt: FocusEvent) => {
                    if (!(evt.target as HTMLElement).contains(evt.relatedTarget as Node)) {
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
                .map((e) => (Boolean(e) ? `variant-${e}` : ""))
                .join(" ");

            if (disabled) {
                return `${className ?? ""} flavour-${flavour} ${vars} state-disabled`;
            }
            return [className ?? "", `flavour-${flavour}`, vars, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, disabled, flavour, variant, isFocus, isInvalid]);

        return (
            <div className={cN} ref={wrapperRef} tabIndex={disabled ? undefined : -1} title={tooltip}>
                <textarea
                    ref={inputRef}
                    className={"part-input"}
                    disabled={disabled}
                    tabIndex={disabled ? undefined : tabIndex}
                    placeholder={placeholder}
                    onChange={handleChange}
                    value={cache}
                    spellCheck={spellcheck ? "true" : "false"}
                />
            </div>
        );
    }
)`
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);
    align-items: center;

    & > .part-input {
        padding: calc(var(--padding) - var(--framing) - 1px);
        align-self: stretch;
        justify-self: stretch;
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-text);
    &:is(.state-focus) {
        border-color: var(--theme-area_focushover-border);
    }

    & > .part-input {
        color: var(--theme-area-text);
        background: none;
        resize: none;
        &::placeholder {
            color: var(--theme-placeholder);
        }
        &::selection {
            background: var(--theme-highlight);
        }
        caret-color: var(--theme-caret);
    }

    width: 24em;
    height: 8lh;
    &:is(.variant-full) {
        width: 100%;
        height: 32lh;
    }
    &:is(.variant-huge) {
        width: 64em;
        height: 24lh;
    }
    &:is(.variant-large) {
        width: 48em;
        height: 16lh;
    }
    &:is(.variant-medium) {
        width: 32em;
        height: 12lh;
    }
    &:is(.variant-small) {
        width: 24em;
        height: 8lh;
    }
    &:is(.variant-small) {
        width: 16em;
        height: 6lh;
    }
`;
