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
                <Input label={"Baseplate Padding"}>
                    <Checkbox checked={value.includeBaseplate} onToggle={setValue("includeBaseplate")}>
                        Leave Room for Baseplate
                    </Checkbox>
                </Input>
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
                    <Input label={"Grid Thickness"}>
                        <Checkbox checked={value.hasGridThickness} onToggle={setValue("hasGridThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.gridThickness} onValidValue={setValue("gridThickness")} disabled={!value.hasGridThickness} />
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
    const gridThickness = item.includeBaseplate ? convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value : 0;
    // const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;

    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;
    const stackTab = convertLength(item.hasStackTab ? item.stackTab : globals.stackTab, "mm").value;

    const sizeX = gridSize * item.cellX + wallThickness * 2 + gridClearance * 2;
    const sizeY = gridSize * item.cellY + wallThickness * 2 + gridClearance * 2;
    const sizeZ = stackSize * item.cellZ + bottomThickness + gridThickness;

    const calculatedParams = {
        topSquat: 0,
        bottomThickness,
        wallThickness,

        sizeX,
        tabXCount: item.cellX,
        tabXSize: gridTab,
        tabXSpacing: gridSize,

        sizeY,
        tabYCount: item.cellY,
        tabYSize: gridTab,
        tabYSpacing: gridSize,

        sizeZ,
        tabZCount: item.cellZ,
        tabZSize: stackTab,
        tabZSpacing: stackSize,
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
    includeBaseplate: boolean;

    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
    hasBottomThickness: boolean;
    bottomThickness: PhysicalLength;

    hasGridThickness: boolean;
    gridThickness: PhysicalLength;
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
            includeBaseplate: true,

            hasWallThickness: false,
            wallThickness: { value: 0.125, unit: "in" },
            hasGridThickness: false,
            gridThickness: { value: 0.125, unit: "in" },

            hasBottomThickness: false,
            bottomThickness: { value: 0.125, unit: "in" },
            ...initialSystemOverrides(),
        };
    },
};

const drawBottom = ({
    sizeX,
    tabXCount,
    tabXSize,
    tabXSpacing,
    sizeY,
    tabYCount,
    tabYSize,
    tabYSpacing,
    wallThickness,
}: {
    sizeX: number;
    tabXSize: number;
    tabXCount: number;
    tabXSpacing: number;
    sizeY: number;
    tabYSize: number;
    tabYCount: number;
    tabYSpacing: number;
    wallThickness: number;
}): { width: number; height: number; path: string } => {
    const width = sizeX;
    const height = sizeY;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: -wallThickness,
                width: tabXSize,
            },
            east: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: -wallThickness,
                width: tabYSize,
            },
            south: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: -wallThickness,
                width: tabXSize,
            },
            west: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: -wallThickness,
                width: tabYSize,
            },
        }),
    };
};

const drawEnd = ({
    sizeX,
    tabXCount,
    tabXSize,
    tabXSpacing,
    sizeZ,
    tabZCount,
    tabZSize,
    tabZSpacing,
    wallThickness,
    bottomThickness,
    topSquat,
}: {
    sizeX: number;
    tabXCount: number;
    tabXSize: number;
    tabXSpacing: number;
    sizeZ: number;
    tabZCount: number;
    tabZSize: number;
    tabZSpacing: number;
    wallThickness: number;
    bottomThickness: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [
        Draw.tabbedRect(sizeX, sizeZ - topSquat, {
            east: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: -wallThickness,
                offset: -topSquat / 2,
            },
            south: {
                width: tabXSize,
                spacing: tabXSpacing,
                count: tabXCount,
                depth: bottomThickness,
            },
            west: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: -wallThickness,
                offset: topSquat / 2,
            },
        }),
    ];

    return {
        width: sizeX,
        height: sizeZ - topSquat,
        path: path.join(" "),
    };
};

const drawSide = ({
    sizeY,
    tabYCount,
    tabYSize,
    tabYSpacing,
    sizeZ,
    tabZCount,
    tabZSize,
    tabZSpacing,
    wallThickness,
    bottomThickness,
    topSquat,
}: {
    sizeY: number;
    tabYCount: number;
    tabYSize: number;
    tabYSpacing: number;
    sizeZ: number;
    tabZCount: number;
    tabZSize: number;
    tabZSpacing: number;

    wallThickness: number;
    bottomThickness: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [];

    path.push(
        Draw.tabbedRect(sizeY, sizeZ - topSquat, {
            east: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: wallThickness,
                offset: -topSquat / 2,
            },
            south: {
                width: tabYSize,
                spacing: tabYSpacing,
                count: tabYCount,
                depth: bottomThickness,
            },
            west: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: wallThickness,
                offset: -topSquat / 2,
            },
        })
    );

    return {
        width: sizeY,
        height: sizeZ - topSquat,
        path: path.join(" "),
    };
};
