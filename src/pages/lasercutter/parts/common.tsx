import styled from "styled-components";
import { ReactNode } from "react";
import NumberInput from "../../../components/inputs/NumberInput";
import { Color } from "../../../utility/types/units";
import HexColorInput from "../../../components/inputs/colorHexInput";

export const Label = styled.div`
   text-align: right;
   align-self: center;
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

export const Full = styled.div`
   grid-column: 2 / -1;
   justify-self: stretch;
   display: grid;
   grid-auto-flow: column;
   grid-template-columns: auto;
   grid-auto-columns: max-content;
   gap: 8px;
`;

export const ControlPanel = styled.div`
   display: grid;
   gap: 0.5em;
   grid-template-columns: max-content 1fr max-content 1fr;
   align-content: start;
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
         <NumberInput
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
