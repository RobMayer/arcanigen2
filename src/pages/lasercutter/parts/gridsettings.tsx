import { useGridState } from "../statehelper";
import PhysicalLengthInput from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { FOOT_STYLE_OPTIONS } from "../types";
import { Label, Full, ControlPanel } from "./common";
import Foldout from "../../../components/containers/Foldout";

export const GridSettings = () => {
   const [value, setValue] = useGridState();

   return (
      <Foldout label={"Grid Settings"}>
         <ControlPanel>
            <Label>Grid Size</Label>
            <PhysicalLengthInput value={value.gridSize} onValidCommit={(v) => setValue("gridSize", v)} />
            <Label>Grid ±</Label>
            <PhysicalLengthInput value={value.gridClearance} onValidCommit={(v) => setValue("gridClearance", v)} />
            <Label>Stack Size</Label>
            <PhysicalLengthInput value={value.stackSize} onValidCommit={(v) => setValue("stackSize", v)} />
            <Label>Grid ±</Label>
            <PhysicalLengthInput value={value.stackClearance} onValidCommit={(v) => setValue("stackClearance", v)} />
            <Label>Grid Tab</Label>
            <PhysicalLengthInput value={value.gridTab} onValidCommit={(v) => setValue("gridTab", v)} />
            <Label>Stack Tab</Label>
            <PhysicalLengthInput value={value.stackTab} onValidCommit={(v) => setValue("stackTab", v)} />
            <Label>Foot Style</Label>
            <Full>
               <ToggleList
                  options={FOOT_STYLE_OPTIONS}
                  value={value.footStyle}
                  onValue={(v) => {
                     setValue("footStyle", v);
                  }}
               />
            </Full>
            <Label>Foot Size</Label>
            <PhysicalLengthInput value={value.footSize} onValidCommit={(v) => setValue("footSize", v)} />
         </ControlPanel>
      </Foldout>
   );
};
