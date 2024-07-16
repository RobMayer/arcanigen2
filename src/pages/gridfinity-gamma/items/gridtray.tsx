import { ItemCategories, ItemControls, ItemDefinition, ItemRenderer, Shape } from "../types";
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

const Controls: ItemControls<GridTrayParams> = ({ value, setValue }) => {
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

const render: ItemRenderer<GridTrayParams> = (item, globals) => {
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
        hasTop: false,
        topThickness: 0,

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
        { name: "Bottom", width: sizeX, height: sizeY, thickness: resBottomThickness, path: Draw.Box.bottom(calculatedParams) },
        { name: "Front", width: sizeX, height: sizeZ, thickness: resWallThickness, path: Draw.Box.end(calculatedParams) },
        { name: "Bottom", width: sizeX, height: sizeZ, thickness: resWallThickness, path: Draw.Box.end(calculatedParams) },
        { name: "Left", width: sizeY, height: sizeZ, thickness: resWallThickness, path: Draw.Box.side(calculatedParams) },
        { name: "Right", width: sizeY, height: sizeZ, thickness: resWallThickness, path: Draw.Box.side(calculatedParams) },
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
    render,
    image: "tray.png",
    category: ItemCategories.GRID,
    Controls,
    getSummary: (p) => {
        return `Grid Tray ${p.cellX}x${p.cellY}x${p.cellZ}`;
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
