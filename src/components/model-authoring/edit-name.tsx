import * as React from "react";
import { useState } from "react";

import * as css from "./edit-name.scss";

interface IProps {
  name: string;
  saveName: (name: string) => void;
}

export const EditName = ({ name, saveName }: IProps) => {
  const [newName, setNewName] = useState<string>(name);
  const [editing, setEditing] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleSave = () => {
    saveName(newName);
    setEditing(false);
  }

  return (
    <>
      <input value={newName} disabled={!editing} onChange={handleChange} />
      {editing ?
        <button className={css.button} onClick={handleSave}>Save</button>
        :
        <button className={css.button} onClick={handleEditClick}>Edit</button>
      }
    </>
  )
}