import { ITEM_DEFINITIONS } from "../definitions";
import { useItemState, useGlobalSettings } from "../state";

export const ItemControls = ({ selected }: { selected: number }) => {
    const [value, setValue] = useItemState(selected);
    const [globals] = useGlobalSettings();

    const Comp = ITEM_DEFINITIONS[value.type].Controls;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Comp value={value as any} setValue={setValue as any} globals={globals} />;
};
