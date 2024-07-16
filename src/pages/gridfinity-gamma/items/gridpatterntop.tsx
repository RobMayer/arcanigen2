import { ReactNode } from "react";
import Checkbox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import useUIState from "../../../utility/hooks/useUIState";
import { convertLength } from "../../../utility/mathhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { Enum, ItemCategories, ItemControls, ItemDefinition, ItemRenderer } from "../types";
import { Draw } from "../utility/drawhelper";
import { initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { ControlPanel, Input, Sep } from "../widgets";

const PatternShapes = {
    RECT: "RECT",
    CIRCLE: "CIRCLE",
    VHEX: "VHEX",
    HHEX: "HHEX",
} as const;

type PatternShape = Enum<typeof PatternShapes>;

const PATTERN_SHAPE_OPTIONS: { [key in PatternShape]: ReactNode } = {
    RECT: "Rectangle",
    CIRCLE: "Circle",
    VHEX: "Vertical Hexagon",
    HHEX: "Horizontal Hexagon",
};

const PatternModes = {
    COUNT: "COUNT",
    SPACING: "SPACING",
} as const;

type PatternMode = Enum<typeof PatternModes>;

const PATTERN_MODE_OPTIONS: { [key in PatternMode]: ReactNode } = {
    COUNT: "By Count",
    SPACING: "By Spacing",
};

const DiameterModes = {
    CIRCUMSCRIBE: "CIRCUMSCRIBE",
    INSCRIBE: "INSCRIBE",
} as const;

type DiameterMode = Enum<typeof DiameterModes>;

const DIAMETER_MODE_OPTIONS: { [key in DiameterMode]: ReactNode } = {
    CIRCUMSCRIBE: "Circumscribe",
    INSCRIBE: "Inscribe",
};

type GridPatternTopParams = {
    cellX: number;
    cellY: number;

    patternXMode: PatternMode;
    patternXCount: number;
    patternXSpacing: PhysicalLength;
    patternYMode: PatternMode;
    patternYCount: number;
    patternYSpacing: PhysicalLength;

    diameter: PhysicalLength;
    diameterMode: DiameterMode;
    width: PhysicalLength;
    height: PhysicalLength;

    patternShape: PatternShape;

    hasTopThickness: boolean;
    topThickness: PhysicalLength;
    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
} & SystemOverrides;

const Controls: ItemControls<GridPatternTopParams> = ({ value, setValue }) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.gridpatterntop.thickness", false);

    return (
        <>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Sep />
                <Input label={"Pattern Shape"}>
                    <ToggleList options={PATTERN_SHAPE_OPTIONS} value={value.patternShape} onSelect={setValue("patternShape")} direction={"vertical"} />
                </Input>
                {value.patternShape === PatternShapes.RECT ? (
                    <>
                        <Input label={"Width"}>
                            <PhysicalLengthInput value={value.width} onValidValue={setValue("width")} min={0} minExclusive />
                        </Input>
                        <Input label={"Height"}>
                            <PhysicalLengthInput value={value.height} onValidValue={setValue("height")} min={0} minExclusive />
                        </Input>
                    </>
                ) : null}
                {value.patternShape === PatternShapes.CIRCLE ? (
                    <>
                        <Input label={"Diameter"}>
                            <PhysicalLengthInput value={value.diameter} onValidValue={setValue("diameter")} min={0} minExclusive />
                        </Input>
                    </>
                ) : null}
                {value.patternShape === PatternShapes.HHEX || value.patternShape === PatternShapes.VHEX ? (
                    <>
                        <Input label={"Diameter"}>
                            <PhysicalLengthInput value={value.diameter} onValidValue={setValue("diameter")} min={0} minExclusive />
                        </Input>
                        <Input label={"Diameter Mode"}>
                            <ToggleList options={DIAMETER_MODE_OPTIONS} value={value.diameterMode} onSelect={setValue("diameterMode")} />
                        </Input>
                    </>
                ) : null}
                <Sep />
                <Input label={"X Layout Mode"}>
                    <ToggleList options={PATTERN_MODE_OPTIONS} value={value.patternXMode} onSelect={setValue("patternXMode")} />
                </Input>
                {value.patternXMode === PatternModes.COUNT ? (
                    <Input label={"X Count"}>
                        <NumericInput value={value.patternXCount} onValidValue={setValue("patternXCount")} min={1} />
                    </Input>
                ) : null}
                {value.patternXMode === PatternModes.SPACING ? (
                    <Input label={"X Spacing"}>
                        <PhysicalLengthInput value={value.patternXSpacing} onValidValue={setValue("patternXSpacing")} min={0} minExclusive />
                    </Input>
                ) : null}
                <Input label={"Y Layout Mode"}>
                    <ToggleList options={PATTERN_MODE_OPTIONS} value={value.patternYMode} onSelect={setValue("patternYMode")} />
                </Input>
                {value.patternYMode === PatternModes.COUNT ? (
                    <Input label={"Y Count"}>
                        <NumericInput value={value.patternYCount} onValidValue={setValue("patternYCount")} min={1} />
                    </Input>
                ) : null}
                {value.patternYMode === PatternModes.SPACING ? (
                    <Input label={"Y Spacing"}>
                        <PhysicalLengthInput value={value.patternYSpacing} onValidValue={setValue("patternYSpacing")} min={0} minExclusive />
                    </Input>
                ) : null}
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Top Thickness"}>
                        <Checkbox checked={value.hasTopThickness} onToggle={setValue("hasTopThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.topThickness} onValidValue={setValue("topThickness")} disabled={!value.hasTopThickness} />
                    </Input>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasWallThickness} onToggle={setValue("hasWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.wallThickness} onValidValue={setValue("wallThickness")} disabled={!value.hasWallThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.gridpatterntop.systemOverrides"} />
        </>
    );
};

const render: ItemRenderer<GridPatternTopParams> = (item, globals) => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;

    const resTopThickness = item.hasTopThickness ? item.topThickness : globals.thickness;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;

    const overallWidth = gridSize * item.cellX - gridClearance * 2;
    const overallHeight = gridSize * item.cellY - gridClearance * 2;

    const wallThickness = convertLength(item.hasWallThickness ? item.wallThickness : globals.thickness, "mm").value;

    const top = Draw.Box.top({
        sizeX: overallWidth,
        tabXSize: gridTab,
        tabXCount: item.cellX,
        tabXSpacing: gridSize,
        sizeY: overallHeight,
        tabYSize: gridTab,
        tabYCount: item.cellY,
        tabYSpacing: gridSize,
        wallThickness: wallThickness,
    });

    const canvasWidth = overallWidth - wallThickness * 2;
    const canvasHeight = overallHeight - wallThickness * 2;

    const xSpacing = item.patternXMode === PatternModes.SPACING ? convertLength(item.patternXSpacing, "mm").value : canvasWidth / (item.patternXCount + 1);
    const ySpacing = item.patternYMode === PatternModes.SPACING ? convertLength(item.patternYSpacing, "mm").value : canvasHeight / (item.patternYCount + 1);

    const xCount = item.patternXMode === PatternModes.COUNT ? item.patternXCount : Math.floor(canvasWidth / xSpacing);
    const yCount = item.patternYMode === PatternModes.COUNT ? item.patternYCount : Math.floor(canvasHeight / ySpacing);

    const [set, reset] = Draw.offsetOrigin(overallWidth / 2, overallHeight / 2);

    const shapes = {
        name: "Patterned Top",
        thickness: resTopThickness,
        width: overallWidth,
        height: overallHeight,
        path: [
            top,
            set,
            Draw.array(
                { count: xCount, spacing: xSpacing },
                { count: yCount, spacing: ySpacing },
                cutSlotShape(item.patternShape, convertLength(item.width, "mm").value, convertLength(item.height, "mm").value, convertLength(item.diameter, "mm").value, item.diameterMode),
                "MIDDLE CENTER"
            ),
            reset,
        ].join(" "),
    };

    return [
        {
            name: "Patterned Top",
            copies: 1,
            shapes: [shapes],
        },
    ];
};

export const GridPatternTopDefinition: ItemDefinition<GridPatternTopParams> = {
    Controls,
    getSummary: function (v: GridPatternTopParams): string {
        return `Pattern-Top ${v.cellX}x${v.cellY}`;
    },
    image: "patterntop.png",
    getInitial: function (): GridPatternTopParams {
        return {
            cellX: 1,
            cellY: 1,
            patternXMode: PatternModes.COUNT,
            patternYMode: PatternModes.COUNT,
            patternXCount: 1,
            patternYCount: 1,
            patternXSpacing: { value: 10, unit: "mm" },
            patternYSpacing: { value: 10, unit: "mm" },

            patternShape: PatternShapes.RECT,

            diameter: { value: 5, unit: "mm" },
            diameterMode: DiameterModes.CIRCUMSCRIBE,
            width: { value: 5, unit: "mm" },
            height: { value: 5, unit: "mm" },

            hasTopThickness: false,
            topThickness: { value: 0.125, unit: "in" },
            hasWallThickness: false,
            wallThickness: { value: 0.125, unit: "in" },

            ...initialSystemOverrides(),
        };
    },
    title: "Patterned Top",
    snippet: "A replacement for the typical Grid-box Top with patterned cuttouts.",
    render,
    category: ItemCategories.GRID,
};

const cutSlotShape = (patternShape: PatternShape, width: number, height: number, diameter: number, mode: "INSCRIBE" | "CIRCUMSCRIBE") => {
    switch (patternShape) {
        case "RECT":
            return Draw.cutRect(width, height, "MIDDLE CENTER");
        case "CIRCLE":
            return Draw.cutCircle(diameter / 2, "MIDDLE CENTER");
        case "VHEX":
            return Draw.cutVHex(diameter / 2, mode, "MIDDLE CENTER");
        case "HHEX":
            return Draw.cutHHex(diameter / 2, mode, "MIDDLE CENTER");
    }
};
