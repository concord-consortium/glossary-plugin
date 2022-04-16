import * as React from "react";
import { IWordDefinition } from "../../types";

import * as css from "./definition-table.scss";

const imageButton = (
  <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <title>Image Button</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Definition-Recording" transform="translate(-1372.000000, -290.000000)">
            <g id="Image-Button" transform="translate(1372.500000, 290.500000)">
                <polygon id="Path" fill="#646464" points="0 18 18 18 18 0 0 0" />
                <polygon id="Path" fill="#FFFFFF" points="2.57142857 15.4285714 15.4285714 15.4285714 15.4285714 2.57142857 2.57142857 2.57142857" />
                <path d="M4.28571429,4.28571429 L4.28571429,7.28571429 C4.28571429,6.33942857 5.05371429,5.57142857 6,5.57142857 C6.94628571,5.57142857 7.71428571,6.33942857 7.71428571,7.28571429 C7.71428571,8.232 6.94628571,9 6,9 C5.05371429,9 4.28571429,8.232 4.28571429,7.28571429 L4.28571429,13.5 L6.85714286,10.2857143 L8.05714286,11.4857143 L11.1428571,6.85714286 L13.7142857,11.4857143 L13.7142857,4.28571429 L4.28571429,4.28571429 Z" id="Fill-2" fill="#646464" />
            </g>
        </g>
    </g>
  </svg>
);

const videoButton = (
  <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <title>Video Button</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Definition-Recording" transform="translate(-1413.000000, -290.000000)">
            <g id="Video-Button" transform="translate(1413.500000, 290.500000)">
                <polygon id="Path" fill="#646464" points="0 18 18 18 18 0 0 0" />
                <path d="M15.4285714,14.5714286 C15.4285714,15.0445714 15.0454286,15.4285714 14.5714286,15.4285714 L3.42857143,15.4285714 C2.95457143,15.4285714 2.57142857,15.0445714 2.57142857,14.5714286 L2.57142857,3.42857143 C2.57142857,2.95542857 2.95457143,2.57142857 3.42857143,2.57142857 L14.5714286,2.57142857 C15.0454286,2.57142857 15.4285714,2.95542857 15.4285714,3.42857143 L15.4285714,14.5714286 Z" id="Path" fill="#FFFFFF" />
                <polygon id="Fill-3" fill="#646464" points="6.42857143 13.2857143 12.4285714 9 6.42857143 4.71428571" />
            </g>
        </g>
    </g>
  </svg>
);

interface IDefinitionTableRowProps {
  definition: IWordDefinition;
  onDelete: (definition: IWordDefinition) => void;
  onEdit: (definition: IWordDefinition) => void;
}

export const DefinitionTableRow = (props: IDefinitionTableRowProps) => {
  const handleDelete = () => props.onDelete(props.definition);
  const handleEdit = () => props.onEdit(props.definition);
  const { word, definition, image, video } = props.definition;

  return (
    <tr key={word}>
      <td>{word}</td>
      <td>{definition}</td>
      <td className={css.centered}>{(image || "").length > 0 ? imageButton : undefined}</td>
      <td className={css.centered}>{(video || "").length > 0 ? videoButton : undefined}</td>
      <td className={css.actions}>
        <span onClick={handleEdit}>EDIT</span>
        <span onClick={handleDelete}>DELETE</span>
      </td>
    </tr>
  );
};

interface IDefinitionTableProps {
  definitions: IWordDefinition[];
  onDelete: (definition: IWordDefinition) => void
  onEdit: (definition: IWordDefinition) => void
}

export const DefinitionTable = ({definitions, onDelete, onEdit}: IDefinitionTableProps) => {
  return (
    <table className={css.definitionTable}>
      <thead>
        <tr>
          <th>Term</th>
          <th className={css.definition}>Definition</th>
          <th>Image</th>
          <th>Video</th>
          <th className={css.actions}>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {definitions.map(definition => (
          <DefinitionTableRow
            key={definition.word}
            definition={definition}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </tbody>
    </table>
  )
}