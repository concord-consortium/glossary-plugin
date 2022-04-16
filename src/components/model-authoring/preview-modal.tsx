import * as React from "react";
import { useEffect, useState } from "react";
import { IGlossary, IWordDefinition } from "../../types";
import { Modal } from "./modal";
import { TermPopUpPreview } from "./term-popup-preview";

import * as css from "./preview-modal.scss";

interface IProps {
  terms: IWordDefinition[]
  glossary: IGlossary;
  onClose: () => void
}

export const PreviewModal = ({ terms, glossary, onClose }: IProps) => {
  const [index, setIndex] = useState(0)
  const [sortedTerms, setSortedTerms] = useState<IWordDefinition[]>(terms)

  useEffect(() => {
    setSortedTerms(terms.slice().sort((a, b) => a.word.localeCompare(b.word)))
  }, [terms])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => setIndex(parseInt(e.target.value, 10))
  const handleNext = () => setIndex((index + 1) % sortedTerms.length)
  const handlePrev = () => setIndex(index === 0 ? sortedTerms.length - 1 : index - 1)

  return (
    <Modal onClose={onClose} title="Preview Terms" contentStyle={{width: 600}}>
      <div className={css.previewModal}>
        <div className={css.select}>
          <strong>Term</strong>
          <select value={index} onChange={handleSelect}>
            {sortedTerms.map((term, i) => <option key={i} value={i}>{term.word}</option>)}
          </select>
        </div>

        <TermPopUpPreview term={sortedTerms[index]} settings={glossary} translations={glossary.translations || {}}/>

        <div className={css.buttons}>
          <button onClick={handlePrev}>&lt;&lt; Previous Term</button>
          <button onClick={handleNext}>Next Term &gt;&gt;</button>
        </div>
      </div>
    </Modal>
  )
}