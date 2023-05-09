import ActionButton from "!/components/buttons/ActionButton";
import Modal, { useModal } from "!/components/popups/Modal";
import styled from "styled-components";
import ArcaneGraph from "../definitions/graph";
import { Fragment } from "react";

const EXAMPLE_CATEGORIES = [
   {
      name: "Node by Node",
      contents: ["vertexArray", "spiralArray", "clusterArray", "portals"],
   },
];

const EXAMPLE_DATA: { [key: string]: IExample } = {
   vertexArray: {
      name: "Vertex Arrays",
      description: "Clones are meant to be expendable.",
   },
   spiralArray: {
      name: "Spiral Arrays",
      description: "You spin me right round baby...",
   },
   clusterArray: {
      name: "Cluster Arrays",
      description: "Come together / right now / over me.",
   },
   portals: {
      name: "Portals",
      description: "Now you're thinking with them...",
   },
};

const LoadExample = styled(({ className }: { className?: string }) => {
   const modalControls = useModal();

   return (
      <>
         <Modal controls={modalControls} label={"Load Examples"}>
            <div className={className}>
               {EXAMPLE_CATEGORIES.map((category, i) => {
                  return (
                     <Fragment key={category.name}>
                        <SectionHeader>{category.name}</SectionHeader>
                        {category.contents.map((k) => {
                           return <Card onLoad={modalControls.close} key={k} id={k} data={EXAMPLE_DATA[k]} />;
                        })}
                     </Fragment>
                  );
               })}
            </div>
         </Modal>
         <ActionButton onClick={modalControls.open}>Load Example</ActionButton>
      </>
   );
})`
   display: grid;
   max-width: 80vw;
   width: auto;
   grid-template-columns: repeat(auto-fit, 600px);
   gap: 0.5em;
`;

export default LoadExample;

type IExample = {
   name: string;
   description?: string;
   image?: string;
   file?: string;
};

const SectionHeader = styled.div`
   grid-column: 1 / -1;
   font-size: 1.5em;
   padding-inline: 0.25em;
   border-bottom: 1px solid var(--effect-border-highlight);
`;

const Card = styled(({ className, onLoad, id, data }: { className?: string; data: IExample; id: string; onLoad: () => void }) => {
   const { load } = ArcaneGraph.useGraph();

   const modalControls = useModal();

   return (
      <>
         <Modal controls={modalControls} label={"Double-checking"}>
            You will lose your work.
            <ConfirmOptions>
               <ActionButton
                  onClick={() => {
                     fetch(`/examples/${data.file ?? id}.trh`)
                        .then((res) => {
                           if (res.ok) {
                              return res.json();
                           }
                           return Promise.reject(res.statusText);
                        })
                        .then((json) => {
                           load(json);
                           modalControls.close();
                           onLoad();
                        })
                        .catch((e) => {
                           console.error(e);
                        });
                  }}
                  flavour={"danger"}
               >
                  Proceed
               </ActionButton>
               <ActionButton onClick={modalControls.close}>Nevermind</ActionButton>
            </ConfirmOptions>
         </Modal>
         <div className={className}>
            <Thumbnail src={`/examples/${data.image ?? `${id}.png`}`} alt={id} />
            <Name>{data.name}</Name>
            <Desc>{data.description}</Desc>
            <LoadButton onClick={modalControls.open}>Load {data.name}</LoadButton>
         </div>
      </>
   );
})`
   display: grid;
   grid-template-columns: 128px 1fr;
   grid-template-rows: auto 1fr auto;
   gap: 0.5em;
   grid-template-areas:
      "thumbnail name"
      "thumbnail desc"
      "thumbnail button";
   border: 1px solid var(--effect-border-highlight);
   padding: 0.25em;
`;

const ConfirmOptions = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   border-top: 1px solid var(--effect-border-highlight);
`;

const Thumbnail = styled.img`
   aspect-ratio: 1;
   height: auto;
   grid-area: thumbnail;
`;
const Name = styled.div`
   font-size: 1.25em;
   border-bottom: 1px solid var(--effect-border-highlight);
   grid-area: name;
`;
const Desc = styled.div`
   grid-area: desc;
   font-size: 0.875em;
`;

const LoadButton = styled(ActionButton)`
   grid-area: button;
   justify-self: end;
`;
