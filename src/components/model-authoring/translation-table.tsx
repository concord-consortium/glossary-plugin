import * as React from "react";
import { translate } from "../../i18n-context";
import { ITranslationMap, IWordDefinition } from "../../types";
import { term, TextKey } from "../../utils/translation-utils";
import { ITranslatedWordDefinition } from "./glossary-translations";

import * as css from "./shared-table.scss";

interface ITranslationTableRowProps {
  lang: string;
  translations: ITranslationMap;
  definition: ITranslatedWordDefinition;
  onDelete: (definition: IWordDefinition) => void;
  onEdit: (definition: IWordDefinition) => void;
}

export const TranslationTableRow = (props: ITranslationTableRowProps) => {
  const handleDelete = () => props.onDelete(props.definition);
  const handleEdit = () => props.onEdit(props.definition);
  const { word, translatedWord, translatedDefinition, hasTranslatedImageCaption, hasImageCaption, hasTranslatedVideoCaption, hasVideoCaption } = props.definition;

  return (
    <tr key={word}>
      <td>{word}</td>
      <td>{translatedWord}</td>
      <td>{translatedDefinition}</td>
      <td className={css.centered}>{hasTranslatedImageCaption ? "✓" : (hasImageCaption ? "✗" : "")}</td>
      <td className={css.centered}>{hasTranslatedVideoCaption ? "✓" : (hasVideoCaption ? "✗" : "")}</td>
      <td className={css.actions}>
        <span onClick={handleEdit}>EDIT</span>
        <span onClick={handleDelete}>DELETE</span>
      </td>
    </tr>
  );
};

interface ITranslationTableProps {
  lang: string;
  definitions: ITranslatedWordDefinition[];
  translations: ITranslationMap;
  onDelete: (definition: IWordDefinition) => void
  onEdit: (definition: IWordDefinition) => void
}

export const TranslationTable = ({lang, translations, definitions, onDelete, onEdit}: ITranslationTableProps) => {
  return (
    <table className={css.sharedTable}>
      <thead>
        <tr>
          <th>Term</th>
          <th>Translated Term</th>
          <th className={css.definition}>Translated Definition</th>
          <th>Image Caption</th>
          <th>Video Caption</th>
          <th className={css.actions}>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {definitions.map(definition => (
          <TranslationTableRow
            key={definition.word}
            definition={definition}
            lang={lang}
            translations={translations}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </tbody>
    </table>
  )
}