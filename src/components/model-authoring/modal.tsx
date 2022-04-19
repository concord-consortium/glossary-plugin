import { String } from "aws-sdk/clients/apigateway";
import * as React from "react";
import { useEffect } from "react";

import * as css from "./modal.scss";

interface IProps {
  children: any
  title?: string
  contentStyle?: React.CSSProperties
  onClose: () => void
}

export const Modal = ({ title, contentStyle, children, onClose }: IProps) => {

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

  return (
    <>
      <div className={css.container}>
        <div className={css.background} onClick={onClose}/>
        <div className={css.content} style={contentStyle}>
          {renderTitle()}
          {children}
        </div>
      </div>
    </>
  )
}