import { NumericInput } from "../../../components/inputs/NumericInput";
import { convertLength } from "../../../utility/mathhelper";
import { drawRect, cutRect, drawArray } from "../cuthelper";
import { Wide, ItemPanel, Label, Section } from "../parts/common";
import { ItemControlProps, ItemDefinition, GridSystem, Material, FOOT_STYLES } from "../types";

export type FootJigParams = {
    type: "FOOTJIG";
    cellX: number;
    cellY: number;
};

const Controls = ({ value, setValue, grid }: ItemControlProps<FootJigParams>) => {
    return (
        <ItemPanel value={value} setValue={setValue} label={FootJigDef.getTitle()}>
            <Section>Size</Section>
            <Label>Cells X</Label>
            <NumericInput value={value.cellX} onValidCommit={(v) => setValue("cellX", v)} min={1} step={1} />
            <Label>Cells Y</Label>
            <NumericInput value={value.cellY} onValidCommit={(v) => setValue("cellY", v)} min={1} step={1} />
        </ItemPanel>
    );
};

const getLayout = (item: FootJigParams, material: Material, grid: GridSystem) => {
    const materialThickness = convertLength(material.thickness, "mm").value;
    const footSize = convertLength(grid.footSize, "mm").value;
    const gridTab = convertLength(grid.gridTab, "mm").value;

    const gridSize = convertLength(grid.gridSize, "mm").value;
    const stackClearance = convertLength(grid.stackClearance, "mm").value;
    const gridClearance = convertLength(grid.gridClearance, "mm").value;

    const rOffset = gridSize / 2 - materialThickness * 1.5 - stackClearance - gridClearance;

    const rJig = [
        `m 0,${rOffset}`,
        cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize, materialThickness),
        `m 0,${-rOffset}`,
        `m 0,${-rOffset}`,
        cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize, materialThickness),
        `m 0,${rOffset}`,

        `m ${rOffset},0`,
        cutRect(materialThickness, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize),
        `m ${-rOffset},0`,
        `m ${-rOffset},0`,
        cutRect(materialThickness, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize),
        `m ${rOffset},0`,
        "",
    ].join(" ");

    // const bOffset = gridSize / 2 - materialThickness - footSize - stackClearance - gridClearance;

    const sJig = cutRect(gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2, gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2);

    const bJig = [
        cutRect(gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2, gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2),
        cutRect(gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2 - footSize * 2, gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2 - footSize * 2),
        // //
        // `m ${bOffset},${bOffset}`,
        // cutRect(footSize * 2, footSize * 2),
        // `m ${-bOffset},${-bOffset}`,

        // `m ${bOffset},${-bOffset}`,
        // cutRect(footSize * 2, footSize * 2),
        // `m ${-bOffset},${bOffset}`,

        // `m ${-bOffset},${-bOffset}`,
        // cutRect(footSize * 2, footSize * 2),
        // `m ${bOffset},${bOffset}`,

        // `m ${-bOffset},${bOffset}`,
        // cutRect(footSize * 2, footSize * 2),
        // `m ${bOffset},${-bOffset}`,
    ].join(" ");

    let theJig = "";
    switch (grid.footStyle) {
        case "RUNNER":
            theJig = rJig;
            break;
        case "BLOCK":
            theJig = sJig;
            break;
        case "BRACKET":
            theJig = bJig;
            break;
    }

    const path = [
        //
        drawRect(gridSize * item.cellX - gridClearance * 2, gridSize * item.cellY - gridClearance * 2),
        drawArray({ count: item.cellX, spacing: gridSize }, { count: item.cellY, spacing: gridSize }, theJig),
    ];

    return [
        {
            width: item.cellX * gridSize - gridClearance * 2,
            height: item.cellY * gridSize - gridClearance * 2,
            path: path.join(" "),
        },
    ];
};

export const FootJigDef: ItemDefinition<FootJigParams> = {
    getLayout,
    Controls,
    getInitial: () => ({
        type: "FOOTJIG",
        cellX: 1,
        cellY: 1,
    }),
    getLabel: (item) => `Foot Jig`,
    getTitle: () => `Foot Jig`,
    getDescription: () => "Use this to help align the feet on a box.",
};
