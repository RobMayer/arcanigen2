import styled from "styled-components";
import Page from "../../components/content/Page";
import { HTMLAttributes, useState } from "react";
import { GlobalFeetSettings, GlobalLayoutSettings, GlobalSystemSettings } from "./options/globalitemsettings";
import { ItemList } from "./options/itemlist";
import { PerItemLayout } from "./options/itemlayout";
import RadioButton from "../../components/buttons/RadioButton";
import { MaterialList } from "./options/materiallist";
import useUIState from "../../utility/hooks/useUIState";
import { PerMaterialLayout } from "./options/materiallayout";
import ActionButton from "../../components/buttons/ActionButton";
import { GridGammaChangelog } from "./changelog";
import Modal, { useModal } from "../../components/popups/Modal";
import { GridGammaAbout } from "./about";
import { ItemControls } from "./options/itemcontrols";
import { ItemQuantities } from "./options/itemquantities";
import { MaterialControls } from "./options/materialcontrols";
import { MissingMaterials } from "./options/missingmaterials";
import { iconArrowLeft } from "../../components/icons/arrow/left";
import { Icon } from "../../components/icons";
import { Helmet } from "react-helmet";

export const GridfinityGamma = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const [mode, setMode] = useUIState("gridfinitygamma.mode", "ITEM");

    const changeLogControls = useModal();
    const aboutControls = useModal();

    return (
        <>
            <Modal controls={changeLogControls} label={"Change Log"}>
                <GridGammaChangelog />
            </Modal>
            <Modal controls={aboutControls} label={"About"}>
                <GridGammaAbout />
            </Modal>
            <Page {...props}>
                <Helmet>
                    <meta property="og:title" content="Gridfinity Gamma" />
                    <meta property="og:url" content="https://www.thatrobhuman.com/gridfinity-gamma/" />
                    <meta property="og:image" content="https://www.thatrobhuman.com/images/gridfinity-gamma.png" />
                    <meta property="og:description" content="An unofficial variant of Gridfinity for use with Laser Cutters instead of 3d Printers." />
                    <title>ThatRobHuman - Gridfinity Gamma</title>
                </Helmet>
                <Menu>
                    <RadioButton value={mode} target={"ITEM"} onSelect={setMode}>
                        Item Setup
                    </RadioButton>
                    <RadioButton value={mode} target={"MATERIAL"} onSelect={setMode}>
                        Material Layout
                    </RadioButton>
                    <Spacer />
                    <ActionButton onAction={changeLogControls.open}>Changelog</ActionButton>
                    <ActionButton onAction={aboutControls.open}>About</ActionButton>
                </Menu>
                {mode === "ITEM" ? <ItemMode /> : null}
                {mode === "MATERIAL" ? <MaterialMode /> : null}
            </Page>
        </>
    );
})`
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: minmax(440px, min-content) minmax(440px, min-content) 5fr;
    padding: 0.25em;
    gap: 0.25em;
    grid-template-areas:
        "menu menu menu"
        "lists options layout";
`;

const ItemMode = () => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <>
            <ListPane>
                <GlobalSystemSettings />
                <GlobalFeetSettings />
                <GlobalLayoutSettings />
                <ItemList selected={selected} setSelected={setSelected} />
            </ListPane>
            {selected === null ? (
                <NoItemSelected>
                    <div>
                        <Icon value={iconArrowLeft} /> Select or Add an Item
                    </div>
                </NoItemSelected>
            ) : (
                <>
                    <OptionsPane>
                        <ItemControls selected={selected} />
                    </OptionsPane>
                    <LayoutPane>
                        <PerItemLayout selected={selected} />
                    </LayoutPane>
                </>
            )}
        </>
    );
};

const MaterialMode = () => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <>
            <ListPane>
                <GlobalLayoutSettings />
                <ItemQuantities />
                <MaterialList selected={selected} setSelected={setSelected} />
                <MissingMaterials />
            </ListPane>
            {selected === null ? (
                <NoMaterialSelected>
                    <div>
                        <Icon value={iconArrowLeft} /> Select or Add a Material
                    </div>
                </NoMaterialSelected>
            ) : (
                <OptionsPane>
                    <MaterialControls selected={selected} />
                </OptionsPane>
            )}
            <LayoutPane>
                <PerMaterialLayout />
            </LayoutPane>
        </>
    );
};

const Menu = styled.div`
    grid-area: menu;
    display: flex;
    gap: 0.25em;
`;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

const ListPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: lists;
`;

const OptionsPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: options;
`;

const LayoutPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: layout;
`;

const NoMaterialSelected = styled.div`
    overflow-y: none;
    display: grid;
    gap: 0.25em;
    padding: 0.5em;
    align-items: center;
    justify-items: center;
    color: #fff8;
    border: 1px solid #fff2;
    grid-area: options;
`;

const NoItemSelected = styled.div`
    overflow-y: none;
    display: grid;
    gap: 0.25em;
    padding: 0.5em;
    align-items: center;
    justify-items: center;
    color: #fff8;
    border: 1px solid #fff2;
    grid-column: 2 / -1;
    grid-row: 2;
`;
