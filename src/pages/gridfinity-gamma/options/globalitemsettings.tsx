import { ReactNode } from "react";
import CheckBox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import useUIState from "../../../utility/hooks/useUIState";
import { PickMethod, SortDirection, SortMethod, SplitMethod } from "../helpers/packhelper";
import { useGlobalSettings } from "../state";
import { FOOT_STYLE_OPTIONS } from "../types";
import { ControlPanel, Input, Sep } from "../widgets";

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

const PICK_METHOD_OPTIONS: { [key in PickMethod]: ReactNode } = {
    AREA: "More Area",
    LONG: "Longer Side",
    SHORT: "Shorter Side",
} as const;

const SORT_METHOD_OPTIONS: { [key in SortMethod]: ReactNode } = {
    AREA: "By Area",
    LONGEST: "By Longest Edge",
    SHORTEST: "By Shortest Edge",
    PERIMETER: "By Perimeter",
    SQUARENESS: "By Squareness",
} as const;

const SORT_ORDER_OPTIONS: { [key in SortDirection]: ReactNode } = {
    ASC: "Ascending",
    DESC: "Descending",
} as const;

const SPLIT_METHOD_OPTIONS: { [key in SplitMethod]: ReactNode } = {
    LONGEST: "Longest Edge",
    SHORTEST: "Shortest Edge",
    LONGEST_REMAIN: "Longest Edge Remaining",
    SHORTEST_REMAIN: "Shortest Edge Remaining",
} as const;

export const GlobalPackSettings = () => {
    const [value, setValue] = useGlobalSettings();
    const [isOpen, setIsOpen] = useUIState("grinfinitygamma.items.global.pack", false);

    return (
        <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Pack Settings"}>
            <ControlPanel>
                <Input label={"Shape Sort Method"}>
                    <ToggleList options={SORT_METHOD_OPTIONS} value={value.packSortMethod} onSelect={setValue("packSortMethod")} direction="vertical" />
                </Input>
                <Input label={"Shape Sort Direction"}>
                    <ToggleList options={SORT_ORDER_OPTIONS} value={value.packSortDirection} onSelect={setValue("packSortDirection")} direction="vertical" />
                </Input>
                <Input label={"Empty Space Split"}>
                    <ToggleList options={SPLIT_METHOD_OPTIONS} value={value.packSplitMethod} onSelect={setValue("packSplitMethod")} direction="vertical" />
                </Input>
                <Input label={"Empty Space Pick"}>
                    <ToggleList options={PICK_METHOD_OPTIONS} value={value.packPickMethod} onSelect={setValue("packPickMethod")} direction="vertical" />
                </Input>
            </ControlPanel>
        </ControlledFoldout>
    );
};
