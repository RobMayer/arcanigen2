import { ReactNode } from "react";
import { Enum, GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Section, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import Checkbox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";

const Datums = {
    INSIDE: "INSIDE",
    OUTSIDE: "OUTSIDE",
} as const;

type Datum = Enum<typeof Datums>;

const DATUM_OPTIONS: { [key in Datum]: ReactNode } = {
    [Datums.INSIDE]: "Inside",
    [Datums.OUTSIDE]: "Outside",
};

export const TopStyles = {
    NONE: "NONE",
    FLUSH: "FLUSH",
    INSET: "INSET",
} as const;

type TopStyle = Enum<typeof TopStyles>;

export const TOP_STYLE_OPTIONS: { [key in TopStyle]: ReactNode } = {
    [TopStyles.NONE]: "None",
    [TopStyles.FLUSH]: "Flush",
    [TopStyles.INSET]: "Inset",
};

const Controls = ({ value, setValue }: ItemControlProps<FreeBoxParams>) => {
    const [isThicknessOpen, setIsThicknessOpen] = useUIState("gridfinity.items.freebox.thickness", false);

    return (
        <>
            <ControlPanel>
                <Section>X-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeX} onValidValue={setValue("sizeX")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumX} options={DATUM_OPTIONS} onSelect={setValue("datumX")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceX} onValidValue={setValue("clearanceX")} min={0} />
                </Input>
                <Input label="Tab Count">
                    <NumericInput value={value.tabXCount} onValidValue={setValue("tabXCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabXSize} onValidValue={setValue("tabXSize")} min={0} minExclusive />
                </Input>
                <Section>Y-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeY} onValidValue={setValue("sizeY")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumY} options={DATUM_OPTIONS} onSelect={setValue("datumY")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceY} onValidValue={setValue("clearanceY")} min={0} />
                </Input>
                <Input label="Tab Count">
                    <NumericInput value={value.tabYCount} onValidValue={setValue("tabYCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabYSize} onValidValue={setValue("tabYSize")} min={0} minExclusive />
                </Input>
                <Section>Z-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeZ} onValidValue={setValue("sizeZ")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumZ} options={DATUM_OPTIONS} onSelect={setValue("datumZ")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceZ} onValidValue={setValue("clearanceZ")} min={0} />
                </Input>

                <Input label="Tab Count">
                    <NumericInput value={value.tabZCount} onValidValue={setValue("tabZCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabZSize} onValidValue={setValue("tabZSize")} min={0} minExclusive />
                </Input>

                <Sep />
                <Input label={"Thickness"}>
                    <PhysicalLengthInput value={value.thickness} onValidValue={setValue("thickness")} min={0} minExclusive />
                </Input>
                <Input label={"Top Style"}>
                    <ToggleList value={value.topStyle} options={TOP_STYLE_OPTIONS} onSelect={setValue("topStyle")} />
                </Input>
                <Input label={"Top Inset"}>
                    <PhysicalLengthInput value={value.topInset} onValidCommit={setValue("topInset")} min={0} />
                </Input>

                <Section>Dividers</Section>
                <Input label={"Dividers X"}>
                    <NumericInput value={value.divX} onValidCommit={setValue("divX")} min={0} step={1} />
                </Input>
                <Input label={"Dividers Y"}>
                    <NumericInput value={value.divY} onValidCommit={setValue("divY")} min={0} step={1} />
                </Input>
                <Input label={"Divider Inset"}>
                    <PhysicalLengthInput value={value.divInset} onValidCommit={setValue("divInset")} min={0} />
                </Input>
                <Input label={"Divider Tab Size"}>
                    <PhysicalLengthInput value={value.tabDivSize} onValidCommit={setValue("tabDivSize")} min={0} minExclusive />
                </Input>
                <Input label={"Divider Tab Count"}>
                    <NumericInput value={value.tabDivCount} onValidCommit={setValue("tabDivCount")} min={0} minExclusive />
                </Input>
                <Sep />
            </ControlPanel>

            <ControlledFoldout isOpen={isThicknessOpen} onToggle={setIsThicknessOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasWallThickness} onToggle={setValue("hasWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.wallThickness} onValidValue={setValue("wallThickness")} disabled={!value.hasWallThickness} />
                    </Input>
                    <Input label={"Bottom Thickness"}>
                        <Checkbox checked={value.hasBottomThickness} onToggle={setValue("hasBottomThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.bottomThickness} onValidValue={setValue("bottomThickness")} disabled={!value.hasBottomThickness} />
                    </Input>
                    <Input label={"Top Thickness"}>
                        <Checkbox checked={value.hasTopThickness} onToggle={setValue("hasTopThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.topThickness} onValidValue={setValue("topThickness")} disabled={!value.hasTopThickness} />
                    </Input>
                    <Input label={"Divider Thickness"}>
                        <Checkbox checked={value.hasDivThickness} onToggle={setValue("hasDivThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.divThickness} onValidValue={setValue("divThickness")} disabled={!value.hasDivThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
        </>
    );
};

const draw = (item: FreeBoxParams, globals: GlobalSettings): LayoutPart[] => {
    const resBottomThickness = item.hasBottomThickness ? item.bottomThickness : item.thickness;
    const resWallThickness = item.hasWallThickness ? item.wallThickness : item.thickness;
    const resTopThickness = item.hasTopThickness ? item.topThickness : item.thickness;
    const resDivThickness = item.hasDivThickness ? item.divThickness : item.thickness;

    const bottomThickness = convertLength(resBottomThickness, "mm").value;
    const wallThickness = convertLength(resWallThickness, "mm").value;
    const topThickness = convertLength(resTopThickness, "mm").value;
    const divThickness = convertLength(resDivThickness, "mm").value;

    const topInset = convertLength(item.topInset, "mm").value;
    const divInset = convertLength(item.divInset, "mm").value;

    const clearanceX = convertLength(item.clearanceX, "mm").value;
    const clearanceY = convertLength(item.clearanceY, "mm").value;
    const clearanceZ = convertLength(item.clearanceZ, "mm").value;

    let boxTopOffset = 0;
    let divTopOffset = 0;
    if (item.topStyle === TopStyles.NONE) {
        divTopOffset = divInset;
        boxTopOffset = 0;
    }
    if (item.topStyle === TopStyles.FLUSH) {
        divTopOffset = topThickness;
        boxTopOffset = topThickness;
    }
    if (item.topStyle === TopStyles.INSET) {
        divTopOffset = topInset + topThickness;
        boxTopOffset = topInset + topThickness;
    }

    const targetX = convertLength(item.sizeX, "mm").value;
    const targetY = convertLength(item.sizeY, "mm").value;
    const targetZ = convertLength(item.sizeZ, "mm").value;

    const externalX = targetX + (item.datumX === "OUTSIDE" ? clearanceX * -2 : clearanceX * 2 + wallThickness * 2);
    const externalY = targetY + (item.datumY === "OUTSIDE" ? clearanceY * -2 : clearanceY * 2 + wallThickness * 2);
    const externalZ = targetZ + (item.datumZ === "OUTSIDE" ? clearanceZ * -2 : clearanceZ * 2 + bottomThickness + boxTopOffset);

    const divHeight = externalZ - bottomThickness - divTopOffset;

    const tabXSpacing = targetX / item.tabXCount;
    const tabYSpacing = targetY / item.tabYCount;
    const tabZSpacing = targetZ / item.tabZCount;

    const tabDivSpacing = divHeight / item.tabDivCount;

    const divXSpacing = (externalX - wallThickness * 2 + divThickness) / (item.divX + 1);
    const divYSpacing = (externalY - wallThickness * 2 + divThickness) / (item.divY + 1);

    const calculatedParams = {
        sizeX: externalX,
        sizeY: externalY,
        sizeZ: externalZ,
        divY: item.divY,
        divX: item.divX,
        divHeight,

        tabXSize: convertLength(item.tabXSize, "mm").value,
        tabXSpacing,
        tabXCount: item.tabXCount,

        tabYSize: convertLength(item.tabYSize, "mm").value,
        tabYSpacing,
        tabYCount: item.tabYCount,

        tabZSize: convertLength(item.tabZSize, "mm").value,
        tabZSpacing,
        tabZCount: item.tabZCount,

        tabDivSize: convertLength(item.tabDivSize, "mm").value,
        tabDivCount: item.tabDivCount,
        tabDivSpacing,

        wallThickness,
        bottomThickness,
        topThickness,
        topInset,
        divThickness,
        topStyle: item.topStyle,
        divXSpacing,
        divYSpacing,
        topSquat: 0,
    };

    const shapes: Shape[] = [
        { name: "Bottom", thickness: resBottomThickness, ...drawBottom(calculatedParams) },
        { name: "Front", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Back", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Left", thickness: resWallThickness, ...drawSide(calculatedParams) },
        { name: "Right", thickness: resWallThickness, ...drawSide(calculatedParams) },
    ];

    if (item.topStyle !== TopStyles.NONE) {
        shapes.push({ name: "Top", thickness: resTopThickness, ...drawTop(calculatedParams) });
    }

    if (item.divY > 0) {
        for (let dX = 1; dX <= item.divY; dX++) {
            shapes.push({
                name: "X-Axis Divider",
                thickness: resDivThickness,
                ...drawDivX(calculatedParams),
            });
        }
    }

    if (item.divX > 0) {
        for (let dY = 1; dY <= item.divX; dY++) {
            shapes.push({
                name: "Y-Axis Divider",
                thickness: resDivThickness,
                ...drawDivY(calculatedParams),
            });
        }
    }

    return [
        {
            name: "FreeformBox",
            copies: 1,
            shapes,
        },
    ];
};

export type FreeBoxParams = {
    sizeX: PhysicalLength;
    datumX: Datum;
    clearanceX: PhysicalLength;
    tabXSize: PhysicalLength;
    tabXCount: number;

    sizeY: PhysicalLength;
    datumY: Datum;
    clearanceY: PhysicalLength;
    tabYSize: PhysicalLength;
    tabYCount: number;

    sizeZ: PhysicalLength;
    datumZ: Datum;
    clearanceZ: PhysicalLength;
    tabZSize: PhysicalLength;
    tabZCount: number;

    thickness: PhysicalLength;

    divX: number;
    divY: number;
    divInset: PhysicalLength;
    tabDivSize: PhysicalLength;
    tabDivCount: number;

    topStyle: TopStyle;
    topInset: PhysicalLength;

    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
    hasBottomThickness: boolean;
    bottomThickness: PhysicalLength;
    hasTopThickness: boolean;
    topThickness: PhysicalLength;
    hasDivThickness: boolean;
    divThickness: PhysicalLength;
};

export const FreeBoxDefinition: ItemDefinition<FreeBoxParams> = {
    title: "Freeform Box",
    snippet: "A Freeform box. Has provisions for dividers.",
    category: ItemCategories.FREE,
    draw,
    image: "box.png",
    Controls,
    getSummary: (p) => {
        const n = `Freeform Box ${p.sizeX.value}${p.sizeX.unit} x ${p.sizeY.value}${p.sizeY.unit} x ${p.sizeZ.value}${p.sizeZ.unit}`;
        if (p.divX > 0 || p.divY > 0) {
            return `${n} (Divided ${p.divX + 1}x${p.divY + 1})`;
        }
        return n;
    },
    getInitial: () => {
        return {
            sizeX: { value: 96, unit: "mm" },
            datumX: Datums.OUTSIDE,
            clearanceX: { value: 0.25, unit: "mm" },
            tabXSize: { value: 12, unit: "mm" },
            tabXCount: 2,
            sizeY: { value: 96, unit: "mm" },
            datumY: Datums.OUTSIDE,
            clearanceY: { value: 0.25, unit: "mm" },
            tabYSize: { value: 12, unit: "mm" },
            tabYCount: 2,
            sizeZ: { value: 48, unit: "mm" },
            datumZ: Datums.OUTSIDE,
            clearanceZ: { value: 0, unit: "mm" },
            tabZSize: { value: 6, unit: "mm" },
            tabZCount: 2,
            divX: 2,
            divY: 2,
            tabDivSize: { value: 6, unit: "mm" },
            tabDivCount: 2,
            topStyle: TopStyles.NONE,
            topInset: { value: 0.125, unit: "in" },

            thickness: { value: 0.125, unit: "in" },
            divInset: { value: 0.125, unit: "in" },

            hasWallThickness: false,
            wallThickness: { value: 0.125, unit: "in" },
            hasGridThickness: false,
            gridThickness: { value: 0.125, unit: "in" },
            hasBottomThickness: false,
            bottomThickness: { value: 0.125, unit: "in" },
            hasTopThickness: false,
            topThickness: { value: 0.125, unit: "in" },
            hasDivThickness: false,
            divThickness: { value: 0.125, unit: "in" },
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
    divX,
    wallThickness,
    bottomThickness,
    topThickness,
    divThickness,
    tabDivSize,
    tabDivCount,
    topStyle,
    tabDivSpacing,
    topInset,
    divHeight,
    divXSpacing,
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
    divX: number;
    tabDivSize: number;
    tabDivCount: number;

    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    topStyle: TopStyle;
    tabDivSpacing: number;
    topInset: number;
    divHeight: number;
    divXSpacing: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [
        Draw.tabbedRect(sizeX, sizeZ - topSquat, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: tabXSize,
                          spacing: tabXSpacing,
                          count: tabXCount,
                          depth: -topThickness,
                      },
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

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(sizeX / 2, topInset);
        path.push(set);
        path.push(Draw.array({ count: tabXCount, spacing: tabXSpacing }, { count: 1, spacing: 0 }, Draw.cutRect(tabXSize, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divX > 0) {
        const [set, reset] = Draw.offsetOrigin(sizeX / 2, sizeZ - divHeight - bottomThickness + divHeight / 2);
        path.push(set);
        path.push(Draw.array({ count: divX, spacing: divXSpacing }, { count: tabDivCount, spacing: tabDivSpacing }, Draw.cutRect(divThickness, tabDivSize, "MIDDLE CENTER"), "MIDDLE CENTER"));
        path.push(reset);
    }

    return {
        width: sizeX,
        height: sizeZ,
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
    divY,
    wallThickness,
    bottomThickness,
    topThickness,
    divThickness,
    tabDivSize,
    tabDivCount,
    topStyle,
    topInset,
    divHeight,
    tabDivSpacing,
    divYSpacing,
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
    divY: number;
    tabDivSize: number;
    tabDivCount: number;
    tabDivSpacing: number;

    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;

    topStyle: TopStyle;
    topInset: number;
    divHeight: number;
    divYSpacing: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [];

    path.push(
        Draw.tabbedRect(sizeY, sizeZ - topSquat, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: tabYSize,
                          spacing: tabYSpacing,
                          count: tabYCount,
                          depth: -topThickness,
                      },
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

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(sizeY / 2, topInset);
        path.push(set);
        path.push(Draw.array({ count: tabYCount, spacing: tabYSpacing }, { count: 1, spacing: 0 }, Draw.cutRect(tabYSize, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divY > 0) {
        const [set, reset] = Draw.offsetOrigin(sizeY / 2, sizeZ - divHeight - bottomThickness + divHeight / 2);
        path.push(set);
        path.push(Draw.array({ count: divY, spacing: divYSpacing }, { count: tabDivCount, spacing: tabDivSpacing }, Draw.cutRect(divThickness, tabDivSize, "MIDDLE CENTER"), "MIDDLE CENTER"));
        path.push(reset);
    }

    return {
        width: sizeY,
        height: sizeZ,
        path: path.join(" "),
    };
};

const drawTop = ({
    sizeX,
    tabXSize,
    tabXCount,
    sizeY,
    tabYSize,
    tabYCount,
    wallThickness,
}: {
    sizeX: number;
    tabXSize: number;
    tabXCount: number;
    sizeY: number;
    tabYSize: number;
    tabYCount: number;
    wallThickness: number;
}): { width: number; height: number; path: string } => {
    const width = sizeX;
    const height = sizeY;

    const tabXSpacing = (sizeX - wallThickness * 2) / tabXCount;
    const tabYSpacing = (sizeY - wallThickness * 2) / tabYCount;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: wallThickness,
                width: tabXSize,
            },
            east: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: wallThickness,
                width: tabYSize,
            },
            south: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: wallThickness,
                width: tabXSize,
            },
            west: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: wallThickness,
                width: tabYSize,
            },
        }),
    };
};

const drawDivX = ({
    sizeX,
    tabDivSize,
    tabDivCount,
    divX,
    wallThickness,
    divThickness,
    divHeight,
    divXSpacing,
    tabDivSpacing,
}: {
    sizeX: number;
    tabDivSize: number;
    tabDivCount: number;
    divX: number;
    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    divHeight: number;
    divXSpacing: number;
    tabDivSpacing: number;
}): { width: number; height: number; path: string } => {
    return {
        width: sizeX,
        height: divHeight,
        path: Draw.tabbedRect(sizeX, divHeight, {
            east: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
                // offset: -zOffset,
            },
            south: {
                count: divX,
                width: divThickness,
                depth: -divHeight / 2,
                spacing: divXSpacing,
            },
            west: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
                // offset: zOffset,
            },
        }),
    };
};

const drawDivY = ({
    sizeY,
    tabDivSize,
    tabDivCount,
    divY,
    wallThickness,
    divThickness,
    divHeight,
    divYSpacing,
    tabDivSpacing,
}: {
    sizeY: number;
    tabDivSize: number;
    tabDivCount: number;
    divY: number;
    wallThickness: number;
    divThickness: number;
    divHeight: number;
    divYSpacing: number;
    tabDivSpacing: number;
}) => {
    return {
        width: sizeY,
        height: divHeight,
        path: Draw.tabbedRect(sizeY, divHeight, {
            east: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
            },
            north: {
                count: divY,
                width: divThickness,
                depth: -divHeight / 2,
                spacing: divYSpacing,
            },
            west: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
            },
        }),
    };
};
