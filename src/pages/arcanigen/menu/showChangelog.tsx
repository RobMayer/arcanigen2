import ActionButton from "../../../components/buttons/ActionButton";
import Modal, { useModal } from "../../../components/popups/Modal";
import { ArcanigenChangelog } from "../changelog";

const ShowChangelog = () => {
    const modalControls = useModal();

    return (
        <>
            <Modal controls={modalControls} label={"Change Log"}>
                <ArcanigenChangelog />
            </Modal>
            <ActionButton onAction={modalControls.open}>Change Log</ActionButton>
        </>
    );
};

export default ShowChangelog;
