import ActionButton from "../../../components/buttons/ActionButton";
import Modal, { useModal } from "../../../components/popups/Modal";
import ChangeLog from "../changeLog";

const ShowChangelog = () => {
    const modalControls = useModal();

    return (
        <>
            <Modal controls={modalControls} label={"Change Log"}>
                <ChangeLog />
            </Modal>
            <ActionButton onAction={modalControls.open}>Change Log</ActionButton>
        </>
    );
};

export default ShowChangelog;
