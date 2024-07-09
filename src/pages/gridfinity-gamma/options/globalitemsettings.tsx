import { ReactNode } from "react";
import CheckBox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import useUIState from "../../../utility/hooks/useUIState";
import { useGlobalSettings } from "../state";
import { FOOT_STYLE_OPTIONS } from "../types";
import { ControlPanel, Input, Sep } from "../widgets";
import Checkbox from "../../../components/buttons/Checkbox";

export const GlobalSystemSettings = () => {
    const [value, setValue] = useGlobalSettings();
    const [isGlobalOpen, setIsGlobalOpen] = useUIState("grinfinitygamma.items.global.system", false);

    return (
        <ControlledFoldout isOpen={isGlobalOpen} onToggle={setIsGlobalOpen} label={"Grid Settings"}>
            <ControlPanel>
                <Input label={"Grid Size"}>
                    <PhysicalLengthInput value={value.gridSize} onValidValue={setValue("gridSize")} />
                </Input>
                <Input label={"Grid Clearance"}>
                    <PhysicalLengthInput value={value.gridClearance} onValidValue={setValue("gridClearance")} />
                </Input>
                <Input label={"Grid Tab"}>
                    <PhysicalLengthInput value={value.gridTab} onValidValue={setValue("gridTab")} />
                </Input>
                <Sep />
                <Input label={"Stack Size"}>
                    <PhysicalLengthInput value={value.stackSize} onValidValue={setValue("stackSize")} />
                </Input>
                <Input label={"Stack Tab"}>
                    <PhysicalLengthInput value={value.stackTab} onValidValue={setValue("stackTab")} />
                </Input>
                <Sep />
                <Input label={"Thickness"}>
                    <PhysicalLengthInput value={value.thickness} onValidValue={setValue("thickness")} />
                </Input>
                <Input label={"Grid Inset"}>
                    <CheckBox checked={value.hasGridInset} onToggle={setValue("hasGridInset")} tooltip="Override Thickness?" />
                    <PhysicalLengthInput value={value.gridInset} onValidValue={setValue("gridInset")} disabled={!value.hasGridInset} />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};

export const GlobalFeetSettings = () => {
    const [value, setValue] = useGlobalSettings();
    const [isOpen, setIsOpen] = useUIState("grinfinitygamma.items.global.feet", false);

    return (
        <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Feet Settings"}>
            <ControlPanel>
                <Input label={"Foot Style"}>
                    <ToggleList options={FOOT_STYLE_OPTIONS} value={value.footStyle} direction={"vertical"} onSelect={setValue("footStyle")} />
                </Input>
                <Input label={"Foot Clearance"}>
                    <PhysicalLengthInput value={value.footClearance} onValidValue={setValue("footClearance")} />
                </Input>
                <Input label={"Foot Depth"}>
                    <CheckBox checked={value.hasFootDepth} onToggle={setValue("hasFootDepth")} tooltip="Override Thickness?" />
                    <PhysicalLengthInput value={value.footDepth} onValidValue={setValue("footDepth")} disabled={!value.hasFootDepth} />
                </Input>
                <Input label={"Runner Width"}>
                    <CheckBox checked={value.hasFootRunnerWidth} onToggle={setValue("hasFootRunnerWidth")} tooltip="Override Thickness?" />
                    <PhysicalLengthInput value={value.footRunnerWidth} onValidValue={setValue("footRunnerWidth")} disabled={!value.hasFootRunnerWidth} />
                </Input>
                <Input label={"Runner Gap"}>
                    <PhysicalLengthInput value={value.footRunnerGap} onValidValue={setValue("footRunnerGap")} />
                </Input>
                <Input label={"Runner Tab"}>
                    <PhysicalLengthInput value={value.footRunnerTab} onValidValue={setValue("footRunnerTab")} />
                </Input>
                <Input label={"Bracket Width"}>
                    <PhysicalLengthInput value={value.footBracketWidth} onValidValue={setValue("footBracketWidth")} />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};

export const GlobalLayoutSettings = () => {
    const [value, setValue] = useGlobalSettings();
    const [isOpen, setIsOpen] = useUIState("grinfinitygamma.items.global.layout", false);

    return (
        <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Layout Settings"}>
            <ControlPanel>
                <Input label={"Margin"}>
                    <PhysicalLengthInput value={value.layoutMargin} onValidValue={setValue("layoutMargin")} />
                </Input>
                <Input label={"Spacing"}>
                    <PhysicalLengthInput value={value.layoutSpacing} onValidValue={setValue("layoutSpacing")} />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};
