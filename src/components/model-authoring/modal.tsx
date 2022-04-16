import * as React from "react";

import * as css from "./modal.scss";

interface IProps {
  contentClassName: string;
  children: any
  onClose: () => void
}

export const Modal = ({ contentClassName, children, onClose }: IProps) => {
  return (
    <>
      <div className={css.container}>
        <div className={css.background} onClick={onClose}/>
        <div className={`${css.content} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </>
  )
}