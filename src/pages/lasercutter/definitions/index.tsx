import { ItemDefinition } from "../types";
import { BaseplateDef, BaseplateParams } from "./baseplate";
import { BoxDef, BoxParams } from "./box";
import { FeetDef, FeetParams } from "./feet";
import { FootJigDef, FootJigParams } from "./footjig";

export type ItemParams = BoxParams | BaseplateParams | FeetParams | FootJigParams;

export const ITEM_DEFINITIONS: { [key in ItemParams["type"]]: ItemDefinition<any> } = {
   BOX: BoxDef,
   BASEPLATE: BaseplateDef,
   FEET: FeetDef,
   FOOTJIG: FootJigDef,
};
