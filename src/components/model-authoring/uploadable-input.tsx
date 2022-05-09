import * as React from "react";
import Dropzone from "react-dropzone";

import { useContext, useRef, useState } from "react";
import { UploaderContext } from "../../providers/uploader";

import * as css from "./uploadable-input.scss";

type AcceptableTypes = "image" | "video" | "audio" | "closed captions"

interface IProps {
  type: AcceptableTypes
  name: string;
  value: string|number|undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const acceptMap: Record<AcceptableTypes, string[]> = {
  "image": ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp"],
  "video": ["video/mp4", "video/webm", "video/ogg"],
  "audio": ["audio/webm", "audio/mpeg", "audio/mp3", "audio/ogg"],
  "closed captions": ["text/vtt"]
}

const acceptExtensions: any = {};
Object.keys(acceptMap).forEach((type: AcceptableTypes) => {
  acceptExtensions[type] = acceptMap[type].map(accept => accept.split("/")[1].split("+")[0]);
});

const UploadableInput = ({type, name, value, placeholder, onChange}: IProps) => {
  const { upload } = useContext(UploaderContext);
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const [uploadInProgressMessage, setUploadInProgressMessage] = useState<string|undefined>()

  const handleDropAccepted = (files: File[]) => {
    if (!files[0]) {
      return;
    }
    upload(files[0], ({inProgress, inProgressMessage, inProgressError, uploadedUrl}) => {
      setUploadInProgress(inProgress)
      setUploadInProgressMessage(inProgressMessage)
      if (uploadedUrl) {
        onChange({target: {value: uploadedUrl}} as any)
      }
      if (inProgressError) {
        setTimeout(() => {
          alert(inProgressError)
        }, 10)
      }
    });
  }

  const handleDropRejected = (rejected: File[]) => {
    alert(`File ${rejected[0].name} can't be uploaded. Please use one of the supported file types.`);
  };

  const renderDropzone = () => {
    if (uploadInProgress) {
      return (
        <div className={css.inProgressMessage}>
          {uploadInProgressMessage || "Upload in progress, please wait..."}
        </div>
      );
    } else {
      return (
        <Dropzone
          className={css.dropzone}
          activeClassName={css.dropzoneActive}
          rejectClassName={css.dropzoneReject}
          accept={acceptMap[type].join(", ")}
          multiple={false}
          onDropAccepted={handleDropAccepted}
          onDropRejected={handleDropRejected}
        >
          Drop a file here, or click to select a file to upload. Only popular {type} formats are supported
          (e.g. {acceptExtensions[type].join(", ")}).
        </Dropzone>
      )
    }
  }

  return (
    <div className={css.uploadableInput}>
      <input type="text" value={value || ""} placeholder={placeholder} onChange={onChange} />
      {renderDropzone()}
    </div>
  )
}

export default UploadableInput;