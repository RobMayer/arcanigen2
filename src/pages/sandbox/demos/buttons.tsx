import ActionButton from "!/components/buttons/ActionButton";
import styled from "styled-components";
import { flavours } from "../util";
import IconButton from "!/components/buttons/IconButton";
import CheckBox from "!/components/buttons/Checkbox";
import { iconActionCopy } from "../../../components/icons/action/copy";
import CheckButton from "../../../components/buttons/CheckButton";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";

export const ButtonsDemo = styled(({ disabled = false, invalid = false, className }: { disabled?: boolean; invalid?: boolean; className?: string }) => {
    return (
        <div className={className}>
            <Routes>
                <Route path={"action"} element={<Buttons disabled={disabled} invalid={invalid} />} />
                <Route path={"checks"} element={<Checks disabled={disabled} invalid={invalid} />} />
            </Routes>
        </div>
    );
})`
    display: grid;
    grid-template-columns: auto;
    grid-auto-rows: fit-content;
`;

const Buttons = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) => {
    return (
        <>
            <h2>Action Buttons</h2>
            <div>
                {flavours.map((f) => (
                    <ActionButton key={f} flavour={f} disabled={disabled} onAction={() => {}} variant={"slim"}>
                        {f}
                    </ActionButton>
                ))}
            </div>
            <h2>Icon Buttons</h2>
            <div>
                {flavours.map((f) => (
                    <IconButton key={f} flavour={f} disabled={disabled} onAction={() => {}} icon={iconActionCopy} />
                ))}
            </div>
        </>
    );
};

const Checks = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) => {
    const [state, setState] = useState<boolean>(false);

    return (
        <>
            <h2>Check Boxes</h2>
            <div>
                {flavours.map((f) => (
                    <CheckBox checked={state} key={f} flavour={f} disabled={disabled} onToggle={setState} />
                ))}
            </div>
            <h2>Check Boxes</h2>
            <div>
                {flavours.map((f) => (
                    <CheckBox checked={state} key={f} flavour={f} disabled={disabled} onToggle={setState}>
                        {f}
                    </CheckBox>
                ))}
            </div>
            <h2>Check Buttons</h2>
            <div>
                {flavours.map((f) => (
                    <CheckButton checked={state} key={f} flavour={f} disabled={disabled} onToggle={setState}>
                        {f}
                    </CheckButton>
                ))}
            </div>
        </>
    );
};
