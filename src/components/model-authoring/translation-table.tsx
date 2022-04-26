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
  canEdit: boolean;
  onDelete: (definition: IWordDefinition) => void;
  onEdit: (definition: IWordDefinition) => void;
}

export const TranslationTableRow = (props: ITranslationTableRowProps) => {
  const {canEdit} = props
  const handleDelete = () => props.onDelete(props.definition);
  const handleEdit = () => props.onEdit(props.definition);
  const { word, translatedWord, translatedDefinition, hasTranslatedImageCaption, hasImageCaption, hasTranslatedVideoCaption, hasVideoCaption, hasTranslatedDiggingDeeper, hasDiggingDeeper } = props.definition;

  return (
    <tr key={word}>
      <td>{word}</td>
      <td>{translatedWord}</td>
      <td>{translatedDefinition}</td>
      <td className={css.centered}>{hasTranslatedDiggingDeeper ? "✓" : (hasDiggingDeeper ? "✗" : "")}</td>
      <td className={css.centered}>{hasTranslatedImageCaption ? "✓" : (hasImageCaption ? "✗" : "")}</td>
      <td className={css.centered}>{hasTranslatedVideoCaption ? "✓" : (hasVideoCaption ? "✗" : "")}</td>
      <td className={css.actions}>
        <span onClick={handleEdit}>{canEdit ? "EDIT" : "VIEW"}</span>
        {canEdit && <span onClick={handleDelete}>DELETE</span>}
      </td>
    </tr>
  );
};

interface ITranslationTableProps {
  lang: string;
  definitions: ITranslatedWordDefinition[];
  translations: ITranslationMap;
  canEdit: boolean;
  onDelete: (definition: IWordDefinition) => void
  onEdit: (definition: IWordDefinition) => void
}

export const TranslationTable = ({lang, translations, definitions, canEdit, onDelete, onEdit}: ITranslationTableProps) => {
  return (
    <table className={css.sharedTable}>
      <thead>
        <tr>
          <th>Term</th>
          <th>Translated Term</th>
          <th className={css.definition}>Translated Definition</th>
          <th>Digging Deeper</th>
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
            canEdit={canEdit}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </tbody>
    </table>
  )
}