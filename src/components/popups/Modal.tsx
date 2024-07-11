import { RefObject, ReactNode, ComponentType, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";
import IconButton from "../buttons/IconButton";
import Backdrop, { Backdrops } from "./Backdrop";
import { iconActionClose } from "../icons/action/close";

function Modal<T extends ModalProps = ModalProps & { label: ReactNode; noCloseButton?: boolean }>({
    controls,
    wrapper: Wrapper = ModalWrappers.Typical as (p: T) => JSX.Element,
    className,
    children,
    noFocusTrap,
    noEscapeKey,
    noBackdropClose,
    focusRef,
    backdrop = Backdrops.Glass,
    target = "root",
    ...rest
}: {
    controls: ModalControls;
    className?: string;
    children?: ReactNode;
    noFocusTrap?: boolean;
    noFocusIn?: boolean;
    noEscapeKey?: boolean;
    noBackdropClose?: boolean;
    focusRef?: RefObject<HTMLElement>;
    wrapper?: (p: T) => JSX.Element;
    backdrop?: ComponentType;
    target?: string;
} & Omit<T, keyof ModalProps>) {
    return controls.isOpen ? (
        ReactDOM.createPortal(
            <Backdrop element={backdrop} action={controls.close} noEscapeKey={noEscapeKey} noFocusTrap={noFocusTrap} noBackdropClose={noBackdropClose} focusRef={focusRef} target={target}>
                <Wrapper {...((rest ?? {}) as T)} className={className} controls={controls}>
                    {children}
                </Wrapper>
            </Backdrop>,
            document.getElementById("modal-root")!
        )
    ) : (
        <></>
    );
}

export const useModal = (initial: boolean = false, onClose?: () => void) => {
    const [state, setState] = useState<boolean>(initial);

    useEffect(() => {
        setState(initial);
    }, [initial]);

    const controls = useMemo<ModalControls>(() => {
        return {
            open: () => setState(true),
            close: () => {
                setState(false);
                onClose && onClose();
            },
            isOpen: state,
        };
    }, [state, onClose]);

    return controls;
};

Modal.useModal = useModal;

export default Modal;

export type ModalControls = {
    open: () => void;
    close: () => void;
    isOpen: boolean;
};

export type ModalProps = {
    controls: ModalControls;
    children?: ReactNode;
    className?: string;
};

export const ModalWrappers = {
    Typical: styled(({ controls, children, className, label, noCloseButton }: ModalProps & { label: ReactNode; noCloseButton?: boolean }) => {
        return (
            <div className={className}>
                <InnerTitlebar>
                    <InnerTitle
                        style={{
                            flex: "1 1 auto",
                        }}
                    >
                        {label}
                    </InnerTitle>
                    {!noCloseButton && (
                        <CloseButton>
                            <IconButton
                                flavour={"danger"}
                                onAction={() => {
                                    controls.close();
                                }}
                                icon={iconActionClose}
                            />
                        </CloseButton>
                    )}
                </InnerTitlebar>
                <InnerBody>{children}</InnerBody>
            </div>
        );
    })`
        border: 1px solid var(--effect-border-highlight);
        outline: 1px solid var(--effect-border-muted);
        width: calc(100% - 16px);
        min-width: fit-content;
        width: fit-content;
        max-width: 80vw;
        max-height: 80vh;
        padding: 1px;
        background: var(--layer0);
        display: grid;
        grid-template-rows: max-content 1fr;
        grid-template-columns: 1fr;
    `,
};

const InnerTitlebar = styled.div`
    background: var(--layer2);
    color: var(--text-highlight);
    display: flex;
    padding: 0 0.25em;
    align-items: center;
`;

const InnerTitle = styled.div`
    font-size: 0.825em;
    flex: 1 1 auto;
`;

const CloseButton = styled.div`
    flex: 0 0 auto;
`;

const InnerBody = styled.div`
    padding: 0.25em;
    overflow-y: auto;
`;
