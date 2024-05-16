/* eslint-disable no-irregular-whitespace */
import styled from "styled-components";

export type IconDefinition = { width: number; height: number; path: string };

export const Icon = styled(({ className, value, tooltip }: { className?: string; value: IconDefinition; tooltip?: string }) => {
    return (
        <span className={`${className ?? ""} meta-icon`} title={tooltip}>
            ​
            <svg viewBox={`0 0 ${value.width} ${value.height}`} preserveAspectRatio={"xMidYMid"}>
                <path d={value.path} />
            </svg>
            ​
        </span>
    );
})`
    display: inline-flex;
    align-items: center;
    justify-items: center;
    justify-content: center;
    align-content: center;
    align-self: center;
    justify-self: center;

    & > svg {
        width: calc((1lh + 1em) / 2);
        height: calc((1lh + 1em) / 2);
        align-self: center;
        justify-self: center;
        & > path {
            fill: currentColor;
        }
    }
`;
