import * as React from "react";
import { useEffect, useState } from "react";

import { IGlossary, IWordDefinition } from "../../types";
import { Panel } from "./panel";
import { Modal } from "./modal";
import { DefinitionTable, DefinitionTableRow } from "./definition-table";
import { DefinitionForm, IWordDefinitionFormErrors, NextAddAction, NextEditAction } from "./definition-form";

import * as css from "./glossary-terms-definitions.scss";
interface IProps {
  glossary: IGlossary;
  saveDefinitions: (definitions: IWordDefinition[]) => void;
}

export const GlossaryTermsDefinitions = ({ glossary, saveDefinitions }: IProps) => {
  const {definitions} = glossary
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "updated">("asc")
  const [sortedDefinitions, setSortedDefinitions] = useState<IWordDefinition[]>(definitions)
  const [modal, setModal] = useState<number | IWordDefinition | undefined>(undefined)

  const isWordDefined = (word: string) => definitions.find(d => d.word === word) !== undefined
  const isValidUrl = (url?: string) => url ? url.startsWith("http") : true

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as any)
  }

  const handleDeleteDefinition = (definition: IWordDefinition) => {
    if (confirm(`Are you sure you want to delete the definition of ${definition.word}?`)) {
      const remaining = definitions.filter(d => d !== definition)
      saveDefinitions(remaining)
    }
  }

  const handleShowAddDefinition = () => setModal(Date.now()) // Date.now() ensures that we redraw the form on each new add term click as we use it as the model key

  const handleShowEditDefinition = (definition: IWordDefinition) => setModal(definition)

  const handleCloseModal = () => setModal(undefined)

  const handleAddDefinition = (newDefinition: IWordDefinition, next: NextAddAction) => {
    const errors: IWordDefinitionFormErrors = {}

    checkUpdatedDefinition(newDefinition, errors, true)

    if (Object.keys(errors).length === 0) {
      newDefinition.updatedAt = Date.now()
      const newDefinitions = definitions.slice()
      newDefinitions.push(newDefinition)

      saveDefinitions(newDefinitions)
      switch (next) {
        case "save":
          handleCloseModal()
          break
        case "save and add another":
          handleShowAddDefinition()
          break
      }
    }

    return errors;
  }

  const handleEditDefinition = (existingDefinition: IWordDefinition, updatedDefinition: IWordDefinition, next: NextEditAction) => {
    const errors: IWordDefinitionFormErrors = {}

    checkUpdatedDefinition(updatedDefinition, errors, existingDefinition.word !== updatedDefinition.word)

    if (Object.keys(errors).length === 0) {
      updatedDefinition.updatedAt = Date.now()
      const newDefinitions = definitions.slice()
      const index = definitions.findIndex(d => d.word === existingDefinition.word)
      newDefinitions[index] = updatedDefinition
      saveDefinitions(newDefinitions)

      const sortedIndex = sortedDefinitions.findIndex(d => d.word === existingDefinition.word)
      const nextIndex = (sortedIndex + 1) % sortedDefinitions.length
      const prevIndex = sortedIndex === 0 ? sortedDefinitions.length - 1 : sortedIndex - 1

      switch (next) {
        case "save":
          handleCloseModal()
          break
        case "save and edit previous":
          setModal(sortedDefinitions[prevIndex])
          break
        case "save and edit next":
          setModal(sortedDefinitions[nextIndex])
          break
      }
    }

    return errors;
  }

  const checkUpdatedDefinition = (updatedDefinition: IWordDefinition, errors: IWordDefinitionFormErrors, checkForExistingWord: boolean) => {
    if (updatedDefinition.word === "") {
      errors.word = "Term is required"
    } else if (checkForExistingWord && isWordDefined(updatedDefinition.word)) {
      errors.word = "Term is already defined"
    }
    if (updatedDefinition.definition === "") {
      errors.definition = "Definition is required"
    }
    if (!isValidUrl(updatedDefinition.image)) {
      errors.image = "Image URL does not appear to be valid"
    }
    if (!isValidUrl(updatedDefinition.zoomImage)) {
      errors.zoomImage = "Zoom Image URL does not appear to be valid"
    }
    if (!isValidUrl(updatedDefinition.video)) {
      errors.video = "Video URL does not appear to be valid"
    }
  }

  const renderModal = () => {

    if (typeof modal === "number") {
      return (
        <Modal contentClassName="" onClose={handleCloseModal}>
          <DefinitionForm type="add" key={modal} onAdd={handleAddDefinition} onCancel={handleCloseModal} />
        </Modal>
      )
    } else if (modal) {
      return (
        <Modal contentClassName="" onClose={handleCloseModal}>
          <DefinitionForm type="edit" key={modal.word} definition={modal} onEdit={handleEditDefinition} onCancel={handleCloseModal} />
        </Modal>
      )
    }
  }

  useEffect(() => {
    const sorted = definitions.slice()
    sorted.sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          return a.word.localeCompare(b.word)
        case "desc":
          return b.word.localeCompare(a.word)
        case "updated":
          return (b.updatedAt || 0) - (a.updatedAt || 0)
      }
    })
    setSortedDefinitions(sorted)
  }, [definitions, sortOrder])

  return (
    <Panel label="Glossary Terms & Definitions" collapsible={true} minHeight={500} contentClassName={css.glossaryTermsDefinitions} >
      <div className={css.header}>
        <button onClick={handleShowAddDefinition}>+ Add New Term</button>
        <div>
          <strong>Sort by</strong>
          <select value={sortOrder} onChange={handleSortOrder}>
            <option value="asc">A to Z</option>
            <option value="desc">Z to A</option>
            <option value="updated">Most Recently Updated</option>
          </select>
        </div>
      </div>
      {sortedDefinitions.length > 0 && <DefinitionTable definitions={sortedDefinitions} onDelete={handleDeleteDefinition} onEdit={handleShowEditDefinition} />}
      {modal && renderModal()}
    </Panel>
  )
}