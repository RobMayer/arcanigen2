import { GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import Checkbox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";

const Controls = ({ value, setValue }: ItemControlProps<GridTrayParams>) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.gridbox.thickness", false);

    return (
        <>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Input label={"Cell Z"}>
                    <NumericInput value={value.cellZ} onValidValue={setValue("cellZ")} min={1} step={1} />
                </Input>
                <Sep />
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasWallThickness} onToggle={setValue("hasWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.wallThickness} onValidValue={setValue("wallThickness")} disabled={!value.hasWallThickness} />
                    </Input>
                    <Input label={"Bottom Thickness"}>
                        <Checkbox checked={value.hasBottomThickness} onToggle={setValue("hasBottomThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.bottomThickness} onValidValue={setValue("bottomThickness")} disabled={!value.hasBottomThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.gridbox.systemOverrides"} />
        </>
    );
};

const draw = (item: GridTrayParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const stackSize = convertLength(item.hasStackSize ? item.stackSize : globals.stackSize, "mm").value;

    const resBottomThickness = item.hasBottomThickness ? item.bottomThickness : globals.thickness;
    const resWallThickness = item.hasWallThickness ? item.wallThickness : globals.thickness;

    const bottomThickness = convertLength(resBottomThickness, "mm").value;
    const wallThickness = convertLength(resWallThickness, "mm").value;
    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;

    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;
    const stackTab = convertLength(item.hasStackTab ? item.stackTab : globals.stackTab, "mm").value;

    const calculatedParams = {
        cellX: item.cellX,
        cellY: item.cellY,
        cellZ: item.cellZ,
        gridSize,
        stackSize,
        stackTab,
        gridClearance,
        gridTab,
        wallThickness,
        bottomThickness,
        gridInset,
    };

    const shapes: Shape[] = [
        { name: "Bottom", thickness: resBottomThickness, ...drawBottom(calculatedParams) },
        { name: "Front", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Bottom", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Left", thickness: resWallThickness, ...drawSide(calculatedParams) },
        { name: "Right", thickness: resWallThickness, ...drawSide(calculatedParams) },
    ];

    return [
        {
            name: "Tray",
            copies: 1,
            shapes,
        },
    ];
};

export type GridTrayParams = {
    cellX: number;
    cellY: number;
    cellZ: number;

    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
    hasBottomThickness: boolean;
    bottomThickness: PhysicalLength;
} & SystemOverrides;

export const GridTrayDefinition: ItemDefinition<GridTrayParams> = {
    title: "Grid Tray",
    snippet: "A Tray that will fit a grid baseplate inside",
    draw,
    image: "tray.png",
    category: ItemCategories.GRID,
    Controls,
    getSummary: (p) => {
        return `GridTray ${p.cellX}x${p.cellY}x${p.cellZ}`;
    },
    getInitial: () => {
        return {
            cellX: 1,
            cellY: 1,
            cellZ: 2,

            hasWallThickness: false,
            wallThickness: { value: 0.125, unit: "in" },

            hasBottomThickness: false,
            bottomThickness: { value: 0.125, unit: "in" },
            ...initialSystemOverrides(),
        };
    },
};

const drawBottom = ({
    cellX,
    cellY,
    wallThickness,
    gridSize,
    gridClearance,
    gridTab,
}: {
    cellX: number;
    cellY: number;
    wallThickness: number;
    gridSize: number;
    gridClearance: number;
    gridTab: number;
}): { width: number; height: number; path: string } => {
    const width = gridSize * cellX + gridClearance * 2 + wallThickness * 2;
    const height = gridSize * cellY + gridClearance * 2 + wallThickness * 2;

    const path: string[] = [
        Draw.tabbedRect(width, height, {
            north: {
                count: cellX,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            east: {
                count: cellY,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            south: {
                count: cellX,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            west: {
                count: cellY,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
        }),
    ];

    return {
        width,
        height,
        path: path.join(" "),
    };
};

const drawEnd = ({
    cellX,
    cellZ,
    gridSize,
    stackSize,
    gridClearance,
    gridTab,
    stackTab,
    wallThickness,
    bottomThickness,
}: {
    cellX: number;
    cellZ: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridTab: number;
    stackTab: number;
    wallThickness: number;
    bottomThickness: number;
}): { width: number; height: number; path: string } => {
    const width = gridSize * cellX + gridClearance * 2 + wallThickness * 2;
    const height = stackSize * cellZ + bottomThickness;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            east: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: -wallThickness,
                // offset: -gridModeHeightAdjust / 2,
            },
            south: {
                width: gridTab,
                spacing: gridSize,
                count: cellX,
                depth: bottomThickness,
            },
            west: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: -wallThickness,
                // offset: gridModeHeightAdjust / 2,
            },
        }),
    };
};

const drawSide = ({
    cellY,
    cellZ,
    gridSize,
    stackSize,
    gridClearance,
    gridTab,
    stackTab,
    wallThickness,
    bottomThickness,
}: {
    cellY: number;
    cellZ: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridTab: number;
    stackTab: number;
    wallThickness: number;
    bottomThickness: number;
}): { width: number; height: number; path: string } => {
    const width = gridSize * cellY + gridClearance * 2 + wallThickness * 2;
    const height = stackSize * cellZ + bottomThickness;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: null,
            east: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: wallThickness,
                // offset: -gridModeHeightAdjust / 2,
            },
            south: {
                width: gridTab,
                spacing: gridSize,
                count: cellY,
                depth: bottomThickness,
            },
            west: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: wallThickness,
                // offset: gridModeHeightAdjust / 2,
            },
        }),
    };
};
