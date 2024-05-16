import ActionButton from "!/components/buttons/ActionButton";
import saveAs from "file-saver";
import ArcaneGraph from "../definitions/graph";

const SaveGraph = () => {
    const { save } = ArcaneGraph.useGraph();

    return (
        <ActionButton
            onAction={() => {
                const theBlob = new Blob([JSON.stringify(save())], { type: "application/json;charset=utf-8" });
                saveAs(theBlob, "arcanigen.trh");
            }}
        >
            Save Graph
        </ActionButton>
    );
};

export default SaveGraph;
