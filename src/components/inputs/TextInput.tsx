import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ValidationHandler } from "../validation";
import { useUi } from "../useUI";
import { Icon, IconDefinition } from "../icons";
import { iconActionClose } from "../icons/action/close";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";

type TextInputProps = {
    onValue?: (value: string) => void;
    onValidValue?: (value: string) => void;
    onCommit?: (value: string) => void;
    onValidCommit?: (value: string) => void;
    validate?: (value: string) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    value?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    icon?: IconDefinition;
    onClear?: (value: string) => void;
    validator?: ValidationHandler;
    flavour?: Flavour;
    variant?: string;
    tooltip?: string;
    spellcheck?: boolean;
};

export const TextInput = styled(
    ({
        onCommit,
        onValue,
        onValidValue,
        onValidCommit,
        className,
        validate,
        onValidate,
        value = "",
        min,
        max,
        pattern,
        disabled = false,
        required = false,
        placeholder,
        icon,
        onClear,
        validator,
        flavour = "accent",
        variant = "normal",
        tooltip,
        spellcheck = false,
    }: TextInputProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const [cache, setCache] = useState(value);

        useEffect(() => {
            setCache(value);
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
                onValueRef.current?.(val);
                if (errors.length === 0) {
                    onValidValueRef.current?.(val);
                }
            },
            [onValidValueRef, onValueRef]
        );

        const doCommit = useCallback(
            (val: string) => {
                const errors = doValidateRef.current(val);
                setCache(val);
                onCommitRef.current?.(val);
                if (errors.length === 0) {
                    onValidCommitRef.current?.(val);
                }
            },
            [onCommitRef, onValidCommitRef]
        );

        const handleClear = useCallback(() => {
            onClear?.("");
            inputRef.current?.focus();
        }, [onClear]);

        const handleChange = useCallback(
            (evt: React.ChangeEvent<HTMLInputElement>) => {
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
                    onChange={handleChange}
                    disabled={disabled}
                    tabIndex={disabled ? undefined : 0}
                    placeholder={placeholder}
                    spellCheck={spellcheck ? "true" : "false"}
                />
                {onClear && <ClearButton className={"part-clear"} onAction={handleClear} disabled={disabled || cache === ""} />}
            </div>
        );
    }
)`
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);
    align-items: center;

    grid-template-columns: 1fr;
    &:has(.part-icon) {
        grid-template-columns: auto 1fr;
    }
    &:has(.part-clear) {
        grid-template-columns: 1fr auto;
    }
    &:has(.part-clear):has(.part-icon) {
        grid-template-columns: auto 1fr auto;
    }

    & > .part-input {
        padding: calc(var(--padding) - var(--framing) - 1px);
        box-sizing: content-box;
    }

    & > .part-icon,
    & > .part-clear {
        flex: 0 0 auto;
        padding-inline: calc(var(--padding) - var(--framing) - 1px);
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-text);
    &:is(.state-focus) {
        border-color: var(--theme-area_focushover-border);
    }

    & > .part-input {
        color: var(--theme-area-text);
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
        <div className={cN} ref={ref} title={"Clear"} tabIndex={disabled ? undefined : -1}>
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
