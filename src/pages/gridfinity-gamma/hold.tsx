const ItemLayout2 = ({ selected }: { selected: number }) => {
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

        const materials = Object.keys(byThickness).reduce<{ [key: string]: { width: number; height: number; items: PackedOf<{ path: string; name: string; thickness: PhysicalLength }>[] }[] }>(
            (acc, k) => {
                const shapes = byThickness[k].map(({ width, height, ...payload }) => ({
                    width,
                    height,
                    payload,
                }));
                const [sheets, cannotFit] = packFixed(300, 300, shapes);
                acc[k] = sheets.map((items) => {
                    const sheet = {
                        width: -Infinity,
                        height: -Infinity,
                        items,
                    };
                    items.forEach((item) => {
                        sheet.width = Math.max(sheet.width, item.x + item.width);
                        sheet.height = Math.max(sheet.height, item.y + item.height);
                    });
                    return sheet;
                });
                return acc;
            },
            {}
        );

        return (
            <>
                {Object.entries(materials).map(([thickness, sheets]) => {
                    return (
                        <Material key={thickness}>
                            <MatThickness>{thickness}</MatThickness>
                            {sheets.map(({ width, height, items }, i) => {
                                return (
                                    <Sheet width={width} height={height} margin={margin} key={i}>
                                        {items.map((obj, j) => {
                                            const rot = obj.rotated ? `rotate(90, 0, 0)` : "";
                                            const pos = `translate(${margin + obj.x + obj.width / 2},${margin + obj.y + obj.height / 2})`;
                                            return (
                                                <g key={`${i}_${j}`}>
                                                    <Item d={`${obj.payload.path}`} transform={`${pos} ${rot}`}>
                                                        <title>{obj.payload.name}</title>
                                                    </Item>
                                                </g>
                                            );
                                        })}
                                    </Sheet>
                                );
                            })}
                        </Material>
                    );
                })}
            </>
        );
    }, []);

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
