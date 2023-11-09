import styled from "styled-components";
import TextInput from "!/components/inputs/TextInput";
import NumberInput from "!/components/inputs/NumberInput";

export const InputDemo = styled(({ disabled = false, invalid = false, className }: { disabled?: boolean; invalid?: boolean; className?: string }) => {
   return (
      <div className={className}>
         <div>TextInput</div>
         <div>
            <TextInput value={""} onChange={() => {}} disabled={disabled} />
         </div>
         <div>Numeric Input</div>
         <div>
            <NumberInput value={0} onChange={() => {}} disabled={disabled} />
         </div>
      </div>
   );
})`
   display: grid;
   grid-template-columns: auto;
`;
