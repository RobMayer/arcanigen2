import Page from "!/components/content/Page";
import { HTMLAttributes, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ButtonsDemo } from "./demos/buttons";
import { InputDemo } from "./demos/inputs";
import { IconsDemo } from "./demos/icons";
import ActionButton from "../../components/buttons/ActionButton";
import { Route, Routes, useNavigate } from "react-router-dom";
import { SelectorsDemo } from "./demos/selectors";
import { useUi } from "../../components/useUI";
import { Flavour } from "../../components";
import { flavours } from "./util";
import CheckBox from "../../components/buttons/Checkbox";
import { Icon } from "../../components/icons";
import { iconActionFromDrive } from "../../components/icons/action/fromDrive";
import { iconActionCopy } from "../../components/icons/action/copy";
import { HeightTest } from "./heighttest";

const SandboxPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [invalid, setInvalid] = useState<boolean>(false);

    return (
        <Page {...props}>
            <div>
                <CheckBox checked={disabled} onToggle={setDisabled}>
                    Disabled
                </CheckBox>
                <CheckBox checked={invalid} onToggle={setInvalid}>
                    Invalid
                </CheckBox>
            </div>
            <div>
                <div>Meta</div>
                <TypeNav to={"/sandbox/theme"}>Theme</TypeNav>
                <TypeNav to={"/sandbox/height"}>Height</TypeNav>
            </div>
            <div>
                <div>Buttons:</div>
                <TypeNav to={"/sandbox/buttons/action"}>Action Buttons</TypeNav>
                <TypeNav to={"/sandbox/buttons/checks"}>Checks</TypeNav>
            </div>
            <div>
                <div>Selectors:</div>
                <TypeNav to={"/sandbox/selectors/togglelist"}>Toggle List</TypeNav>
                <TypeNav to={"/sandbox/selectors/radios"}>Radios</TypeNav>
                <TypeNav to={"/sandbox/selectors/dropdown"}>Dropdown</TypeNav>
            </div>
            <div>
                <div>Inputs:</div>
                <TypeNav to={"/sandbox/input/text"}>Text Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/numeric"}>Numeric Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/rotary"}>Rotary Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/color"}>Color Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/length"}>Length Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/slider"}>Slider Inputs</TypeNav>
                <TypeNav to={"/sandbox/input/area"}>Area Inputs</TypeNav>
            </div>
            <Routes>
                <Route path={"theme"} element={<ThemeDemo />} />
                <Route path={"height"} element={<HeightTest />} />
                <Route path={"buttons/*"} element={<ButtonsDemo disabled={disabled} />} />
                <Route path={"selectors/*"} element={<SelectorsDemo disabled={disabled} invalid={invalid} />} />
                <Route path={"input/*"} element={<InputDemo disabled={disabled} invalid={invalid} />} />
                <Route path={"icons"} element={<IconsDemo />} />
            </Routes>
        </Page>
    );
})`
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    align-content: start;
    grid-auto-rows: fit-content;
`;

export default SandboxPage;

const TypeNav = ({ to, className, children }: { to: string; className?: string; children?: ReactNode }) => {
    const navigate = useNavigate();

    const handleAction = useCallback(() => {
        navigate(to);
    }, [to, navigate]);

    return <ActionButton onAction={handleAction}>{children}</ActionButton>;
};

const ThemeDemo = () => {
    const [disabled, setDisabled] = useState<boolean>(false);

    return (
        <>
            <CheckBox checked={disabled} onToggle={setDisabled}>
                Disabled
            </CheckBox>
            {flavours.map((f) => {
                return (
                    <div key={f}>
                        <h2>{f}</h2>
                        <ThemeItem className={"button"} flavour={f} disabled={disabled}>
                            Button
                        </ThemeItem>
                        <ThemeItem className={"option"} flavour={f} disabled={disabled}>
                            Option
                        </ThemeItem>
                        <ThemeItem className={"option"} flavour={f} disabled={disabled} selected>
                            Selected Option
                        </ThemeItem>
                        <ThemeItem className={"link"} flavour={f} disabled={disabled}>
                            Link
                        </ThemeItem>
                        <ThemeItem className={"icon"} flavour={f} disabled={disabled}>
                            <Icon value={iconActionCopy} />
                        </ThemeItem>
                        <ThemeInput flavour={f} disabled={disabled} />
                        <ThemeIcon value={iconActionFromDrive} className={`flavour-${f}`} />
                    </div>
                );
            })}
        </>
    );
};

const NOP = () => {};

const ThemeIcon = styled(Icon)`
    color: var(--theme-icon);
`;

