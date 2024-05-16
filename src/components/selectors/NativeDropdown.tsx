import { ChangeEvent, useCallback, useEffect, useState, useMemo, useRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { ValidationHandler } from "../validation";
import { useStable } from "../../utility/hooks/useStable";
import { useUi } from "../useUI";
import { Icon, IconDefinition } from "../icons";

type IProps<T extends Record<string, string>> = {
    options: T;
    onSelect?: (v: keyof T) => void | ((p: keyof T) => keyof T);
    onValidSelect?: (v: keyof T | ((p: keyof T) => keyof T)) => void;
    value?: keyof T;
    flavour?: Flavour;
    disabled?: boolean;
    tabIndex?: number;
    className?: string;
    validate?: (value: keyof T) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    validator?: ValidationHandler;
    icon?: IconDefinition;
    tooltip?: string;
};

const Root = styled.div`
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);
    width: auto;

    grid-template-columns: 1fr;
    &:has(.part-icon) {
        grid-template-columns: auto 1fr;
    }

    & > .part-icon {
        flex: 0 0 auto;
        padding-inline: calc(var(--padding) - var(--framing) - 1px);
        align-self: center;
    }

    & > .part-dropdown {
        padding: calc(var(--padding) - var(--framing) - 1px);
        font-size: inherit;
        display: block;
        line-height: 1lh;
        text-align: center;
        background: transparent;
        font-family: inherit;
        height: 1lh;
        box-sizing: content-box;
        text-align: start;
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-text);

    & > .part-dropdown {
        & > option {
            background: var(--theme-area-bg);
            color: var(--theme-area-text);
        }
    }

    &:is(.state-focus) {
        border-color: var(--theme-area_focushover-border);
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

const NativeDropdown = <T extends Record<string, string>>({
    options,
    value,
    onSelect,
    onValidSelect,
    className,
    flavour = "accent",
    disabled = false,
    validator,
    tabIndex = 0,
    validate,
    onValidate,
    icon,
    tooltip,
}: IProps<T>) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const onSelectRef = useStable<typeof onSelect>(onSelect);
    const onValidSelectRef = useStable<typeof onValidSelect>(onValidSelect);

    const [cache, setCache] = useState<keyof T>(value as keyof T);
    useEffect(() => {
        setCache(value as keyof T);
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

    const doValidate = useCallback(
        (cur: keyof T) => {
            const reasons: Set<{ code: string; message: string }> = new Set<{ code: string; message: string }>();
            validate?.(cur)?.forEach((e) => reasons.add(e));
            const ary = Array.from(reasons);
            onValidateRef.current?.(ary);
            validatorRef.current?.check(ary);
            setIsInvalid(ary.length !== 0);
            return ary;
        },
        [validate, onValidateRef]
    );
    const doValidateRef = useRef<typeof doValidate>(doValidate);

    useEffect(() => {
        doValidateRef.current = doValidate;
        if (cache) {
            const errors = doValidateRef.current(cache);
            setIsInvalid(errors.length !== 0);
        }
    }, [cache, doValidate]);

    const doChange = useCallback(
        (v: keyof T) => {
            setCache(v);
            onSelectRef.current?.(v);
            const errors = doValidateRef.current(v);
            if (errors.length === 0) {
                onValidSelectRef.current?.(v);
            }
        },
        [onSelectRef, onValidSelectRef]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            doChange(e.target.value);
        },
        [doChange]
    );

    const isFocus = useUi.focusContainer(wrapperRef);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} flavour-${flavour} state-disabled`;
        }
        return [className ?? "", `flavour-${flavour}`, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
    }, [className, flavour, disabled, isFocus, isInvalid]);

    return (
        <Root className={cN} tabIndex={-1} ref={wrapperRef} title={tooltip}>
            {icon && (
                <div className={"part-icon"}>
                    <Icon value={icon} />
                </div>
            )}
            <select className={"part-dropdown"} onChange={handleChange} disabled={disabled} value={cache as string} tabIndex={disabled ? undefined : tabIndex}>
                {Object.entries(options).map(([k, v]) => (
                    <option value={k} key={k}>
                        {v}
                    </option>
                ))}
            </select>
        </Root>
    );
};
export default NativeDropdown;
