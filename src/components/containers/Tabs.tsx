import { Children, HTMLAttributes, isValidElement, MouseEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import ActionButton from "../buttons/ActionButton";
import Button, { ButtonProps } from "../buttons/Button";

const Option = ({ children }: { id: string; label: ReactNode; options?: ReactNode; children?: ReactNode; disabled?: boolean; flavour?: Flavour }) => {
    return <>{children}</>;
};

type TabMenuItemProps = {
    tab: string;
    selected?: boolean;
    disabled?: boolean;
    handleChange: (k: string) => void;
    children?: ReactNode;
    flavour?: Flavour;
};

type IProps<T extends TabMenuItemProps> = Omit<T, keyof TabMenuItemProps> & {
    value?: string;
    onChange?: (id: string) => void;
    menuItem?: (p: T) => JSX.Element;
    fallback?: ReactNode;
    direction?: "horizontal" | "vertical";
    children?: ReactNode;
};

const Tabset = <T extends TabMenuItemProps>({
    value = "",
    children,
    onChange,
    menuItem: MenuItem = TabMenuItems.Typical as (p: T) => JSX.Element,
    fallback,
    direction = "horizontal",
    ...rest
}: IProps<T>) => {
    const [selected, setSelected] = useState<string | null>(value === "" ? null : value);

    const handleChange = useCallback(
        (newVal: string) => {
            setSelected(newVal);
            onChange && onChange(newVal);
        },
        [onChange]
    );

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const { active, items } = useMemo(() => {
        const m: ({ key: string } & Omit<TabMenuItemProps, "handleChange" | "tab" | "className">)[] = [];
        let a: ReactNode = null;

        Children.toArray(children).forEach((child, i) => {
            if (isValidElement(child) && child.type === Option) {
                const isActive = selected === child.props.id || (selected === null && a === null && fallback === undefined);
                if (isActive) {
                    a = child;
                }
                m.push({
                    key: child.props.id,
                    selected: isActive,
                    children: child.props.label,
                    disabled: child.props.disabled,
                    flavour: child.props.flavour,
                });
            }
        });
        return { active: a, items: m };
    }, [children, selected, fallback]);

    return (
        <Outer className={`direction-${direction}`}>
            <Menu>
                {items.map((a) => (
                    <MenuItem key={a.key} disabled={a.disabled} {...((rest ?? {}) as T)} tab={a.key} selected={a.selected} handleChange={handleChange}>
                        {a.children}
                    </MenuItem>
                ))}
            </Menu>
            <Body>{active ?? fallback}</Body>
        </Outer>
    );
};
const Outer = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto;
    &.direction-vertical {
        grid-template-rows: auto;
        grid-template-columns: auto 1fr;
    }
`;

const Menu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />;
})`
    display: flex;
    background: var(--layer-dn);
    align-items: center;
    --local-spacing: 0.5em;
    &.slim {
        --local-spacing: 0.25em;
    }
    gap: var(--local-spacing);
    padding: var(--local-spacing);
    .direction-vertical > & {
        flex-direction: column;
        align-items: stretch;
        overflow-y: auto;
    }
`;

const Body = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />;
})`
    overflow-y: auto;
`;

export const TabMenuItems = {
    ActionButton: styled(({ tab, flavour, selected, onClick, handleChange, ...props }: TabMenuItemProps & ButtonProps) => {
        const handleClick = useCallback(() => {
            handleChange(tab);
        }, [tab, handleChange]);
        return <ActionButton {...props} onAction={handleClick} flavour={flavour} />;
    })``,
    Typical: styled(({ tab, flavour = "accent", className, selected, onClick, handleChange, ...props }: TabMenuItemProps & ButtonProps) => {
        const handleClick = useCallback(
            (e: MouseEvent<HTMLDivElement>) => {
                handleChange(tab);
                onClick && onClick(e);
            },
            [onClick, tab, handleChange]
        );
        return <Button {...props} onClick={handleClick} className={`${className ?? ""} flavour-${flavour} ${selected ? "state-selected" : ""}`} />;
    })`
        align-self: end;
        display: inline-block;
        color: var(--flavour-button-text);
        background: var(--flavour-button-muted);
        border: 2px solid transparent;
        border-width: 0;
        border-bottom-width: 2px;
        padding: 0.25em 0.5em;
        margin: 0;
        margin-bottom: calc(-1 * var(--local-spacing));
        padding-bottom: calc(0.25em - 2px);
        &:is(:focus-visible):not(.state-disabled),
        &:is(:hover):not(.state-disabled) {
            color: var(--flavour-button-text-highlight);
            background: var(--flavour-button);
        }
        &:is(.state-selected) {
            border-color: var(--effect-border-overlight);
            background: var(--flavour-button);
        }
        &:is(.state-selected:focus-visible):not(.state-disabled),
        &:is(.state-selected:hover):not(.state-disabled) {
            background: var(--flavour-button-highlight);
        }
        &.state-disabled {
            background: var(--disabled-button-muted);
            color: var(--disabled-button-text);
        }
        .direction-vertical > div > & {
            margin: 0;
            align-self: stretch;
            border-width: 0;
            border-right-width: 2px;
            padding: 0.25em 0.5em;
        }
    `,
};

type Exportable = typeof Tabset & { Option: typeof Option };

const Tabs = Tabset as Exportable;
Tabs.Option = Option;

export default Tabs;
