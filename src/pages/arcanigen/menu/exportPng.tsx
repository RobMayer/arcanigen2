import ActionButton from "!/components/buttons/ActionButton";
import { NumericInput } from "!/components/inputs/NumericInput";
import saveAs from "file-saver";
import { useState } from "react";
import { FONT, FONT_DEFINITIONS } from "../definitions/fonts";

const ExportPNG = () => {
    const [dpi, setDpi] = useState<number>(96);
    return (
        <>
            <ActionButton
                onAction={() => {
                    const canvas = document.getElementById("EXPORT_ME");
                    if (canvas) {
                        const cW = canvas.offsetWidth;
                        const cH = canvas.offsetHeight;
                        const content = canvas.innerHTML;
                        if (content) {
                            encodeFonts(content)
                                .then((res) => {
                                    return rasterize(res, (cW / 96) * dpi, (cH / 96) * dpi).then((res: Blob) => {
                                        return saveAs(res, "arcanigen.png");
                                    });
                                })
                                .catch((e) => {
                                    console.error(e);
                                });
                        }
                    }
                }}
            >
                Export PNG
            </ActionButton>
            <span>DPI:</span> <NumericInput value={dpi} min={1} onValidValue={setDpi} variant={"small"} />
        </>
    );
};

export default ExportPNG;

const rasterize = (svgString: string, width: number, height: number) => {
    return new Promise((resolve, reject) => {
        const svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d", { alpha: true });
            if (context) {
                context.drawImage(image, 0, 0, width, height);
                context.canvas.toBlob(resolve);
            } else {
                reject("context failed");
            }
        };
        image.src = URL.createObjectURL(svg);
    });
};

const encodeFonts = (svgString: string) => {
    return Promise.all(
        Object.keys(FONT_DEFINITIONS).map((font: FONT) => {
            return fetch(FONT_DEFINITIONS[font].url).then((response) => {
                if (response.ok) {
                    return response
                        .blob()
                        .then(blobToBase64)
                        .then((data: string) => {
                            return { data, key: font };
                        });
                }
                return Promise.reject(response.statusText);
            });
        })
    ).then((results) => {
        return results.reduce((acc, { key, data }) => {
            return acc.replace(`url('${FONT_DEFINITIONS[key].url}')`, `url(${data})`);
        }, svgString);
    });
};
const blobToBase64 = (blob: Blob): Promise<string> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
    });
};
