import { convertLength } from "../../../utility/mathhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { Draw } from "../utility/drawhelper";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { GlobalSettings, LayoutPart, ItemControlProps, ItemDefinition, FootStyles } from "../types";

type FeetParams = {
    hasGridThickness: boolean;
    gridThickness: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

const draw = (item: FeetParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const footDepth = convertLength(item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const gridThickness = convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;
    const footBracketWidth = convertLength(item.hasFootBracketWidth ? item.footBracketWidth : globals.footBracketWidth, "mm").value;
    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;

    if (footStyle === FootStyles.BLOCK) {
        return [
            {
                name: "Feet",
                copies: 1,
                shapes: [
                    {
                        width: gridSize - gridInset * 2 - footClearance * 2,
                        height: gridSize - gridInset * 2 - footClearance * 2,
                        path: [
                            `m ${(gridSize - gridInset * 2 - footClearance * 2) / 2},${(gridSize - gridInset * 2 - footClearance * 2) / 2}`,
                            Draw.Feet.block({ gridSize, gridInset, footClearance }),
                            `m ${(gridSize - gridInset * 2 - footClearance * 2) / -2},${(gridSize - gridInset * 2 - footClearance * 2) / -2}`,
                        ].join(" "),
                        thickness: item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness,
                        name: "Block",
                    },
                ],
            },
        ];
    }
    if (footStyle === FootStyles.RUNNER) {
        return [
            {
                name: "Feet",
                copies: 4,
                shapes: [
                    {
                        width: footRunnerGap + footRunnerTab * 2,
                        height: gridThickness + footDepth,
                        path: [
                            `m ${(footRunnerGap + footRunnerTab * 2) / 2},${(gridThickness + footDepth) / 2}`,
                            Draw.Feet.runner({ footRunnerGap, footRunnerTab, footDepth, gridThickness }),
                            `m ${(footRunnerGap + footRunnerTab * 2) / -2},${(gridThickness + footDepth) / -2}`,
                        ].join(" "),
                        thickness: item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness,
                        name: "Runner",
                    },
                ],
            },
        ];
    }
    if (footStyle === FootStyles.BRACKET) {
        return [
            {
                name: "Feet",
                copies: 1,
                shapes: [
                    {
                        width: footBracketWidth * 5 + 2 * 4,
                        height: footBracketWidth * 5 + 2 * 4,
                        path: [
                            `m${(footBracketWidth * 5 + 2 * 4) / 2},${(footBracketWidth * 5 + 2 * 4) / 2}`,
                            Draw.Feet.bracket({ footBracketWidth }),
                            `m${(footBracketWidth * 5 + 2 * 4) / -2},${(footBracketWidth * 5 + 2 * 4) / -2}`,
                        ].join(" "),
                        thickness: item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness,
                        name: "Bracket",
                    },
                ],
            },
        ];
    }
    return [];
};

const Controls = ({ value, setValue }: ItemControlProps<FeetParams>) => {
    return (
        <>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.feet.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.feet.systemOverrides"} />
        </>
    );
};

export const FeetDefinition: ItemDefinition<FeetParams> = {
    title: "Feet",
    snippet: "Glue these to the bottom of your objects so that they fit into a baseplate",
    image: "feet.png",
    draw,
    Controls,
    getSummary: () => `Feet`,
    getInitial: () => ({
        hasGridThickness: false,
        gridThickness: { value: 0.125, unit: "in" },
        ...initialFootOverrides(),
        ...initialSystemOverrides(),
    }),
};
