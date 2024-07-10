import { ReactNode } from "react";
import styled from "styled-components";

const Changelog = ({ children }: { children?: ReactNode }) => {
    return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.dl`
    display: grid;
    dislay: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;

    & > dt {
        background: #222;
        display: flex;
    }

    & > dd {
        margin-left: 0.5em;
        & > ul > li {
            margin-block: 0.25em;
            &::before {
                content: var(--type, "");
                display: inline-block;
                width: 7em;
                background: oklch(from var(--flavour) 0.2 calc(c * 0.5) h);
                margin-right: 0.25em;
                color: oklch(from var(--flavour) 0.8 calc(c + 0.01) h);
                text-align: center;
            }
        }
    }
`;

const Release = ({ on, children, breaking = false, version }: { on: string; children?: ReactNode; breaking?: boolean; version: string }) => {
    return (
        <>
            <dt>
                <Version>{version}</Version>
                {breaking ? <Breaking>Breaking Change</Breaking> : <div></div>}
                <Spacer />
                <When>{on}</When>
            </dt>
            <dd>
                <ul>{children}</ul>
            </dd>
        </>
    );
};

const Feature = styled.li`
    --flavour: var(--flavour-confirm);
    --type: "Feature";
`;
const Improvement = styled.li`
    --flavour: var(--flavour-info);
    --type: "Improvement";
`;
const Bugfix = styled.li`
    --flavour: var(--flavour-danger);
    --type: "Bug ";
`;

const Breaking = styled.div`
    background: #600;
    border: 1px solid #c00;
    color: white;
    font-weight: normal;
    margin-inline: 1em;
    padding-inline: 0.5em;
    border-radius: 100vw;
`;

const Version = styled.div`
    font-weight: bold;
`;

const When = styled.div``;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

Changelog.Release = Release;
Changelog.Feature = Feature;
Changelog.Improvement = Improvement;
Changelog.Bugfix = Bugfix;

export { Changelog };
