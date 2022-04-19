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
  const [error, setError] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 1)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }

  const handleEdit = () => {
    setEditing(true)
    setError(null);
    focusInput()
  }

  const handleSave = () => {
    const trimmedName = newName.trim()
    if (trimmedName.length) {
      saveName(trimmedName);
      setNewName(trimmedName);
      setEditing(false);
      setError(null);
    } else {
      setError("Glossary name cannot be empty");
      focusInput()
    }
  }

  const handleCancel = () => {
    setNewName(name);
    setEditing(false);
    setError(null);
  }

  return (
    <div className={css.editName}>
      <div className={css.inputs}>
        <input value={newName} disabled={!editing} onChange={handleChange} ref={inputRef} />
        {editing ?
          <>
            <button onClick={handleSave}>Save Name</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
          :
          <button onClick={handleEdit}>Edit Name</button>
        }
      </div>
      {error && <div className={css.error}>{error}</div>}
    </div>
  )
}
