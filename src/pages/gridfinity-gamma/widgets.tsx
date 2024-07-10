import { ReactNode } from "react";
import styled from "styled-components";
import IconButton from "../../components/buttons/IconButton";
import { iconNoticeQuery } from "../../components/icons/notice/query";
import Hint, { useHint } from "../../components/popups/Hint";
import { iconNoticeWarning } from "../../components/icons/notice/warning";
import { Icon } from "../../components/icons";

export const Sep = styled.hr`
    grid-column: 1 / -1;
`;

export const ControlPanel = styled.div`
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    gap: 0.5em 0.125em;
    margin: 0.25em 0;
    padding: 0.25em;
    flex: 0 1 auto;
`;

export const Input = styled(({ className, label, children, help }: { className?: string; label?: ReactNode; children?: ReactNode; help?: ReactNode }) => {
    return (
        <div className={className}>
            <Label help={help}>{label}</Label>
            <Contents>{children}</Contents>
        </div>
    );
})`
    display: contents;
`;

const HelpButton = ({ children }: { children?: ReactNode }) => {
    const controls = useHint();
    return (
        <>
            <Hint controls={controls}>{children}</Hint>
            <IconButton
                icon={iconNoticeQuery}
                flavour={"help"}
                onAction={(e) => {
                    controls.open.on(e);
                }}
            />
        </>
    );
};

const Label = styled(({ children, help, className }: { className?: string; children?: ReactNode; help?: ReactNode }) => {
    return (
        <div className={className}>
            <div>{children}</div>
            {help ? <HelpButton>{help}</HelpButton> : null}
        </div>
    );
})``;

const Contents = styled.div`
    display: grid;
    grid-template-columns: max-content;
    grid-auto-columns: auto;
    grid-auto-flow: column;
    gap: 0.5em;

    &:has(> :only-child) {
        grid-template-columns: auto;
    }
`;

export const Group = styled.div`
    grid-column: 1 / -1;
    font-size: 125%;
    font-variant: small-caps;
    border-bottom: 1px solid #fff2;
`;

export const Section = styled.div`
    grid-column: 1 / -1;
    font-size: 150%;
    font-variant: small-caps;
    border-bottom: 1px solid #fff2;
    padding-block: 0.25m;
    margin-block: 0.25em;
    text-align: center;
`;

export const Full = styled.div`
    grid-column: 1 / -1;
    & > p {
        max-width: 400px;
    }
`;

export const WarningBox = styled(({ className, children }: { className?: string; children?: ReactNode }) => {
    return (
        <div className={`${className ?? ""} flavour-emphasis`}>
            <div className={"ping"}>
                <Icon value={iconNoticeWarning} />
            </div>
            <div>{children}</div>
        </div>
    );
})`
    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    padding: var(--padding);
    color: var(--theme-link);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--padding);

    & > .ping {
        font-size: 1.5em;
    }
`;
