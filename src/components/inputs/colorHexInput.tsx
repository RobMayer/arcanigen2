import { colorToHTML, colorToHex, hexToColor } from "!/utility/mathhelper";
import { Color } from "!/utility/types/units";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useStable } from "../../utility/hooks/useStable";
import { ValidationHandler } from "../validation";
import { Flavour } from "..";
import { useUi } from "../useUI";
import { Icon, IconDefinition } from "../icons";
import { iconBlank } from "../icons/blank";

// ^(#+([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6,8})|none)$
const RGB_REGEX = /^(#+([a-fA-F0-9]{3}|[a-fA-F0-9]{6}))$/;
const RGBA_REGEX = /^(#+([a-fA-F0-9]{3,6}|[a-fA-F0-9]{6,8}))$/;

type HexColorInputProps = {
    className?: string;
    value: Color;
    onValue?: (v: Color) => void;
    onValidValue?: (v: Color) => void;
    onCommit?: (v: Color) => void;
    onValidCommit?: (v: Color) => void;
    validate?: (v: Color) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    validator?: ValidationHandler;
    disabled?: boolean;
    alpha?: boolean;
    placeholder?: string;
    flavour?: Flavour;
    variant?: string;
    nullable?: boolean;
    icon?: IconDefinition;
    tooltip?: string;
};

const HexColorInput = styled(
    ({
        className,
        flavour = "accent",
        variant,
        disabled,
        value,
        alpha,
        validator,
        nullable,
        onValidate,
        validate,
        onValue,
        onCommit,
        onValidCommit,
        onValidValue,
        icon,
        tooltip,
    }: HexColorInputProps) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [isFocus] = useUi.focus(inputRef, disabled);
        const [isInvalid, setIsInvalid] = useState(false);

        const onValidateRef = useStable<typeof onValidate>(onValidate);

        const [strCache, setStrCache] = useState<string>(() => {
            const c = colorToHex(value);
            if (c === "none") {
                return "none";
            }
            return alpha ? c : c.substring(0, c.length - 2);
        });

        const valueRef = useRef<Color>(value);

        const validatorRef = useStable<ValidationHandler | undefined>(validator);

        const isIncomingColor = useCallback(
            (cur: string) => {
                return (cur === "none" && nullable) || cur.match(RGBA_REGEX);
            },
            [nullable]
        );

        const isColor = useCallback(
            (cur: string) => {
                return (cur === "none" && nullable) || cur.match(alpha ? RGBA_REGEX : RGB_REGEX);
            },
            [nullable, alpha]
        );

        const doValidate = useCallback(
            (cur: string) => {
                const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
                if (isColor(cur)) {
                    const theColor = hexToColor(cur);
                    validate?.(theColor).forEach((e) => reasons.add(e));
                } else {
                    reasons.add({ code: "BAD_INPUT", message: "must be a color" });
                }
                const ary = Array.from(reasons);
                onValidateRef.current?.(ary);
                validatorRef.current?.check(ary);
                setIsInvalid(ary.length !== 0);
                return ary;
            },
            [onValidateRef, validate, validatorRef, isColor]
        );

        const doValidateRef = useStable<typeof doValidate>(doValidate);
        useEffect(() => {
            doValidate(strCache);
        }, [doValidate, strCache]);

        const formatInput = useCallback(
            (cur: string) => {
                if (nullable && (cur === "" || cur.toLowerCase() === "none")) {
                    setStrCache("none");
                } else if (isIncomingColor(cur)) {
                    const r = colorToHex(hexToColor(cur));
                    const nR = alpha ? r : r.substring(0, r.length - 2);
                    setStrCache(nR);
                } else {
                    setStrCache(cur);
                }
            },
            [alpha, nullable, isIncomingColor]
        );

        useEffect(() => {
            if (valueRef.current !== value) {
                if (
                    valueRef.current === null ||
                    value === null ||
                    valueRef.current === undefined ||
                    value === undefined ||
                    valueRef.current.r !== value.r ||
                    valueRef.current.g !== value.g ||
                    valueRef.current.b !== value.b ||
                    valueRef.current.a !== value.a
                ) {
                    const c = colorToHex(value);
                    valueRef.current = value;
                    formatInput(c);
                }
            }
        }, [formatInput, value]);

        useEffect(() => {
            const r = validatorRef.current;
            return () => {
                r?.onDismount();
            };
        }, [validatorRef]);

        const onValueRef = useStable<typeof onValue>(onValue);
        const onCommitRef = useStable<typeof onCommit>(onCommit);
        const onValidValueRef = useStable<typeof onValidValue>(onValidValue);
        const onValidCommitRef = useStable<typeof onValidCommit>(onValidCommit);

        const doChange = useCallback(
            (val: string) => {
                setStrCache(val);
                if (isColor(val)) {
                    const errors = doValidateRef.current(val);
                    const c = hexToColor(val);
                    valueRef.current = c;
                    onValueRef.current?.(c);
                    if (errors.length === 0) {
                        onValidValueRef.current?.(c);
                    }
                }
            },
            [onValueRef, doValidateRef, isColor, onValidValueRef]
        );

        const doCommit = useCallback(
            (val: string) => {
                if (isColor(val)) {
                    const errors = doValidateRef.current(val);
                    const c = hexToColor(val);
                    formatInput(val);
                    onCommitRef.current?.(c);
                    if (errors.length === 0) {
                        onValidCommitRef.current?.(c);
                    }
                }
            },
            [doValidateRef, isColor, onCommitRef, onValidCommitRef, formatInput]
        );

        const handleChange = useCallback(
            (evt: React.ChangeEvent<HTMLInputElement>) => {
                evt.stopPropagation();
                const el = evt.target;
                doChange(el.value);
            },
            [doChange]
        );

        useEffect(() => {
            const el = inputRef.current;
            const n = wrapperRef.current;
            if (el && n) {
                const blur = (evt: FocusEvent) => {
                    if (!(evt.target as HTMLElement).contains(evt.relatedTarget as Node)) {
                        doCommit(el.value);
                        n.removeEventListener("focusout", blur);
                    }
                };

                const focus = (evt: FocusEvent) => {
                    if (!(evt.target as HTMLElement).contains(evt.relatedTarget as Node)) {
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
        }, [className, flavour, disabled, variant, isFocus, isInvalid]);

        return (
            <div className={cN} ref={wrapperRef} title={tooltip}>
                {icon && (
                    <div className={"part-icon"}>
                        <Icon value={icon} />
                    </div>
                )}
                <Swatch className={"part-swatch"} value={value} />
                <input
                    type="text"
                    ref={inputRef}
                    className={"part-input"}
                    pattern={"^(#+([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6,8})|none)$"}
                    disabled={disabled}
                    value={strCache}
                    onChange={handleChange}
                    spellCheck={"false"}
                />
            </div>
        );
    }
)`
    width: auto;
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);

    grid-template-columns: auto 1fr auto;
    &:has(.part-icon) {
        grid-template-columns: auto auto 1fr auto;
    }

    & > .part-icon,
    & > .part-clear {
        flex: 0 0 auto;
        padding-inline: calc(var(--padding) - var(--framing) - 1px);
        align-self: center;
    }
    & > .part-swatch {
        flex: 0 0 auto;
        padding: calc(var(--padding) - var(--framing) - 1px);
        aspect-ratio: 1;
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
        color: inherit;
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
        padding: calc(0.125em - 1px);
    }

    & > .part-clear {
        color: var(--theme-link);
        padding: calc(0.125em - 1px);
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

export default HexColorInput;

const Swatch = styled(({ value, className }: { value: Color; className?: string }) => {
    const style = useMemo(
        () => ({
            backgroundColor: colorToHTML(value) ?? "transparent",
        }),
        [value]
    );
    return (
        <div className={className} style={style}>
            <Icon value={iconBlank} />
        </div>
    );
})`
    outline-offset: -1px;
    outline: 1px solid #fff4;
`;
