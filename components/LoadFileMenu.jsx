import React, { useState } from 'react';
import Popup from 'reactjs-popup';

export default function LoadFileMenu(props) {
  return (
    <Popup
      modal
      closeOnDocumentClick
      id="loadFileMenu"
      trigger={
        <button
          type="button"
          className="flex-item font-bold text-bots-gray rounded border-bots-gray"
        >
          <p className="text-md">LOAD</p>
          <p className="text-xs">FILE</p>
        </button>
      }
    >
      {close => (
        <div className="modal">
          <button type="button" className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Load File:</div>
          <br />
          <div className="flex-container-vertical">
            {props.savedFiles.map(fileName => (
              <button
                type="button"
                key={fileName}
                onClick={() => {
                  props.loadFile(fileName);
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
