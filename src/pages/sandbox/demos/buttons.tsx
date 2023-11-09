import ActionButton from "!/components/buttons/ActionButton";
import styled from "styled-components";
import { flavours } from "../util";
import IconButton from "!/components/buttons/IconButton";
import { faCheck } from "@fortawesome/pro-solid-svg-icons";
import Checkbox from "!/components/buttons/Checkbox";
import SlimButton from "!/components/buttons/SlimButton";

export const ButtonsDemo = styled(({ disabled = false, invalid = false, className }: { disabled?: boolean; invalid?: boolean; className?: string }) => {
   return (
      <div className={className}>
         <div>ActionButtons</div>
         <div>
            {flavours.map((f) => (
               <ActionButton key={f} flavour={f} disabled={disabled} onClick={() => {}}>
                  {f}
               </ActionButton>
            ))}
         </div>
         <div>SlimButtons</div>
         <div>
            {flavours.map((f) => (
               <SlimButton key={f} flavour={f} disabled={disabled} onClick={() => {}}>
                  {f}
               </SlimButton>
            ))}
         </div>
         <div>IconButtons</div>
         <div>
            {flavours.map((f) => (
               <IconButton key={f} flavour={f} disabled={disabled} onClick={() => {}} icon={faCheck} />
            ))}
         </div>
         <div>Checkboxes (checked)</div>
         <div>
            {flavours.map((f) => (
               <Checkbox checked={true} key={f} flavour={f} disabled={disabled} onToggle={() => {}} />
            ))}
         </div>
         <div>Checkboxes (unchecked)</div>
         <div>
            {flavours.map((f) => (
               <Checkbox checked={false} key={f} flavour={f} disabled={disabled} onToggle={() => {}} />
            ))}
         </div>
      </div>
   );
})`
   display: grid;
   grid-template-columns: auto;
`;
