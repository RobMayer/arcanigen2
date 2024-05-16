import { useMemo, useState } from "react";
import { flavours } from "../util";
import ToggleList from "../../../components/selectors/ToggleList";
import { Routes, Route } from "react-router-dom";
import RadioBox from "../../../components/buttons/RadioBox";
import RadioButton from "../../../components/buttons/RadioButton";
import NativeDropdown from "../../../components/selectors/NativeDropdown";
import { iconActionCopy } from "../../../components/icons/action/copy";

const OPTIONS = {
    alpha: "Alpha",
    bravo: "Bravo",
    charlie: "Charlie",
} as const;

export const SelectorsDemo = ({ disabled = false, invalid = false, className }: { disabled?: boolean; className?: string; invalid?: boolean }) => {
    return (
        <div className={className}>
            <Routes>
                <Route path={"togglelist"} element={<ToggleLists disabled={disabled} invalid={invalid} />} />
                <Route path={"radios"} element={<Radios disabled={disabled} invalid={invalid} />} />
                <Route path={"dropdown"} element={<Dropdowns disabled={disabled} invalid={invalid} />} />
            </Routes>
        </div>
    );
};

const Radios = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) => {
    const [state, setState] = useState<keyof typeof OPTIONS>("alpha");

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>RadioBoxes</h2>
            <div>
                {flavours.map((f) => (
                    <div key={f}>
                        {Object.entries(OPTIONS).map(([k, v]) => (
                            <RadioBox key={k} value={state} target={k} onSelect={setState} flavour={f} disabled={disabled}>
                                {v}
                            </RadioBox>
                        ))}
                    </div>
                ))}
            </div>
            <h2>RadioBoxes</h2>
            <div>
                {flavours.map((f) => (
                    <div key={f}>
                        {Object.entries(OPTIONS).map(([k, v]) => (
                            <RadioButton key={k} value={state} target={k} onSelect={setState} flavour={f} disabled={disabled}>
                                {v}
                            </RadioButton>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

const ToggleLists = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) => {
    const [state, setState] = useState<keyof typeof OPTIONS>("alpha");

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Toggle Lists</h2>
            <div>horizontal</div>
            <div>
                {flavours.map((f) => (
                    <ToggleList key={f} options={OPTIONS} value={state} onSelect={setState} flavour={f} disabled={disabled} validate={validate} />
                ))}
            </div>
            <div>vertical</div>
            <div>
                {flavours.map((f) => (
                    <ToggleList direction={"vertical"} key={f} options={OPTIONS} value={state} onSelect={setState} flavour={f} disabled={disabled} validate={validate} />
                ))}
            </div>
        </>
    );
};

const Dropdowns = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) => {
    const [state, setState] = useState<keyof typeof OPTIONS>("alpha");

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Native Dropdown</h2>
            <div>
                {flavours.map((f) => {
                    return <NativeDropdown icon={iconActionCopy} key={f} options={OPTIONS} value={state} onSelect={setState} flavour={f} disabled={disabled} validate={validate} />;
                })}
            </div>
        </>
    );
};
