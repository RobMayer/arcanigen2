import { ReactNode, RefObject, useCallback, useMemo, useRef } from "react";
import { useGlobalSettings, useItemList, useMaterialList } from "../state";
import { ITEM_DEFINITIONS, ItemDefinition, Material } from "../types";
import { convertLength } from "../../../utility/mathhelper";
import saveAs from "file-saver";
import styled from "styled-components";
import IconButton from "../../../components/buttons/IconButton";
import { iconActionCopy } from "../../../components/icons/action/copy";
import { iconActionSave } from "../../../components/icons/action/save";
import { PhysicalLength } from "../../../utility/types/units";
import { WarningBox } from "../widgets";
import { Pack } from "../utility/packhelper";

export const PerMaterialLayout = () => {
    const [items] = useItemList();
    const [materials] = useMaterialList();
    const [globals] = useGlobalSettings();

    const [packed, unallocated] = useMemo(() => {
        const discarded: Pack.RectOf<{ path: string; name: string }>[] = [];

        const available = materials.reduce<{ [key: string]: Material }>((acc, each) => {
            const key = `${each.thickness.value}${each.thickness.unit}`;
            if (!(key in acc)) {
                acc[key] = each;
            }
            return acc;
        }, {});

        const toPack = items.reduce<{ [key: string]: Pack.RectOf<{ path: string; name: string }>[] }>((acc, { type, quantity, ...props }) => {
            const items = (ITEM_DEFINITIONS[type] as ItemDefinition<unknown>).draw(props, globals);

            items.forEach(({ shapes, copies, name: itemName }) => {
                shapes.forEach((shape) => {
                    const k = `${shape.thickness.value}${shape.thickness.unit}`;
                    if (!(k in acc)) {
                        acc[k] = [];
                    }
                    for (let i = 0; i < copies * quantity; i++) {
                        acc[k].push({ width: shape.width, height: shape.height, payload: { path: shape.path, name: `${itemName} ${shape.name}` } });
                    }
                });
            });

            return acc;
        }, {});

        const res = Object.entries(available).reduce<{
            [key: string]: { margin: PhysicalLength; width: PhysicalLength; height: PhysicalLength; sheets: Pack.SheetOf<{ path: string; name: string }>[] };
        }>((acc, [thicknessStr, material]) => {
            const calcWidth = convertLength(material.width, "mm").value;
            const calcHeight = convertLength(material.height, "mm").value;
            const calcSpacing = convertLength(material.hasLayoutSpacing ? material.layoutSpacing : globals.layoutSpacing, "mm").value;

            const [fit, unfit] = Pack.pack(calcWidth, calcHeight, toPack?.[thicknessStr] ?? [], calcSpacing);

            acc[thicknessStr] = {
                width: material.width,
                height: material.height,
                margin: material.hasLayoutMargin ? material.layoutMargin : globals.layoutMargin,
                sheets: fit,
            };

            discarded.push(...unfit);

            return acc;
        }, {});

        return [res, discarded];
    }, [items, materials, globals]);

    return (
        <>
            {unallocated.length > 0 ? <WarningBox>Some Items could not fit on the materials provided.</WarningBox> : null}
            {Object.entries(packed).map(([thicknessStr, { width, height, margin, sheets }]) => {
                return (
                    <MaterialWrapper key={thicknessStr}>
                        <MaterialName>
                            {width.value}
                            {width.unit} x {height.value}
                            {height.unit} @ {thicknessStr} ({sheets.length}x)
                        </MaterialName>
                        {sheets.map(({ width, height, items }, i) => {
                            const calcMargin = convertLength(margin, "mm").value;

                            return (
                                <Sheet width={width} height={height} margin={calcMargin} key={`${thicknessStr}_${i}`}>
                                    {items.map((obj, j) => {
                                        const rot = obj.rotated ? `rotate(90, 0, 0)` : "";
                                        const pos = `translate(${calcMargin + obj.x + (obj.rotated ? obj.width : 0)},${calcMargin + obj.y})`;
                                        return (
                                            <g key={j}>
                                                <Item d={obj.payload.path} transform={`${pos} ${rot}`}>
                                                    <title>{obj.payload.name}</title>
                                                </Item>
                                            </g>
                                        );
                                    })}
                                </Sheet>
                            );
                        })}
                    </MaterialWrapper>
                );
            })}
        </>
    );
};

const Svg = styled.svg`
    background: #ccc;
`;

const DPMM = 72.0 / 25.4;

const MaterialWrapper = styled.div`
    display: grid;
    justify-items: center;
`;
const MaterialName = styled.div`
    font-size: 1.5em;
`;

const Item = styled.path`
    vector-effect: non-scaling-stroke;
    stroke: black;
    fill: white;
    &:hover {
        fill: #def;
    }
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
    margin: 0.5em;

    & > .menu {
        display: grid;
        font-size: 2em;
        align-content: start;
        background: #fff1;
        align-self: start;
    }
`;

const SaveButton = ({ target }: { target: RefObject<SVGSVGElement> }) => {
    const doSave = useCallback(() => {
        if (target.current) {
            const theBlob = new Blob([target.current.outerHTML], { type: "image/svg+xml" });
            saveAs(theBlob, "sheet.svg");
        }
    }, [target]);

    return <IconButton icon={iconActionSave} onAction={doSave} tooltip="Save SVG" />;
};

const CopyButton = ({ target }: { target: RefObject<SVGSVGElement> }) => {
    const doCopy = useCallback(() => {
        if (target.current) {
            navigator.clipboard.writeText(target.current.outerHTML);
        }
    }, [target]);

    return <IconButton icon={iconActionCopy} onAction={doCopy} tooltip="Copy SVG" />;
};
