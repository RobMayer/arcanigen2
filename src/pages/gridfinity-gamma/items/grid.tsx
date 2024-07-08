import { useMemo } from "react";
import CheckBox from "../../../components/buttons/Checkbox";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../helpers/overridehelper";
import { FootStyles, GlobalSettings, ItemControlProps, ItemDefinition, Shape } from "../types";
import { ControlPanel, Full, Input, Section, WarningBox } from "../widgets";
import { convertLength } from "../../../utility/mathhelper";
import { cutRect, drawArray, drawFootBlock, drawFootBracket, drawFootRunner, drawRect } from "../helpers/drawhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";

export type GridParams = {
    cellX: number;
    cellY: number;
    packFeet: boolean;

    hasGridThickness: boolean;
    gridThickness: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

const Controls = ({ value, globals, setValue }: ItemControlProps<GridParams>) => {
    const footDepth = convertLength(value.hasFootDepth ? value.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const footStyle = value.hasFootStyle ? value.footStyle : globals.footStyle;
    const footRunnerWidth = convertLength(value.hasFootRunnerWidth ? value.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const gridThickness = convertLength(value.hasGridThickness ? value.gridThickness : globals.thickness, "mm").value;

    const cannotPackFeet = gridThickness !== (footStyle === FootStyles.RUNNER ? footRunnerWidth : footDepth);

    const [isOpen, setIsOpen] = useUIState("gridfinity.tems.grid.thicknessOverrides", false);

    return (
        <>
            <Section>Grid</Section>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Input label={"Pack Feet"}>
                    <CheckBox checked={value.packFeet} onToggle={setValue("packFeet")}>
                        Fill grid holes with feet
                    </CheckBox>
                </Input>
                {cannotPackFeet && value.packFeet ? (
                    <Full>
                        <WarningBox>Cannot pack feet due to differing thicknesses</WarningBox>
                    </Full>
                ) : null}
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Grid Thickness"}>
                        <CheckBox checked={value.hasGridThickness} onToggle={setValue("hasGridThickness")} />
                        <PhysicalLengthInput value={value.gridThickness} onValidValue={setValue("gridThickness")} disabled={!value.hasGridThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.grid.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.grid.systemOverrides"} />
        </>
    );
};

const draw = (item: GridParams, globals: GlobalSettings): Shape[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const footDepth = convertLength(item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const gridThickness = convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;
    const footBracketWidth = convertLength(item.hasFootBracketWidth ? item.footBracketWidth : globals.footBracketWidth, "mm").value;
    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;

    const cannotPackFeet = gridThickness !== (footStyle === FootStyles.RUNNER ? footRunnerWidth : footDepth);

    const layoutSpacing = convertLength(globals.layoutSpacing, "mm").value;

    let feetShape = "";
    if (item.packFeet) {
        if (footStyle === FootStyles.BLOCK) {
            feetShape = drawFootBlock({ gridSize, gridInset, footClearance });
        }
        if (footStyle === FootStyles.RUNNER) {
            const count = Math.floor((gridSize - gridInset * 2 - footClearance * 2 - layoutSpacing * 2) / (footDepth + gridThickness));
            const spacing = (gridSize - gridInset * 2 - footClearance * 2) / count;
            feetShape = drawArray({ count: 1, spacing: 0 }, { count, spacing }, drawFootRunner({ footRunnerGap, footRunnerTab, footDepth, gridThickness }));
        }
        if (footStyle === FootStyles.BRACKET) {
            feetShape = drawFootBracket({ footBracketWidth }, convertLength(globals.layoutSpacing, "mm").value);
        }
    }

    return [
        {
            width: gridSize * item.cellX,
            height: gridSize * item.cellY,
            path: [
                drawRect(gridSize * item.cellX - gridClearance * 2, gridSize * item.cellY - gridClearance * 2),
                drawArray({ count: item.cellX, spacing: gridSize }, { count: item.cellY, spacing: gridSize }, cutRect(gridSize - gridInset * 2, gridSize - gridInset * 2)),
                cannotPackFeet ? "" : drawArray({ count: item.cellX, spacing: gridSize }, { count: item.cellY, spacing: gridSize }, feetShape),
            ].join(" "),
            name: "Grid",
            thickness: item.hasGridThickness ? item.gridThickness : globals.thickness,
        },
    ];
};

export const GridDefinition: ItemDefinition<GridParams> = {
    title: "Grid",
    description: "",
    draw,
    Controls,
    describe: (p) => {
        return `Grid (${p.cellX}x${p.cellY})`;
    },
    getInitial: () => {
        return {
            cellX: 3,
            cellY: 3,
            packFeet: true,
            hasGridThickness: false,
            gridThickness: { value: 0.125, unit: "in" },
            ...initialFootOverrides(),
            ...initialSystemOverrides(),
        };
    },
};
