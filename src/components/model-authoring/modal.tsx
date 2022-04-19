import { String } from "aws-sdk/clients/apigateway";
import * as React from "react";
import { useEffect } from "react";

import * as css from "./modal.scss";

interface IProps {
  children: any
  title?: string
  width?: number
  onClose: () => void
}

export const Modal = ({ title, width, children, onClose }: IProps) => {

  useEffect(() => {
    const listenForEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", listenForEscape)
    return () => window.removeEventListener("keydown", listenForEscape)
  }, [])

  const renderTitle = () => {
    if (title) {
      return (
        <div className={css.header}>
          {title}
          {onClose && <span onClick={onClose}><strong>X</strong></span>}
        </div>
      )
    }
  }

  const style: React.CSSProperties = width ? {width} : {}

  return (
    <>
      <div className={css.container}>
        <div className={css.background} onClick={onClose}/>
        <div className={css.content} style={style}>
          {renderTitle()}
          {children}
        </div>
      </div>
    </>
  )
}