const ThemeItem = styled(
    ({ className, children, disabled = false, selected = false, flavour = "accent" }: { className?: string; children?: ReactNode; disabled?: boolean; selected?: boolean; flavour?: Flavour }) => {
        const ref = useRef<HTMLDivElement>(null);

        const isHover = useUi.hover(ref, disabled);
        const isActive = useUi.action(ref, NOP, disabled);
        const [isFocus, isFocusSoft, isFocusHard] = useUi.focus(ref, disabled);

        const cN = useMemo(() => {
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} state-disabled ${selected ? "state-selected" : ""}`;
            }
            return [
                className ?? "",
                `flavour-${flavour}`,
                selected ? "state-selected" : "",
                isHover ? "state-hover" : "state-away",
                isFocus ? "state-focus" : "",
                isFocusHard ? "state-hardfocus" : "",
                isFocusSoft ? "state-softfocus" : "",
                isActive ? "state-active" : "state-inactive",
            ].join(" ");
        }, [className, isFocus, isFocusHard, isFocusSoft, isActive, isHover, selected, disabled, flavour]);

        return (
            <div className={cN} ref={ref} tabIndex={disabled ? undefined : 0}>
                {children}
            </div>
        );
    }
)`
    display: inline-block;
    margin: 0.5em;

    &.button {
        cursor: var(--cursor-button);
        background-color: var(--theme-button-bg);
        border: 1px solid var(--theme-button-border);
        color: var(--theme-button-text);
        &:is(.state-hover),
        &:is(.state-hardfocus) {
            background-color: var(--theme-button_focushover-bg);
            border-color: var(--theme-button_focushover-border);
            color: var(--theme-button_focushover-text);
        }
        &:is(.state-active) {
            background-color: var(--theme-button_active-bg);
            border-color: var(--theme-button_active-border);
            color: var(--theme-button_active-text);
        }
    }

    &.option {
        cursor: var(--cursor-button);
        background-color: var(--theme-option-bg);
        border: 1px solid var(--theme-option-border);
        color: var(--theme-option-text);
        &:is(.state-hover),
        &:is(.state-hardfocus) {
            background-color: var(--theme-option_focushover-bg);
            border-color: var(--theme-option_focushover-border);
            color: var(--theme-option_focushover-text);
        }
        &:is(.state-active) {
            background-color: var(--theme-option_active-bg);
            border-color: var(--theme-option_active-border);
            color: var(--theme-option_active-text);
        }
        &:is(.state-selected) {
            background-color: var(--theme-option_selected-bg);
            border: 1px solid var(--theme-option_selected-border);
            color: var(--theme-option_selected-text);
            &:is(.state-hover),
            &:is(.state-hardfocus) {
                background-color: var(--theme-option_selected_focushover-bg);
                border-color: var(--theme-option_selected_focushover-border);
                color: var(--theme-option_selected_focushover-text);
            }
            &:is(.state-active) {
                background-color: var(--theme-option_selected_active-bg);
                border-color: var(--theme-option_selected_active-border);
                color: var(--theme-option_selected_active-text);
            }
        }
    }

    &.link {
        cursor: var(--cursor-link);
        color: var(--theme-link);
        text-decoration: underline;
        &:is(.state-hover),
        &:is(.state-hardfocus) {
            color: var(--theme-link_focushover);
        }
        &:is(.state-active) {
            color: var(--theme-link_active);
        }
    }

    &.icon {
        cursor: var(--cursor-link);
        color: var(--theme-link);
        &:is(.state-hover),
        &:is(.state-hardfocus) {
            color: var(--theme-link_focushover);
        }
        &:is(.state-active) {
            color: var(--theme-link_active);
        }
    }
`;

const ThemeInput = styled(
    ({ className, disabled = false, selected = false, flavour = "accent", invalid = false }: { className?: string; disabled?: boolean; selected?: boolean; flavour?: Flavour; invalid?: boolean }) => {
        const ref = useRef<HTMLInputElement>(null);
        const [isFocus] = useUi.focus(ref, disabled);

        const cN = useMemo(() => {
            if (disabled) {
                return `${className ?? ""} flavour-${flavour} state-disabled ${selected ? "state-selected" : ""}`;
            }
            return [className ?? "", `flavour-${flavour}`, selected ? "state-selected" : "", invalid ? "state-invalid" : "state-valid", isFocus ? "state-focus" : ""].join(" ");
        }, [className, disabled, flavour, invalid, isFocus, selected]);

        return <input className={cN} ref={ref} disabled={disabled} placeholder={"placeholder"} />;
    }
)`
    display: inline-block;
    margin: 0.5em;

    background-color: var(--theme-area-bg);
    color: var(--theme-area-text);
    border: 1px solid var(--theme-area-border);
    caret-color: var(--theme-caret);
    &::selection {
        background-color: var(--theme-highlight);
    }
    &::placeholder {
        color: var(--theme-placeholder);
    }

    &:is(.state-focus) {
        border-color: var(--theme-area_focushover-border);
    }
`;
