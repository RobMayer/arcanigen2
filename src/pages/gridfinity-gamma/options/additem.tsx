import styled from "styled-components";
import { ItemType, ItemDefinition, ItemCategory, ItemCategories } from "../types";
import ActionButton from "../../../components/buttons/ActionButton";
import { ITEM_DEFINITIONS } from "../definitions";
import { Fragment, ReactNode } from "react";
import { Section } from "../widgets";

const CATEGORY_NAMES: { [key in ItemCategory]: ReactNode } = {
    [ItemCategories.GRID]: "Grid-based",
    [ItemCategories.FREE]: "Freeform",
    [ItemCategories.TOOL]: "Tools",
};

const ByCategory = Object.keys(ITEM_DEFINITIONS).reduce<{ [key: string]: { name: ReactNode; items: ItemType[] } }>((acc, type: ItemType) => {
    const def = ITEM_DEFINITIONS[type];
    if (!(def.category in acc)) {
        acc[def.category] = { name: CATEGORY_NAMES[def.category], items: [] };
    }
    acc[def.category].items.push(type);
    return acc;
}, {});

export const AddItem = ({ onPick }: { onPick: (type: ItemType) => void }) => {
    return Object.keys(ByCategory).map((catKey: ItemCategory) => {
        return (
            <Fragment key={catKey}>
                <Section>{CATEGORY_NAMES[catKey]}</Section>
                <CategoryGroup>
                    {ByCategory[catKey].items.map((type) => {
                        return (
                            <ItemButton
                                key={type}
                                def={ITEM_DEFINITIONS[type] as ItemDefinition<unknown>}
                                onAdd={() => {
                                    onPick(type);
                                }}
                            />
                        );
                    })}
                </CategoryGroup>
            </Fragment>
        );
    });
};

const CategoryGroup = styled.div`
    display: grid;
    gap: 0.5em;
    grid-template-columns: repeat(auto-fit, 250px);
    grid-auto-rows: 1fr auto auto;
    width: max-content;
    max-width: 80vw;
`;

const ItemButton = styled(({ def, className, onAdd }: { def: ItemDefinition<unknown>; className?: string; onAdd: () => void }) => {
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
