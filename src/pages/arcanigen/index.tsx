/** @scope default .. */

import Page from "!/components/content/Page";
import styled from "styled-components";
// import NodeView from "./nodeView";
import { HTMLAttributes, useState } from "react";
import NodeView from "./nodeView";
import OutputView from "./outputView";
import ArcaneGraph from "./definitions/graph";
import ActionButton from "!/components/buttons/ActionButton";
import { saveAs } from "file-saver";
import { IArcaneGraph } from "./definitions/types";
import Modal, { useModal } from "!/components/popups/Modal";
import NumberInput from "!/components/inputs/NumberInput";
import { FONT_DEFINITIONS } from "./definitions/fonts";
// import OutputView from "./outputView";
// import { StateProvider } from "./state";

const ArcanigenPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   return (
      <Page {...props}>
         <ArcaneGraphMenu />
         <NodeView />
         <OutputView />
      </Page>
   );
})`
   display: grid;
   grid-template-columns: 1fr 1fr;
   grid-template-rows: auto 1fr;
   gap: 0.25em;
   padding: 0.25em;
   place-content: stretch;
`;

export default ArcanigenPage;

type UploadJson = {
   version: string;
   nodes: IArcaneGraph["nodes"];
   links: IArcaneGraph["links"];
   positions: { [key: string]: { x: number; y: number } };
   toggles: { [key: string]: { node: boolean; [key: string]: boolean } };
};

const handleUpload = (element: HTMLInputElement, file: File, dispatch: (value: UploadJson) => void) => {
   if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (evt) => {
         if (evt?.target?.result && typeof evt.target.result === "string") {
            try {
               const json = JSON.parse(evt.target.result) as UploadJson;
               if (json) {
                  dispatch(json);
               } else {
                  console.error("problem parsing uploaded file");
               }
            } catch (e) {
               console.error("problem parsing json");
            } finally {
               element.value = "";
            }
         }
      };
      reader.onerror = (evt) => {
         console.error("problem reading file");
         element.value = "";
      };
   }
};

const ArcaneGraphMenu = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   const { save, load, reset } = ArcaneGraph.useGraph();
   const [dpi, setDpi] = useState<number>(96);

   const modalControls = useModal();

   return (
      <>
         <Modal controls={modalControls} label={"Double-checking"}>
            Are you sure you wish to reset?
            <ModalOptions>
               <ActionButton
                  onClick={() => {
                     reset();
                     modalControls.close();
                  }}
                  flavour={"danger"}
               >
                  Proceed
               </ActionButton>
               <ActionButton onClick={modalControls.close}>Nevermind</ActionButton>
            </ModalOptions>
         </Modal>
         <div {...props}>
            <ActionButton
               onClick={() => {
                  const theBlob = new Blob([JSON.stringify(save())], { type: "application/json;charset=utf-8" });
                  saveAs(theBlob, "arcanigen.trh");
               }}
            >
               Save
            </ActionButton>
            <ActionButton onClick={NOOP}>
               Load
               <input
                  type="file"
                  onChange={(e) => {
                     const thing = e.target.files?.[0];
                     if (thing) {
                        handleUpload(e.target, thing, load);
                     }
                  }}
                  accept=".trh"
               />
            </ActionButton>
            <ActionButton
               onClick={() => {
                  const content = document.getElementById("EXPORT_ME")?.innerHTML;
                  if (content) {
                     const theBlob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
                     saveAs(theBlob, "arcanigen.svg");
                  }
               }}
            >
               Export SVG
            </ActionButton>
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
            <ActionButton flavour={"danger"} onClick={modalControls.open}>
               Reset
            </ActionButton>
            {/* <ActionButton flavour={"info"} onClick={debug} title={"outputs the current state into the console"}>
               <Icon icon={faBug} />
            </ActionButton> */}
         </div>
      </>
   );
})`
   display: flex;
   grid-column: 1 / -1;
   border: 1px solid var(--effect-border-highlight);
   align-items: center;
`;

const NOOP = () => {};

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

const ModalOptions = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   border-top: 1px solid var(--effect-border-highlight);
`;

const blobToBase64 = (blob: Blob): Promise<string> => {
   const reader = new FileReader();
   reader.readAsDataURL(blob);
   return new Promise((resolve) => {
      reader.onloadend = () => {
         resolve(reader.result as string);
      };
   });
};
