import ActionButton from "!/components/buttons/ActionButton";
import saveAs from "file-saver";

const ExportSVG = () => {
   return (
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
   );
};

export default ExportSVG;
