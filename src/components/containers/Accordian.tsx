import lodash from "lodash";
import { ReactNode, HTMLAttributes, ComponentType, useState, useCallback, useEffect, MouseEvent, Children, isValidElement, Fragment, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import Button from "../buttons/Button";
import { Icon } from "../icons";
import { iconCaretDown } from "../icons/caret/down";
import { iconBlank } from "../icons/blank";
import { iconCaretRight } from "../icons/caret/right";

const Option = ({ children }: { id: string; label: ReactNode; options?: ReactNode; children?: ReactNode; disabled?: boolean; flavour?: Flavour }) => {
    return <>{children}</>;
};

type AccordianBarProps = {
    option: string;
    selected?: boolean;
    disabled?: boolean;
    onToggle: (k: string) => void;
    children?: ReactNode;
    flavour?: Flavour;
    className?: string;
    title?: string;
    direction?: "horizontal" | "vertical";
};

type IProps = {
    onChange?: (id: string[] | null) => void;
    bar?: ComponentType<AccordianBarProps>;
    direction?: "horizontal" | "vertical";
    disabled?: boolean;
} & (
    | {
          singleton: true;
          value?: string;
      }
    | { singleton?: false; value?: string[] }
);

const AccordianSet = styled(
    ({ value, children, onChange, bar: Bar = AccordianBars.Typical, className, direction = "horizontal", singleton = false, disabled = false, ...props }: IProps & HTMLAttributes<HTMLDivElement>) => {
        const [selected, setSelected] = useState<string[]>(value === undefined ? [] : Array.isArray(value) ? value : [value]);

        const handleChange = useCallback(
            (newVal: string) => {
                if (singleton) {
                    setSelected(selected[0] === newVal ? [] : [newVal]);
                    onChange && onChange(selected[0] === newVal ? [] : [newVal]);
                } else {
                    const v = selected.includes(newVal) ? selected.filter((p) => p !== newVal) : [...selected, newVal];
                    setSelected(v);
                    onChange && onChange(v);
                }
            },
            [singleton, selected, onChange]
        );

        useEffect(() => {
            setSelected((p) => {
                if (lodash.xor(p, value ?? []).length > 0 && value !== undefined) {
                    const t = Array.isArray(value) ? value : [value];
                    return t;
                }
                return p;
            });
        }, [value]);

        return (
            <div {...props} className={`${className ?? ""} direction-${direction}`}>
                {Children.toArray(children).map((child, i) => {
                    if (isValidElement(child)) {
                        const { disabled: childDisabled, id, flavour, label, title, ...childProps } = child.props;
                        const isActive = selected.includes(id);
                        return (
                            <Fragment key={id}>
                                <Bar option={id} direction={direction} onToggle={handleChange} selected={isActive} flavour={flavour} disabled={childDisabled || disabled} title={title}>
                                    {label}
                                </Bar>
                                {isActive && (
                                    <Body>
                                        <div {...childProps} />
                                    </Body>
                                )}
                            </Fragment>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }
)`
    display: flex;
    flex-direction: column;
    align-self: stretch;
    inline-size: 100%;
    &.direction-vertical {
        writing-mode: vertical-lr;
    }
`;

const AccordianBars = {
    Typical: styled(({ option, flavour = "accent", selected, onToggle, children, title, className, direction, ...props }: AccordianBarProps) => {
        const handleChange = useCallback(
            (e: MouseEvent<HTMLDivElement>) => {
                onToggle && onToggle(option);
            },
            [option, onToggle]
        );

        const dirIcon = useMemo(() => {
            if ((direction === "horizontal" && selected) || (direction === "vertical" && !selected)) {
                return iconCaretDown;
            }
            if ((direction === "vertical" && selected) || (direction === "horizontal" && !selected)) {
                return iconCaretRight;
            }
            return iconBlank;
        }, [selected, direction]);

        return (
            <Button {...props} className={`${className ?? ""} state-${selected ? "open" : "closed"} flavour-${flavour}`} onClick={handleChange} title={title}>
                <Icon value={dirIcon} />
                <div>{children}</div>
            </Button>
        );
    })`
        text-align: start;
        align-items: center;
        color: var(--flavour-button-text);
        background: var(--flavour-button);
        border: 1px solid var(--effect-border-reduced);
        display: grid;
        grid-template-columns: auto 1fr;

        &:is(:focus-visible:not(.state-inactive)):not(.state-disabled),
        &:is(:hover:not(.state-inactive)):not(.state-disabled) {
            color: var(--flavour-button-text-highlight);
            background: var(--flavour-button-highlight);
        }
        &.state-disabled {
            background: var(--disabled-button);
            color: var(--disabled-button-text);
        }
    `,
};

const Body = styled.div`
    overflow-y: auto;
    flex: 1 0 0%;
    writing-mode: horizontal-tb;
`;

type Exportable = typeof AccordianSet & { Option: typeof Option };

const Accordian = AccordianSet as Exportable;
Accordian.Option = Option;

export default Accordian;
