import useKey from "@accessible/use-key";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import { useStable } from "../../utility/hooks/useStable";
import { useUi } from "../useUI";
import { ValidationHandler } from "../validation";

type ToggleListProps<T extends { [key: string]: ReactNode }> = {
    options: T;
    onSelect?: (v: keyof T | ((p: keyof T) => keyof T)) => void;
    onValidSelect?: (v: keyof T | ((p: keyof T) => keyof T)) => void;
    value?: string;
    flavour?: Flavour;
    disabled?: boolean;
    direction?: "horizontal" | "vertical";
    tabIndex?: number;
    className?: string;
    validate?: (value: keyof T) => { code: string; message: string }[];
    onValidate?: (reasons: { code: string; message: string }[]) => void;
    validator?: ValidationHandler;
};

const ToggleList = styled(
    <T extends Record<any, ReactNode>>({
        options,
        value,
        onSelect,
        flavour = "accent",
        disabled = false,
        className,
        tabIndex = 0,
        direction = "horizontal",
        onValidSelect,
        validate,
        onValidate,
        validator,
    }: ToggleListProps<T>) => {
        const wrapperRef = useRef<HTMLDivElement>(null);

        const [cache, setCache] = useState<keyof T>(value as keyof T);
        useEffect(() => {
            setCache(value as keyof T);
        }, [value]);

        const keys = useMemo(() => {
            return Object.keys(options) as (keyof T)[];
        }, [options]);

        const onSelectRef = useStable<typeof onSelect>(onSelect);
        const onValidSelectRef = useStable<typeof onValidSelect>(onValidSelect);

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

        useKey(wrapperRef, {
            ArrowDown: () => {
                if (direction === "vertical" && keys.indexOf(cache) !== keys.length - 1) {
                    doChange(keys[keys.indexOf(cache) + 1] as string);
                }
            },
            ArrowUp: () => {
                if (direction === "vertical" && keys.indexOf(cache) > 0) {
                    doChange(keys[keys.indexOf(cache) - 1] as string);
                }
            },

            ArrowRight: () => {
                if (direction === "horizontal" && keys.indexOf(cache) !== keys.length - 1) {
                    doChange(keys[keys.indexOf(cache) + 1] as string);
                }
            },
            ArrowLeft: () => {
                if (direction === "horizontal" && keys.indexOf(cache) > 0) {
                    doChange(keys[keys.indexOf(cache) - 1] as string);
                }
            },
            End: () => {
                doChange(keys[keys.length - 1] as string);
            },
            Home: () => {
                doChange(keys[0] as string);
            },
        });

        const isFocus = useUi.focusContainer(wrapperRef);

        const cN = useMemo(() => {
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} state-disabled direction-${direction}`;
            }
            return [className ?? "", `direction-${direction}`, `flavour-${flavour}`, "state-enabled", isFocus ? "state-focus" : "state-blur", isInvalid ? "state-invalid" : "state-valid"].join(" ");
        }, [className, flavour, disabled, isFocus, direction, isInvalid]);

        return (
            <div className={cN} tabIndex={disabled ? undefined : tabIndex} ref={wrapperRef}>
                {Object.entries(options).map(([k, v]) => {
                    return (
                        <Option key={k} selected={k === cache} value={k} select={doChange} disabled={disabled}>
                            {v}
                        </Option>
                    );
                })}
            </div>
        );
    }
)`
    width: auto;
    flex: 0 0 auto;
    display: inline-grid;
    padding: var(--framing);
    gap: var(--framing);

    &.direction-horizontal {
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
    }
    &.direction-vertical {
        grid-auto-flow: row;
        grid-auto-rows: 1fr;
    }
    align-items: center;
    justify-items: stretch;

    & > .part-option {
        cursor: var(--cursor-action);
        display: flex;
        justify-content: center;
        padding: calc(var(--padding) - var(--framing) - 2px) calc(var(--padding-extra) - var(--framing) - 2px);
    }

    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-color);

    &:is(.state-focus) {
        border: 1px solid var(--theme-area_focushover-border);
    }

    & > .part-option {
        background: var(--theme-option-bg);
        border: 1px solid var(--theme-option-border);
        color: var(--theme-option-text);

        &:is(.state-hover) {
            background: var(--theme-option_focushover-bg);
            border: 1px solid var(--theme-option_focushover-border);
            color: var(--theme-option_focushover-text);
        }

        &:is(.state-active) {
            background: var(--theme-option_active-bg);
            border: 1px solid var(--theme-option_active-border);
            color: var(--theme-option_active-text);
        }

        &:is(.state-selected) {
            background: var(--theme-option_selected-bg);
            border: 1px solid var(--theme-option_selected-border);
            color: var(--theme-option_selected-text);

            &:is(.state-hover) {
                background: var(--theme-option_selected_focushover-bg);
                border: 1px solid var(--theme-option_selected_focushover-border);
                color: var(--theme-option_selected_focushover-text);
            }

            &:is(.state-active) {
                background: var(--theme-option_selected_active-bg);
                border: 1px solid var(--theme-option_selected_active-border);
                color: var(--theme-option_selected_active-text);
            }
        }
    }
`;

export default ToggleList;

const Option = ({
    selected = false,
    select,
    value,
    disabled = false,
    children,
    className,
}: {
    selected: boolean;
    select: (v: string) => void;
    value: string;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
}) => {
    const handleClick = useCallback(() => {
        select(value);
    }, [value, select]);

    const ref = useRef<HTMLDivElement>(null);

    const isHover = useUi.hover(ref, disabled);
    const isActive = useUi.action(ref, handleClick, disabled);

    const cN = useMemo(() => {
        if (disabled) {
            return `${className ?? ""} part-option ${selected ? "state-selected" : ""} state-disabled`;
        }
        return ["part-option", className ?? "", isHover ? "state-hover" : "state-away", selected ? "state-selected" : "", isActive ? "state-active" : "state-inactive"].join(" ");
    }, [disabled, className, selected, isHover, isActive]);

    return (
        <div className={cN} ref={ref}>
            {children}
        </div>
    );
};
