import * as React from "react";
import { useRef, useState } from "react";
import { IProject } from "../../types";

import * as css from "./edit-project.scss";

interface IProps {
  project: IProject | null;
  projects: IProject[];
  canEdit: boolean;
  saveProject: (project: IProject|null) => void;
}

export const EditProject = ({ project, projects, canEdit, saveProject }: IProps) => {
  const [newProject, setNewProject] = useState<IProject|null>(project);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const focusInput = () => setTimeout(() => selectRef.current?.focus(), 1)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10)
    setNewProject(projects.find(p => p.id === id) || null);
  }

  const handleEdit = () => {
    setEditing(true)
    setError(null);
    focusInput()
  }

  const handleSave = () => {
    saveProject(newProject);
    setEditing(false);
    setError(null);
  }

  const handleCancel = () => {
    setNewProject(project);
    setEditing(false);
    setError(null);
  }

  const renderButtons = () => {
    if (canEdit) {
      return (
        editing ? (
        <>
          <button onClick={canEdit ? handleSave : handleCancel}>Save Project</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
        ) : <button onClick={handleEdit}>Edit Project</button>
      )
    }
  }

  // ensure that the selected project is in the project list so that is displayed even if the user doesn't have access to the project
  const projectList = [...projects];
  if (project) {
    if (!projectList.find(p => p.id === project.id)) {
      projectList.push(project);
    }
  }

  return (
    <div className={css.editProject}>
      <div className={css.inputs}>
        <select value={newProject?.id || 0} disabled={!editing} onChange={handleChange} ref={selectRef}>
          <option key="0" value={0} />
          {projectList.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        {renderButtons()}
      </div>
      {error && <div className={css.error}>{error}</div>}
    </div>
  )
}
