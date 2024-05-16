import { useRef, useState, useEffect, useCallback, ChangeEvent, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";
import { PhysicalLength } from "../../utility/types/units";
import { Icon, IconDefinition } from "../icons";
import { useUi } from "../useUI";
import { ValidationHandler } from "../validation";

export type PhysicalLengthInputProps = {
    onCommit?: (value: PhysicalLength) => void;
    onValidCommit?: (value: PhysicalLength) => void;
    onValue?: (value: PhysicalLength) => void;
    onValidValue?: (value: PhysicalLength) => void;
    validate?: (value: PhysicalLength) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    value?: PhysicalLength;
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
    tooltip?: string;
};

type StrLength = {
    value: string;
    unit: PhysicalLength["unit"];
};

const DEFAULT_LENGTH: PhysicalLength = { value: 0, unit: "mm" };

export const PhysicalLengthInput = styled(
    ({
        onCommit,
        onValidCommit,
        onValue,
        onValidValue,
        className,
        validate,
        onValidate,
        value = DEFAULT_LENGTH,
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
        tooltip,
    }: PhysicalLengthInputProps) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const valInputRef = useRef<HTMLInputElement>(null);
        const unitInputRef = useRef<HTMLSelectElement>(null);
        const [cache, setCache] = useState<StrLength>({ value: `${value.value}`, unit: value.unit });
        const revertHistoryRef = useRef<number>(value?.value);

        useEffect(() => {
            setCache((p) => {
                if (Number(p.value) !== value.value || p.value !== `${value.value}`) {
                    return {
                        value: `${value.value}`,
                        unit: value.unit,
                    };
                }
                return {
                    value: p.value,
                    unit: value.unit,
                };
            });
            revertHistoryRef.current = value.value;
        }, [value.value, value.unit]);

        const [isValFocus] = useUi.focus(valInputRef, disabled);
        const [isUnitFocus] = useUi.focus(unitInputRef, disabled);
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
            ({ value, unit }: StrLength) => {
                const n = Number(value.replace(/,/g, ""));
                const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
                if (isNaN(n) || value === "") {
                    reasons.add({ code: "BAD_INPUT", message: "must be numeric" });
                } else {
                    validate?.({ value: Number(n), unit })?.forEach((e) => reasons.add(e));
                    if (max !== undefined && n > max) {
                        reasons.add({ code: "RANGE_OVERFLOW", message: `cannot be above ${max}` });
                    }
                    if (min !== undefined && n < min) {
                        reasons.add({ code: "RANGE_UNDERFLOW", message: `cannot be below ${min}` });
                    }
                    if (step !== 0 && n % step !== 0) {
                        reasons.add({ code: "STEP_MISMATCH", message: `must be a multiple of ${step}` });
                    }
                    validate?.({ value: n, unit })?.forEach((e) => reasons.add(e));
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
            doValidate(cache);
        }, [doValidate, cache]);

        const valRef = useRef<string>(`${value.value}`);
        const unitRef = useRef<PhysicalLength["unit"]>(value.unit);

        useEffect(() => {
            valRef.current = cache.value;
            unitRef.current = cache.unit;
        }, [cache.value, cache.unit]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doRevert = useCallback(() => {
            const revert = revertHistoryRef.current;
            setCache((p) => {
                return {
                    value: `${revert}`,
                    unit: p.unit,
                };
            });
        }, []);

        const doChange = useCallback(
            ({ value, unit }: StrLength) => {
                value = value.replace(/,/g, "");
                const errors = doValidateRef.current({ value, unit });
                const n = Number(value);
                setCache({ value, unit });
                if (!isNaN(n) && value !== "") {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
                    if (errors.length === 0) {
                        onValidValueRef.current?.({ value: nV, unit });
                    }
                    onValueRef.current?.({ value: nV, unit });
                }
            },
            [doValidateRef, onValidValueRef, onValueRef, precision]
        );

        const doCommit = useCallback(
            ({ value, unit }: StrLength) => {
                value = value.replace(/,/g, "");
                const reasons = doValidateRef.current({ value, unit });
                const n = Number(value);
                if (isNaN(n) || value === "") {
                    doRevert();
                } else {
                    const nV = precision === "none" ? n : Math.round(n * 10 ** precision) / 10 ** precision;
                    setCache({ value: `${nV}`, unit });
                    revertHistoryRef.current = nV;
                    onCommitRef.current?.({ value: nV, unit });
                    if (reasons.length === 0) {
                        onValidCommitRef.current?.({ value: nV, unit });
                    }
                }
            },
            [doRevert, doValidateRef, onCommitRef, precision, onValidCommitRef]
        );

        const handleValueChange = useCallback(
            (e: ChangeEvent<HTMLInputElement>) => {
                doChange({
                    unit: unitRef.current,
                    value: e.currentTarget.value,
                });
            },
            [doChange]
        );

        const handleUnitChange = useCallback(
            (e: ChangeEvent<HTMLSelectElement>) => {
                doChange({
                    value: valRef.current,
                    unit: e.target.value as PhysicalLength["unit"],
                });
                doCommit({
                    value: valRef.current,
                    unit: e.target.value as PhysicalLength["unit"],
                });
            },
            [doChange, doCommit]
        );

        useEffect(() => {
            const el = valInputRef.current;
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
                            doChange({
                                value: `${nValue}`,
                                unit: unitRef.current,
                            });
                            doCommit({
                                value: `${nValue}`,
                                unit: unitRef.current,
                            });
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
                            doChange({
                                value: `${nValue}`,
                                unit: unitRef.current,
                            });
                            doCommit({
                                value: `${nValue}`,
                                unit: unitRef.current,
                            });
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
            const el = valInputRef.current;
            const n = wrapperRef.current;
            if (el && n) {
                const blur = (evt: FocusEvent) => {
                    if (!(evt.currentTarget as HTMLElement).contains(evt.relatedTarget as Node)) {
                        // console.log("Leaving Wrapper");
                        doCommit({ value: el.value, unit: unitRef.current });
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
                        doCommit({ value: el.value, unit: unitRef.current });
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
            return [className ?? "", `flavour-${flavour}`, "state-enabled", isValFocus || isUnitFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, flavour, disabled, isValFocus, isUnitFocus, isInvalid]);

        return (
            <div className={cN} tabIndex={disabled ? undefined : -1} ref={wrapperRef} title={tooltip}>
                {icon && (
                    <div className={"part-icon"}>
                        <Icon value={icon} />
                    </div>
                )}
                <input
                    type={"text"}
                    ref={valInputRef}
                    className={`part-input ${isValFocus ? "state-focus" : ""}`}
                    value={cache.value}
                    onChange={handleValueChange}
                    disabled={disabled}
                    tabIndex={disabled ? undefined : 0}
                    placeholder={placeholder}
                    spellCheck={"false"}
                />
                <select ref={unitInputRef} className={`part-dropdown ${isUnitFocus ? "state-focus" : ""}`} disabled={disabled} value={cache.unit} onChange={handleUnitChange}>
                    <option value="in">in</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                </select>
            </div>
        );
    }
)`
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);

    grid-template-columns: 1fr auto;
    &:has(.part-icon) {
        grid-template-columns: auto 1fr auto;
    }

    & > .part-icon {
        flex: 0 0 auto;
        padding-inline: calc(var(--padding) - var(--framing) - 1px);
        align-self: center;
    }

    & > .part-input {
        padding: calc(var(--padding) - var(--framing) - 1px);
        text-align: center;
        outline-offset: -1px;
        outline: 1px solid transparent;
    }

    & > .part-dropdown {
        padding: calc(var(--padding) - var(--framing) - 1px);
        line-height: 1lh;
        text-align: center;
        outline: 1px solid transparent;
        outline-offset: -1px;
        background: transparent;
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
        &:is(.state-focus) {
            outline-color: var(--theme-area_focushover-border);
        }
    }

    & > .part-icon {
        color: var(--theme-icon);
    }

    & > .part-dropdown {
        color: inherit;
        & > option {
            background: var(--theme-area-bg);
            color: inherit;
        }
        &:is(.state-focus) {
            outline-color: var(--theme-area_focushover-border);
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
