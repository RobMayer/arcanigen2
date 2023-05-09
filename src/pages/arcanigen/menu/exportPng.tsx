import ActionButton from "!/components/buttons/ActionButton";
import NumberInput from "!/components/inputs/NumberInput";
import saveAs from "file-saver";
import { useState } from "react";
import { FONT_DEFINITIONS } from "../definitions/fonts";

const ExportPNG = () => {
   const [dpi, setDpi] = useState<number>(96);
   return (
      <>
         <ActionButton
            onClick={() => {
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
         <span>DPI:</span> <NumberInput value={dpi} min={1} onValidValue={setDpi} className={"small"} />
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
         canvas.width = width * 2;
         canvas.height = height * 2;
         const context = canvas.getContext("2d");
         if (context) {
            context.drawImage(image, 0, 0, width * 2, height * 2);
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
      Object.keys(FONT_DEFINITIONS).map((font) => {
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
