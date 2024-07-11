import { BaseplateDefinition } from "./items/baseplate";
import { FeetDefinition } from "./items/feet";
import { FootJigDefinition } from "./items/footjig";
import { FreeBoxDefinition } from "./items/freebox";
import { GridboxDefinition } from "./items/gridbox";
import { GridTrayDefinition } from "./items/gridtray";

export const ITEM_DEFINITIONS = {
    GRIDBOX: GridboxDefinition,
    BASEPLATE: BaseplateDefinition,
    FOOTJIG: FootJigDefinition,
    FEET: FeetDefinition,
    GRIDTRAY: GridTrayDefinition,
    FREEBOX: FreeBoxDefinition,
} as const;
