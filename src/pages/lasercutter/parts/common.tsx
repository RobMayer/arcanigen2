import styled from "styled-components";
import { ReactNode } from "react";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { Color } from "../../../utility/types/units";
import HexColorInput from "../../../components/inputs/colorHexInput";
import CheckBox from "../../../components/buttons/Checkbox";

export const Label = styled.div`
    text-align: right;
    align-self: center;
    font-size: 0.875em;
`;

export const Header = styled.div`
    grid-column: 1 / -1;
    font-size: 1.375em;
    border-bottom: 1px solid #444;
    margin: 0.25em;
    text-align: center;
`;

export const Section = styled.div`
    grid-column: 1 / -1;
    font-size: 1.25em;
    border-bottom: 1px solid #444;
    margin: 0.25em;
    text-align: right;
`;

export const Wide = styled.div`
    grid-column: 2 / -1;
    justify-self: stretch;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: auto;
    gap: 0.5em;
    align-items: center;
`;

export const Full = styled.div`
    grid-column: 1 / -1;
    justify-self: stretch;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto auto;
    grid-auto-columns: minmax(max-content, 1fr);
    gap: 0.5em;
    align-items: center;
`;

export const Double = styled.div`
    grid-column-end: span 2;
    display: grid;
    align-items: center;
    grid-template-columns: 1fr;
    grid-auto-columns: auto;
    grid-auto-flow: column;
`;

export const Stack = styled.div`
    display: grid;
    grid-auto-rows: auto;
    justify-items: stretch;
`;

export const Optional = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5em;
    align-items: center;
`;

export const Override = styled(({ children, className, checked, onToggle }: { className?: string; checked: boolean; onToggle: (v: boolean) => void; children?: ReactNode }) => {
    return (
        <div className={className}>
            <CheckBox checked={checked} onToggle={onToggle} />
            {children}
        </div>
    );
})`
    display: grid;
    gap: 0.5em;
    align-items: center;
    grid-template-columns: auto 1fr;
`;

export const ControlPanel = styled.div`
    display: grid;
    gap: 0.5em;
    grid-template-columns: auto 1fr auto 1fr;
    align-content: start;
    align-items: start;
    & > .span2 {
        grid-column-end: span 2;
    }
    & > .spanRest {
        grid-column: 2 / -1;
    }
    & > .spanAll {
        grid-column: 1 / -1;
    }
`;

type ItemPanelProps = {
    value: { quantity: number; color: Color };
    setValue: (key: "quantity" | "color", value: number | Color) => void;
    children?: ReactNode;
    label: ReactNode;
};

export const ItemPanel = ({ label, children, value, setValue }: ItemPanelProps) => {
    return (
        <ControlPanel>
            <Header>{label}</Header>
            <Label>Quantity</Label>
            <NumericInput
                value={value.quantity}
                onValidCommit={(v) => {
                    setValue("quantity", v);
                }}
                min={0}
                step={1}
            />
            <Label>Color</Label>
            <HexColorInput
                value={value.color}
                onCommit={(v) => {
                    setValue("color", v);
                }}
            />
            {children}
        </ControlPanel>
    );
};
