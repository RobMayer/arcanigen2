import { ReactNode, RefObject, useCallback, useMemo, useRef } from "react";
import { useGlobalSettings, useItemList } from "../state";
import { ITEM_DEFINITIONS, Shape } from "../types";
import saveAs from "file-saver";
import styled from "styled-components";
import IconButton from "../../../components/buttons/IconButton";
import { iconActionCopy } from "../../../components/icons/action/copy";
import { iconActionSave } from "../../../components/icons/action/save";
import { convertLength } from "../../../utility/mathhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { Pack } from "../helpers/packhelper2";

export const PerItemLayout = () => {
    const [itemlist] = useItemList();
    const [globals] = useGlobalSettings();

    return itemlist.map(({ type, ...props }, i) => {
        const parts = ITEM_DEFINITIONS[type].draw(props as any, globals);
        return parts.map(({ name, shapes, copies }, j) => {
            return <PartLayout name={name} totalCount={copies} shapes={shapes} key={`${i}_${j}`} />;
        });
    });
};

const PartLayout = ({ name, shapes, totalCount }: { name: string; shapes: Shape[]; totalCount: number }) => {
    const [globals] = useGlobalSettings();

    const spacing = useMemo(() => {
        return convertLength(globals.layoutSpacing, "mm").value;
    }, [globals.layoutSpacing]);

    const margin = useMemo(() => {
        return convertLength(globals.layoutMargin, "mm").value;
    }, [globals.layoutMargin]);

    const sheets = useMemo(() => {
        const byThickness = shapes.reduce<{ [key: string]: Shape[] }>((acc, each) => {
            const k = `${each.thickness.value}${each.thickness.unit}`;
            if (!(k in acc)) {
                acc[k] = [];
            }
            acc[k].push(each);
            return acc;
        }, {});

        return Object.keys(byThickness).reduce<{ [key: string]: { width: number; height: number; items: Pack.PackedOf<{ path: string; name: string; thickness: PhysicalLength }>[] } }>((acc, k) => {
            const shapes = byThickness[k].map(({ width, height, ...payload }) => ({
                width: width,
                height: height,
                payload,
            }));
            const [packed] = Pack.pack(0, 0, shapes, spacing);

            if (packed.length === 0) {
                return acc;
            }

            acc[k] = packed[0];
            return acc;
        }, {});
    }, [shapes, spacing]);

    return (
        <>
            <PartName>
                {name}
                {totalCount > 1 ? ` (${totalCount}x)` : null}
            </PartName>
            <Parts>
                {Object.entries(sheets).map(([thickness, { width, height, items }]) => {
                    return (
                        <Material key={thickness}>
                            <MaterialName>{thickness}</MaterialName>
                            <Sheet width={width} height={height} margin={margin}>
                                {items.map((obj, j) => {
                                    const rot = obj.rotated ? `rotate(90, 0, 0)` : "";
                                    const pos = `translate(${margin + obj.x + (obj.rotated ? obj.width : 0)},${margin + obj.y})`;
                                    return (
                                        <g key={j}>
                                            <Item d={obj.payload.path} transform={`${pos} ${rot}`}>
                                                <title>{obj.payload.name}</title>
                                            </Item>
                                        </g>
                                    );
                                })}
                            </Sheet>
                        </Material>
                    );
                })}
            </Parts>
        </>
    );
};

const Item = styled.path`
    vector-effect: non-scaling-stroke;
    stroke: black;
    fill: white;
    &:hover {
        fill: #def;
    }
`;

const Parts = styled.div`
    display: flex;
    gap: 0.75em;
    align-items: start;
    flex-wrap: wrap;
`;

const DPMM = 72.0 / 25.4;

const Material = styled.div`
    display: grid;
    justify-items: center;
`;
const MaterialName = styled.div`
    font-size: 1.5em;
`;
const PartName = styled.div`
    padding: 0.25em 0.5em;
    font-size: 1.5em;
    border-bottom: 1px solid #fff3;
`;

const Svg = styled.svg`
    background: #ccc;
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
