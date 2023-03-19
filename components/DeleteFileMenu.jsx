import React from 'react';
import Popup from 'reactjs-popup';

export default function DeleteFileMenu(props) {
  return (
    <Popup
      modal
      closeOnDocumentClick
      id="deleteFileMenu"
      trigger={
        <button className="flex-item font-bold text-bots-gray rounded border-bots-gray">
          <p className="text-md">DELETE</p>
          <p className="text-xs">FILE</p>
        </button>
      }
    >
      {close => (
        <div className="modal">
          <button type="button" className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Delete File:</div>
          <br />
          <div className="flex-container-vertical">
            {props.savedFiles.map(fileName => (
              <button
                type="button"
                key={fileName}
                onClick={() => {
                  props.deleteFile(fileName);
                  close();
                }}
              >
                {fileName}
              </button>
            ))}
          </div>
        </div>
      )}
    </Popup>
  );
}
