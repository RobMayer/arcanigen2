import styled from "styled-components";
import Page from "../../components/content/Page";
import { HTMLAttributes, ReactNode, RefObject, useCallback, useMemo, useRef, useState } from "react";
import { GlobalSettings } from "./options/gridsettings";
import { ItemList } from "./options/itemlist";
import { useGlobalSettings, useItemState } from "./state";
import { ITEM_DEFINITIONS, Shape } from "./types";
import IconButton from "../../components/buttons/IconButton";
import { iconActionSave } from "../../components/icons/action/save";
import { saveAs } from "file-saver";
import { iconActionCopy } from "../../components/icons/action/copy";
import { convertLength } from "../../utility/mathhelper";
import { packDynamic, PackedOf } from "./helpers/packhelper";
import { PhysicalLength } from "../../utility/types/units";

export const GridfinityGamma = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <Page {...props}>
            <OptionsPane>
                <GlobalSettings />
                <ItemList selected={selected} setSelected={setSelected} />
            </OptionsPane>
            {selected === null ? (
                <NoneSelected>Select or Add an Item</NoneSelected>
            ) : (
                <OptionsPane>
                    <ItemControls selected={selected} />
                </OptionsPane>
            )}
            {selected === null ? (
                <NoneSelected>Select or Add an Item</NoneSelected>
            ) : (
                <LayoutPane>
                    <ItemLayout selected={selected} />
                </LayoutPane>
            )}
        </Page>
    );
})`
    display: grid;
    grid-template-columns: minmax(440px, min-content) minmax(440px, min-content) 5fr;
    grid-template-rows: 100%;
    padding: 0.5em;
    gap: 0.5em;
`;

const OptionsPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
`;

const LayoutPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
`;

const NoneSelected = styled.div`
    overflow-y: none;
    display: grid;
    gap: 0.25em;
    padding: 0.5em;
    align-items: center;
    justify-items: center;
    color: #fff8;
    border: 1px solid #fff2;
`;

const ItemControls = ({ selected }: { selected: number }) => {
    const [value, setValue] = useItemState(selected);
    const [globals] = useGlobalSettings();

    const Comp = useMemo(() => {
        return ITEM_DEFINITIONS[value.type].Controls;
    }, [value.type]);

    return <Comp value={value as any} setValue={setValue as any} globals={globals} />;
};

const ItemLayout = ({ selected }: { selected: number }) => {
    const [value] = useItemState(selected);
    const [globals] = useGlobalSettings();

    const SVGs = useMemo(() => {
        const margin = convertLength(globals.layoutMargin, "mm").value;
        const spacing = convertLength(globals.layoutSpacing, "mm").value;
        const { type, ...props } = value;

        const shapes = ITEM_DEFINITIONS[type].draw(props as any, globals);

        const byThickness = shapes.reduce<{ [key: string]: Shape[] }>((acc, each) => {
            const k = `${each.thickness.value}${each.thickness.unit}`;
            if (!(k in acc)) {
                acc[k] = [];
            }
            acc[k].push(each);
            return acc;
        }, {});

        const materials = Object.keys(byThickness).reduce<{ [key: string]: { width: number; height: number; items: PackedOf<{ path: string; name: string; thickness: PhysicalLength }>[] } }>(
            (acc, k) => {
                const shapes = byThickness[k].map(({ width, height, ...payload }) => ({
                    width: width + spacing,
                    height: height + spacing,
                    payload,
                }));
                const packed = packDynamic(shapes);

                acc[k] = {
                    width: packed.width,
                    height: packed.height,
                    items: packed.result,
                };
                return acc;
            },
            {}
        );

        return (
            <>
                {Object.entries(materials).map(([thickness, { width, height, items }]) => {
                    return (
                        <Material key={thickness}>
                            <MatThickness>{thickness}</MatThickness>
                            <Sheet width={width} height={height} margin={margin}>
                                {items.map((obj, j) => {
                                    const rot = obj.rotated ? `rotate(90, 0, 0)` : "";
                                    const pos = `translate(${margin + obj.x},${margin + obj.y})`;
                                    return (
                                        <g key={j}>
                                            <Item d={`m ${spacing / 2},${spacing / 2} ${obj.payload.path} m ${-spacing / 2},${-spacing / 2}`} transform={`${pos} ${rot}`}>
                                                <title>{obj.payload.name}</title>
                                            </Item>
                                        </g>
                                    );
                                })}
                            </Sheet>
                        </Material>
                    );
                })}
            </>
        );
    }, [value, globals]);

    return <>{SVGs}</>;
};

const Item = styled.path`
    vector-effect: non-scaling-stroke;
    stroke: black;
    fill: white;
    &:hover {
        fill: #def;
    }
`;

const DPMM = 72.0 / 25.4;

const Material = styled.div`
    display: grid;
    justify-items: center;
`;
const MatThickness = styled.div`
    font-size: 1.5em;
    border-bottom: 1px solid #fff3;
`;
const Svg = styled.svg`
    background: white;
`;

const Sheet = styled(({ width, height, margin, children, className }: { width: number; height: number; margin: number; className?: string; children?: ReactNode }) => {
    const ref = useRef<SVGSVGElement>(null);

    return (
        <div className={className}>
            <Svg
                ref={ref}
                viewBox={`0 0 ${width + margin * 2} ${height + margin * 2}`}
                width={(width + margin * 2) * DPMM}
                height={(height + margin * 2) * DPMM}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                {children}
            </Svg>
            <div className={"menu"}>
                <SaveButton target={ref} />
                <CopyButton target={ref} />
            </div>
        </div>
    );
})`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25em;

    & > .menu {
        display: grid;
        font-size: 2em;
        align-content: start;
        background: #0003;
    }
`;
const SaveButton = ({ target }: { target: RefObject<SVGSVGElement> }) => {
    const doSave = useCallback(() => {
        if (target.current) {
            const theBlob = new Blob([target.current.outerHTML], { type: "image/svg+xml" });
            saveAs(theBlob, "sheet.svg");
        }
    }, [target]);

    return <IconButton icon={iconActionSave} onAction={doSave} />;
};

const CopyButton = ({ target }: { target: RefObject<SVGSVGElement> }) => {
    const doCopy = useCallback(() => {
        if (target.current) {
            navigator.clipboard.writeText(target.current.outerHTML);
        }
    }, [target]);

    return <IconButton icon={iconActionCopy} onAction={doCopy} />;
};
