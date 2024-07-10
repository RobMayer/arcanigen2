import { Dispatch, SetStateAction, useMemo } from "react";
import styled from "styled-components";
import ActionButton from "../../../components/buttons/ActionButton";
import { useItemList } from "../state";
import { ITEM_DEFINITIONS, ItemDefinition, ItemType } from "../types";
import Modal, { useModal } from "../../../components/popups/Modal";
import { ArraySelect } from "../../../components/selectors/ArraySelect";
import { Section } from "../widgets";

export const ItemList = ({ selected, setSelected }: { selected: number | null; setSelected: Dispatch<SetStateAction<null | number>> }) => {
    const [list, listMethods] = useItemList();
    const controls = useModal();

    const existingItems = useMemo(() => {
        return list.map((each) => {
            return ITEM_DEFINITIONS[each.type].getSummary(each as any);
        });
    }, [list]);

    return (
        <>
            <Modal controls={controls} label={"Add Item"}>
                <AddItemOptions>
                    {Object.keys(ITEM_DEFINITIONS).map((type: ItemType) => {
                        return (
                            <ItemButton
                                def={ITEM_DEFINITIONS[type]}
                                onAdd={() => {
                                    listMethods.add({ type, quantity: 1, ...ITEM_DEFINITIONS[type].getInitial() });
                                    setSelected(list.length);
                                    controls.close();
                                }}
                            />
                        );
                    })}
                </AddItemOptions>
            </Modal>
            <Section>Items</Section>
            <Options>
                <ActionButton
                    onAction={() => {
                        controls.open();
                    }}
                >
                    Add
                </ActionButton>
                <ActionButton
                    onAction={() => {
                        listMethods.delete(selected);
                        setSelected(null);
                    }}
                    disabled={selected === null}
                    flavour={"danger"}
                >
                    Remove
                </ActionButton>
                <ActionButton
                    onAction={() => {
                        listMethods.clear();
                        setSelected(null);
                    }}
                    disabled={list.length === 0}
                    flavour={"danger"}
                >
                    Clear
                </ActionButton>
            </Options>
            <List className={"list"} onSelect={setSelected} value={selected} options={existingItems} />
        </>
    );
};

const List = styled(ArraySelect)`
    flex: 1 0 50%;
`;

const Options = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 0.5em;
`;

const AddItemOptions = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, 250px);
    grid-auto-rows: 1fr auto auto;
    align-items: bottom;
    justify-content: center;
    align-self: center;
    max-width: 80vw;
    width: fit-content;
    gap: 0.5em;
    padding: 0.25em;
    margin: 0 auto;
`;

const ItemButton = styled(({ def, className, onAdd }: { def: ItemDefinition<any>; className?: string; onAdd: () => void }) => {
    return (
        <div className={className}>
            {def.image ? <img src={`/images/gridfinity-items/${def.image}`} /> : <NoImage />}
            <Description>{def.snippet}</Description>
            <ActionButton onAction={onAdd}>{def.title}</ActionButton>
        </div>
    );
})`
    display: grid;
    grid-template-rows: subgrid;
    grid-template-columns: 1fr;
    grid-row: span 3;
    gap: 0.25em;
    padding: 0.25em;
    border: 1px solid #fff3;
`;

const Description = styled.div`
    font-size: 0.825em;
    justify-content: start;
    padding: 0 0.5em;
`;

const NoImage = styled.div`
    background: #333;
`;
