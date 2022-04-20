import * as React from "react";
import { IWordDefinition } from "../../types";
import { IModal } from "./glossary-terms-definitions";

import * as css from "./shared-table.scss";

const imageButton = (
  <svg id="Image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <title>Preview Image</title>
    <path id="Image_icon" data-name="Image icon" d="M0,0V21H21V0ZM18,18H3V3H18ZM16,5v8.4L13,8,9.4,13.4,8,12,5,15.75V8.5a2,2,0,1,0,2-2,2,2,0,0,0-2,2V5Z" />
  </svg>
);

const videoButton = (
  <svg id="Video" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <title>Preview Video</title>
    <path id="Video_icon" data-name="Video icon" d="M0,0V21H21V0ZM18,17a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3H17a1,1,0,0,1,1,1ZM7.5,5.5l7,5-7,5Z" />
  </svg>
);

interface IDefinitionTableRowProps {
  definition: IWordDefinition;
  modal?: IModal;
  onDelete: (definition: IWordDefinition) => void;
  onEdit: (definition: IWordDefinition) => void;
  onImageClick: (definition: IWordDefinition) => void;
  onVideoClick: (definition: IWordDefinition) => void;
}

export const DefinitionTableRow = (props: IDefinitionTableRowProps) => {
  const handleDelete = () => props.onDelete(props.definition);
  const handleEdit = () => props.onEdit(props.definition);
  const { word, definition, image, video } = props.definition;

  const handleImageClick = () => props.onImageClick(props.definition);
  const handleVideoClick = () => props.onVideoClick(props.definition);

  const imageModalShowing = props.modal?.type === "image" && props.modal?.definition === props.definition;
  const videoModalShowing = props.modal?.type === "video" && props.modal?.definition === props.definition;

  const imageSpanClassName = imageModalShowing ? css.active : "";
  const videoSpanClassName = videoModalShowing ? css.active : "";

  return (
    <tr key={word}>
      <td>{word}</td>
      <td>{definition}</td>
      <td className={css.centered}>{(image || "").length > 0 ? <span className={imageSpanClassName} onClick={handleImageClick}>{imageButton}</span> : undefined}</td>
      <td className={css.centered}>{(video || "").length > 0 ? <span className={videoSpanClassName} onClick={handleVideoClick}>{videoButton}</span> : undefined}</td>
      <td className={css.actions}>
        <span onClick={handleEdit}>EDIT</span>
        <span onClick={handleDelete}>DELETE</span>
      </td>
    </tr>
  );
};

interface IDefinitionTableProps {
  definitions: IWordDefinition[];
  modal?: IModal;
  onDelete: (definition: IWordDefinition) => void
  onEdit: (definition: IWordDefinition) => void
  onImageClick: (definition: IWordDefinition) => void;
  onVideoClick: (definition: IWordDefinition) => void;
}

export const DefinitionTable = ({ definitions, modal, onDelete, onEdit, onImageClick, onVideoClick }: IDefinitionTableProps) => {
  return (
    <table className={css.sharedTable}>
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
            modal={modal}
            onDelete={onDelete}
            onEdit={onEdit}
            onImageClick={onImageClick}
            onVideoClick={onVideoClick}
          />
        ))}
      </tbody>
    </table>
  )
}