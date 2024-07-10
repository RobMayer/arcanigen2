import styled from "styled-components";
import { useItemList, useItemQuantity } from "../state";
import { ITEM_DEFINITIONS, ItemDefinition } from "../types";
import { Section } from "../widgets";
import { ReactNode } from "react";
import IconButton from "../../../components/buttons/IconButton";
import { iconActionClose } from "../../../components/icons/action/close";
import { NumericInput } from "../../../components/inputs/NumericInput";

export const ItemQuantities = () => {
    const [itemList] = useItemList();

    return (
        <>
            <Section>Item Quantities</Section>
            <ListEntries>
                {itemList.map(({ type, quantity, ...props }, i) => {
                    const title = (ITEM_DEFINITIONS[type] as ItemDefinition<unknown>).getSummary(props);
                    return <EachItemQuantity key={i} title={title} index={i} />;
                })}
            </ListEntries>
        </>
    );
};

const ListEntries = styled.div`
    display: flex;
    flex-direction: column;
    padding: var(--framing);
    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    color: var(--theme-area-color);
    align-self: stretch;
    align-items: start;
    overflow-y: scroll;
    gap: 0.25em;

    flex: 1 0 40%;
`;

const EachItemQuantity = styled(({ title, index, className }: { title: ReactNode; index: number; className?: string }) => {
    const [quantity, setQuantity] = useItemQuantity(index);

    return (
        <div className={className}>
            <div>{title}</div>
            <NumericInput min={0} step={1} value={quantity} onValidValue={setQuantity} />
            <IconButton
                icon={iconActionClose}
                onAction={() => {
                    setQuantity(0);
                }}
                flavour={"danger"}
            />
        </div>
    );
})`
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    align-self: stretch;
    flex: 0 0 max-content;
    align-items: center;
`;
