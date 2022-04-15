import * as React from "react";
import { useRef, useState } from "react";

import * as css from "./edit-name.scss";

interface IProps {
  name: string;
  saveName: (name: string) => void;
}

export const EditName = ({ name, saveName }: IProps) => {
  const [newName, setNewName] = useState<string>(name);
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }

  const handleEdit = () => {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 1)
  }

  const handleSave = () => {
    saveName(newName);
    setEditing(false);
  }

  const handleCancel = () => {
    setNewName(name);
    setEditing(false);
  }

  return (
    <div className={css.editName}>
      <input value={newName} disabled={!editing} onChange={handleChange} ref={inputRef} />
      {editing ?
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
        :
        <button onClick={handleEdit}>Edit</button>
      }
    </div>
  )
}