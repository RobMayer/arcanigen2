import CheckBox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import { FootStyle, CurriedSetter, FOOT_STYLE_OPTIONS, FootStyles } from "../types";
import { ControlPanel, Input, Sep } from "../widgets";

export type FootOverrides = {
    hasFootStyle: boolean;
    footStyle: FootStyle;
    hasFootDepth: boolean;
    footDepth: PhysicalLength;

    hasFootRunnerWidth: boolean;
    footRunnerWidth: PhysicalLength;

    hasFootRunnerGap: boolean;
    footRunnerGap: PhysicalLength;
    hasFootRunnerTab: boolean;
    footRunnerTab: PhysicalLength;
    hasFootBracketWidth: boolean;
    footBracketWidth: PhysicalLength;
    hasFootClearance: boolean;
    footClearance: PhysicalLength;
};

export const FootOverrideControls = <T extends FootOverrides>({ value, setValue, foldout }: { value: T; setValue: CurriedSetter<T>; foldout: string }) => {
    const [isOpen, setIsOpen] = useUIState(foldout, false);
    return (
        <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Foot Overrides"}>
            <ControlPanel>
                <Input label={"Foot Style"}>
                    <CheckBox checked={value.hasFootStyle} onToggle={setValue("hasFootStyle")} tooltip={"Override Global Foot Style?"} />
                    <ToggleList options={FOOT_STYLE_OPTIONS} value={value.footStyle} direction={"vertical"} onSelect={setValue("footStyle")} disabled={!value.hasFootStyle} />
                </Input>
                <Input label={"Foot Clearance"}>
                    <CheckBox checked={value.hasFootClearance} onToggle={setValue("hasFootClearance")} tooltip={"Override Global Foot Clearance?"} />
                    <PhysicalLengthInput value={value.footClearance} onValidValue={setValue("footClearance")} disabled={!value.hasFootClearance} />
                </Input>
                <Input label={"Foot Depth"}>
                    <CheckBox checked={value.hasFootDepth} onToggle={setValue("hasFootDepth")} tooltip={"Override Global Foot Depth?"} />
                    <PhysicalLengthInput value={value.footDepth} onValidValue={setValue("footDepth")} disabled={!value.hasFootDepth} />
                </Input>
                <Input label={"Runner Width"}>
                    <CheckBox checked={value.hasFootRunnerWidth} onToggle={setValue("hasFootRunnerWidth")} tooltip="Override Thickness?" />
                    <PhysicalLengthInput value={value.footRunnerWidth} onValidValue={setValue("footRunnerWidth")} disabled={!value.hasFootRunnerWidth} />
                </Input>
                <Input label={"Runner Gap"}>
                    <CheckBox checked={value.hasFootRunnerGap} onToggle={setValue("hasFootRunnerGap")} tooltip="Override Global Runner Gap?" />
                    <PhysicalLengthInput value={value.footRunnerGap} onValidValue={setValue("footRunnerGap")} disabled={!value.hasFootRunnerGap} />
                </Input>
                <Input label={"Runner Tab"}>
                    <CheckBox checked={value.hasFootRunnerTab} onToggle={setValue("hasFootRunnerTab")} tooltip="Override Global Runner Tab?" />
                    <PhysicalLengthInput value={value.footRunnerTab} onValidValue={setValue("footRunnerTab")} disabled={!value.hasFootRunnerTab} />
                </Input>
                <Input label={"Bracket Width"}>
                    <CheckBox checked={value.hasFootBracketWidth} onToggle={setValue("hasFootBracketWidth")} tooltip="Override Global Foot Bracket Width?" />
                    <PhysicalLengthInput value={value.footBracketWidth} onValidValue={setValue("footBracketWidth")} disabled={!value.hasFootBracketWidth} />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};

export const initialFootOverrides = (): FootOverrides => ({
    hasFootStyle: false,
    footStyle: FootStyles.BLOCK,
    hasFootDepth: false,
    footDepth: { value: 0.125, unit: "in" },
    hasFootRunnerWidth: false,
    footRunnerWidth: { value: 0.125, unit: "in" },
    hasFootRunnerGap: false,
    footRunnerGap: { value: 12, unit: "mm" },
    hasFootRunnerTab: false,
    footRunnerTab: { value: 6, unit: "mm" },
    hasFootBracketWidth: false,
    footBracketWidth: { value: 6, unit: "mm" },
    hasFootClearance: false,
    footClearance: { value: 0.5, unit: "mm" },
});

export type SystemOverrides = {
    hasGridSize: boolean;
    gridSize: PhysicalLength;
    hasGridClearance: boolean;
    gridClearance: PhysicalLength;
    hasGridTab: boolean;
    gridTab: PhysicalLength;
    hasStackSize: boolean;
    stackSize: PhysicalLength;
    hasStackTab: boolean;
    stackTab: PhysicalLength;
    hasGridInset: boolean;
    gridInset: PhysicalLength;
};

export const initialSystemOverrides = (): SystemOverrides => ({
    hasGridSize: false,
    gridSize: { value: 48, unit: "mm" },
    hasGridClearance: false,
    gridClearance: { value: 0.25, unit: "mm" },
    hasGridTab: false,
    gridTab: { value: 12, unit: "mm" },
    hasStackSize: false,
    stackSize: { value: 24, unit: "mm" },
    hasStackTab: false,
    stackTab: { value: 6, unit: "mm" },
    hasGridInset: false,
    gridInset: { value: 0.125, unit: "in" },
});

export const SystemOverrideControls = <T extends SystemOverrides>({ value, setValue, foldout }: { value: T; setValue: CurriedSetter<T>; foldout: string }) => {
    const [isOpen, setIsOpen] = useUIState(foldout, false);
    return (
        <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"System Overrides"}>
            <ControlPanel>
                <Input label={"Grid Size"}>
                    <CheckBox checked={value.hasGridSize} onToggle={setValue("hasGridSize")} tooltip={"Override Global Grid Size?"} />
                    <PhysicalLengthInput value={value.gridSize} onValidValue={setValue("gridSize")} disabled={!value.hasGridSize} />
                </Input>
                <Input label={"Grid Clearance"}>
                    <CheckBox checked={value.hasGridClearance} onToggle={setValue("hasGridClearance")} tooltip={"Override Global Grid Clearance?"} />
                    <PhysicalLengthInput value={value.gridClearance} onValidValue={setValue("gridClearance")} disabled={!value.hasGridClearance} />
                </Input>
                <Input label={"Grid Tab"}>
                    <CheckBox checked={value.hasGridTab} onToggle={setValue("hasGridTab")} tooltip={"Override Global Grid Tab?"} />
                    <PhysicalLengthInput value={value.gridTab} onValidValue={setValue("gridTab")} disabled={!value.hasGridTab} />
                </Input>
                <Sep />
                <Input label={"Stack Size"}>
                    <CheckBox checked={value.hasStackSize} onToggle={setValue("hasStackSize")} tooltip="Override Gloabl Stack Tab?" />
                    <PhysicalLengthInput value={value.stackSize} onValidValue={setValue("stackSize")} disabled={!value.hasStackSize} />
                </Input>
                <Input label={"Stack Tab"}>
                    <CheckBox checked={value.hasStackTab} onToggle={setValue("hasStackTab")} tooltip="Override Global Stack Tab?" />
                    <PhysicalLengthInput value={value.stackTab} onValidValue={setValue("stackTab")} disabled={!value.hasStackTab} />
                </Input>
                <Input label={"Grid Inset"}>
                    <CheckBox checked={value.hasGridInset} onToggle={setValue("hasGridInset")} tooltip="Override Global Grid Inset?" />
                    <PhysicalLengthInput value={value.gridInset} onValidValue={setValue("gridInset")} disabled={!value.hasGridInset} />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};
