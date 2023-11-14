import * as React from "react";
import { useEffect, useState } from "react";

import { IGlossary, IWordDefinition } from "../../types";
import { Panel } from "./panel";
import { Modal } from "./modal";
import { DefinitionTable } from "./definition-table";
import { DefinitionForm, IWordDefinitionFormErrors, NextAddAction, NextEditAction } from "./definition-form";
import { PreviewModal } from "./preview-modal";
import Definition from "../plugin/definition";

import * as css from "./glossary-terms-definitions.scss";
import * as icons from "../common/icons.scss";
import * as imageModalCss from "./image-and-video-modal.scss";

interface IImageModal {
  type: "image"
  definition: IWordDefinition
}
interface IVideoModal {
  type: "video"
  definition: IWordDefinition
}
interface IPreviewTerms {
  type: "preview terms"
}
interface IAddModal {
  type: "add term"
  now: number
}
interface IEditModal {
  type: "edit term"
  definition: IWordDefinition
}

export type IModal = IImageModal | IVideoModal | IPreviewTerms | IAddModal | IEditModal;

interface IProps {
  glossary: IGlossary;
  canEdit: boolean;
  saveDefinitions: (definitions: IWordDefinition[]) => void;
}

export const GlossaryTermsDefinitions = ({ glossary, canEdit, saveDefinitions }: IProps) => {
  const {definitions} = glossary;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "created"| "updated">("asc");
  const [sortedDefinitions, setSortedDefinitions] = useState<IWordDefinition[]>(definitions);
  const [modal, setModal] = useState<IModal | undefined>(undefined);
  const [selectedSecondLang, setSelectedSecondLang] = useState("");

  const isWordDefined = (word: string) => definitions.find(d => d.word === word) !== undefined;
  const isValidUrl = (url?: string) => url ? url.startsWith("http") : true;

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as any);
  };

  const handleDeleteDefinition = (definition: IWordDefinition) => {
    if (confirm(`Are you sure you want to permanently delete the definition of ${definition.word}?`)) {
      const remaining = definitions.filter(d => d !== definition);
      saveDefinitions(remaining);
    }
  };

  const handleShowPreviewTerms = () => setModal({type: "preview terms"});

  const handleShowAddDefinition = () => setModal({type: "add term", now: Date.now()}); // Date.now() ensures that we redraw the form on each new add term click as we use it as the model key

  const handleShowEditDefinition = (definition: IWordDefinition) => setModal({type: "edit term", definition});

  const handleShowImageClick = (definition: IWordDefinition) => setModal({type: "image", definition});

  const handleShowVideoClick = (definition: IWordDefinition) => setModal({type: "video", definition});

  const handleCloseModal = () => setModal(undefined);

  const handleAddDefinition = (newDefinition: IWordDefinition, next: NextAddAction) => {
    const errors: IWordDefinitionFormErrors = {};

    checkUpdatedDefinition(newDefinition, errors, true);

    if (Object.keys(errors).length === 0) {
      newDefinition.createdAt = Date.now();
      newDefinition.updatedAt = Date.now();
      const newDefinitions = definitions.slice();
      newDefinitions.push(newDefinition);

      saveDefinitions(newDefinitions);

      switch (next) {
        case "save":
          handleCloseModal();
          break;
        case "save and add another":
          handleShowAddDefinition();
          break;
      }
    }

    return errors;
  };

  const handleEditDefinition = (existingDefinition: IWordDefinition, updatedDefinition: IWordDefinition, next: NextEditAction) => {
    const errors: IWordDefinitionFormErrors = {};

    checkUpdatedDefinition(updatedDefinition, errors, existingDefinition.word !== updatedDefinition.word);

    if (Object.keys(errors).length === 0) {
      updatedDefinition.updatedAt = Date.now();
      const newDefinitions = definitions.slice();
      const index = definitions.findIndex(d => d.word === existingDefinition.word);
      newDefinitions[index] = updatedDefinition;
      saveDefinitions(newDefinitions);

      const sortedIndex = sortedDefinitions.findIndex(d => d.word === existingDefinition.word);
      const nextIndex = (sortedIndex + 1) % sortedDefinitions.length;
      const prevIndex = sortedIndex === 0 ? sortedDefinitions.length - 1 : sortedIndex - 1;

      switch (next) {
        case "save":
          handleCloseModal();
          break;
        case "save and edit previous":
          setModal({type: "edit term", definition: sortedDefinitions[prevIndex]});
          break;
        case "save and edit next":
          setModal({type: "edit term", definition: sortedDefinitions[nextIndex]});
          break;
      }
    }

    return errors;
  };

  const checkUpdatedDefinition = (updatedDefinition: IWordDefinition, errors: IWordDefinitionFormErrors, checkForExistingWord: boolean) => {
    if (updatedDefinition.word === "") {
      errors.word = "Term is required";
    } else if (checkForExistingWord && isWordDefined(updatedDefinition.word)) {
      errors.word = "Term is already defined";
    }
    if (updatedDefinition.definition === "") {
      errors.definition = "Definition is required";
    }
    if (!isValidUrl(updatedDefinition.image)) {
      errors.image = "Image URL does not appear to be valid";
    }
    if (!isValidUrl(updatedDefinition.zoomImage)) {
      errors.zoomImage = "Zoom Image URL does not appear to be valid";
    }
    if (!isValidUrl(updatedDefinition.video)) {
      errors.video = "Video URL does not appear to be valid";
    }
    if (!isValidUrl(updatedDefinition.closedCaptionsUrl)) {
      errors.closedCaptionsUrl = "Closed Captions URL does not appear to be valid";
    }
  };

  const renderModal = () => {
    if (modal) {
      switch (modal.type) {
        case "preview terms":
          return <PreviewModal terms={definitions} glossary={glossary} onClose={handleCloseModal} />;

        case "add term":
          return (
            <Modal onClose={handleCloseModal}>
              <DefinitionForm
                type="add"
                key={modal.now}
                onAdd={handleAddDefinition}
                onCancel={handleCloseModal}
                glossary={glossary}
                canEdit={canEdit}
                selectedSecondLang={selectedSecondLang}
                onSelectSecondLang={setSelectedSecondLang}
              />
            </Modal>
          );

        case "edit term":
          return (
            <Modal onClose={handleCloseModal}>
              <DefinitionForm
                type="edit"
                key={modal.definition.word}
                definition={modal.definition}
                onEdit={handleEditDefinition}
                onCancel={handleCloseModal}
                glossary={glossary}
                canEdit={canEdit}
                selectedSecondLang={selectedSecondLang}
                onSelectSecondLang={setSelectedSecondLang}
              />
            </Modal>
          );

        case "image":
          const image = modal.definition;
          return (
            <Modal onClose={handleCloseModal} title={`Preview Image: ${image.word}`}>
              <div className={imageModalCss.imageAndVideoModal}>
                <Definition
                  word={image.word}
                  definition=""
                  imageUrl={image.image}
                  zoomImageUrl={image.zoomImage}
                  imageCaption={image.imageCaption}
                  autoShowMedia={true}
                  imageAltText={image.imageAltText}
                />
              </div>
            </Modal>
          );

        case "video":
          const video = modal.definition;
          return (
            <Modal onClose={handleCloseModal}  title={`Preview Video: ${video.word}`}>
              <div className={imageModalCss.imageAndVideoModal}>
                <Definition
                  word=""
                  definition=""
                  videoUrl={video.video}
                  videoCaption={video.videoCaption}
                  autoShowMedia={true}
                  videoAltText={video.videoAltText}
                  closedCaptionsUrl={video.closedCaptionsUrl}
                />
              </div>
            </Modal>
          );
      }
    }
  };

  useEffect(() => {
    const sorted = definitions.slice();
    sorted.sort((a, b) => {
      let result: number;
      switch (sortOrder) {
        case "asc":
          return a.word.localeCompare(b.word);
        case "desc":
          return b.word.localeCompare(a.word);
        case "created":
          result = (b.createdAt || 0) - (a.createdAt || 0);
          return result || a.word.localeCompare(b.word);
        case "updated":
          result = (b.updatedAt || 0) - (a.updatedAt || 0);
          return result || a.word.localeCompare(b.word);
      }
    });
    setSortedDefinitions(sorted);
  }, [definitions, sortOrder]);

  const haveDefinitions = definitions.length > 0;

  const panelLabel = `Glossary Terms & Definitions (${definitions.length})`;

  return (
    <Panel label={panelLabel} collapsible={true}>
      <div className={css.glossaryTermsDefinitions}>
        <div className={css.header}>
          <div className={css.buttons}>
            {canEdit &&
            <button className={css.addTermButton} onClick={handleShowAddDefinition}>
              <span className={icons.iconPlusSmall}/>
              <div>Add New Term</div>
            </button>}
            {haveDefinitions && <button onClick={handleShowPreviewTerms}>Preview Terms</button>}
          </div>
          <div>
            <strong>Sort by</strong>
            <select value={sortOrder} onChange={handleSortOrder}>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
              <option value="created">Newest</option>
              <option value="updated">Most Recently Updated</option>
            </select>
          </div>
        </div>
        {haveDefinitions && (
          <DefinitionTable
            definitions={sortedDefinitions}
            onDelete={handleDeleteDefinition}
            onEdit={handleShowEditDefinition}
            onImageClick={handleShowImageClick}
            onVideoClick={handleShowVideoClick}
            modal={modal}
            canEdit={canEdit}
          />
        )}
        {modal && renderModal()}
      </div>
    </Panel>
  );
};
