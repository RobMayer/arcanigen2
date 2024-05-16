import ActionButton from "!/components/buttons/ActionButton";
import Modal, { useModal } from "!/components/popups/Modal";
import styled from "styled-components";
import ArcaneGraph from "../definitions/graph";

const ResetGraph = () => {
    const { reset } = ArcaneGraph.useGraph();

    const modalControls = useModal();

    return (
        <>
            <Modal controls={modalControls} label={"Double-checking"}>
                Are you sure you wish to reset?
                <ModalOptions>
                    <ActionButton
                        onAction={() => {
                            reset();
                            modalControls.close();
                        }}
                        flavour={"danger"}
                    >
                        Proceed
                    </ActionButton>
                    <ActionButton onAction={modalControls.close}>Nevermind</ActionButton>
                </ModalOptions>
            </Modal>
            <ActionButton flavour={"danger"} onAction={modalControls.open}>
                Reset
            </ActionButton>
        </>
    );
};

export default ResetGraph;

const ModalOptions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--effect-border-highlight);
`;
