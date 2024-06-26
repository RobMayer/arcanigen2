import styled from "styled-components";
import { useCutsheet } from "../systemstate";
import IconButton from "../../../components/buttons/IconButton";
import { iconActionSave } from "../../../components/icons/action/save";
import { useCallback, useRef } from "react";
import { IconDefinition } from "../../../components/icons";
import { saveAs } from "file-saver";
import { iconActionCopy } from "../../../components/icons/action/copy";

export const CutSheet = styled(({ className, selected }: { className?: string; selected: null | number }) => {
    const cutsheet = useCutsheet();

    return (
        <div className={className} id={"EXPORT_ME"}>
            {cutsheet.map(({ result, width, height, margin }, i) => {
                return (
                    <MatGroup key={i}>
                        {result?.map((objs, j) => {
                            return (
                                <Sheet key={`${i}_${j}`}>
                                    <SheetOutput
                                        width={width * DPMM}
                                        height={height * DPMM}
                                        viewBox={`0 0 ${width} ${height}`}
                                        style={MAT_STYLE}
                                        data-material={`${i + 1}`}
                                        data-sheet={`${j + 1}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                    >
                                        {objs.map((box, k) => {
                                            const rot = box.rotated ? `rotate(90, 0, 0)` : "";
                                            const pos = `translate(${margin + box.x + box.width / 2},${margin + box.y + box.height / 2})`;

                                            return (
                                                <g key={`${i}_${j}_${k}`}>
                                                    <path d={`${box.item.path}`} stroke={box.item.color} fill={"none"} vectorEffect={"non-scaling-stroke"} transform={`${pos} ${rot}`} />
                                                </g>
                                            );
                                        })}
                                    </SheetOutput>
                                    <SheetOptions>
                                        <SaveButton target={`${i + 1}-${j + 1}`} />
                                        <CopyButton target={`${i + 1}-${j + 1}`} />
                                    </SheetOptions>
                                </Sheet>
                            );
                        })}
                    </MatGroup>
                );
            })}
        </div>
    );
})`
    overflow-y: scroll;
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-column: 1fr;
    background: var(--layer0);
    gap: 1em;
    padding-block: 1em;
    border: 1px solid var(--effect-border-highlight);
    background: var(--layer0);
`;

const MatGroup = styled.div`
    display: contents;
`;

const DPMM = 283.5 / 100.0;

const MAT_STYLE = {
    background: "white",
};

const Sheet = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
`;

const SheetOutput = styled.svg`
    height: max-content;
    overflow: visible;
    grid-column: 1;
`;

const SheetOptions = styled.div`
    display: grid;
    grid-auto-flow: row;
    font-size: 24pt;
    align-self: start;
    background: #333;
`;

const SaveButton = ({ target }: { target: string }) => {
    const saveThingy = useCallback(() => {
        const [targetMaterial, targetSheet] = target.split("-");
        const svg = document.querySelector(`svg[data-material='${targetMaterial}'][data-sheet='${targetSheet}']`);
        if (svg) {
            const theBlob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
            saveAs(theBlob, `cutsheet-${targetMaterial}-${targetSheet}.svg`);
        }
    }, [target]);

    return <IconButton icon={iconActionSave} onAction={saveThingy} tooltip={"Save SVG"} />;
};

const CopyButton = ({ target }: { target: string }) => {
    const copyThingy = useCallback(() => {
        const [targetMaterial, targetSheet] = target.split("-");
        const svg = document.querySelector(`svg[data-material='${targetMaterial}'][data-sheet='${targetSheet}']`);
        if (svg) {
            navigator.clipboard.writeText(svg.outerHTML);
        }
    }, [target]);

    return <IconButton icon={iconActionCopy} onAction={copyThingy} tooltip={"Copy SVG"} />;
};
