import React from 'react';
import Popup from 'reactjs-popup';

export default function SaveFileMenu(props) {
  return (
    <Popup
      modal
      closeOnDocumentClick
      id="saveFileMenu"
      trigger={
        <button className="flex-item font-bold text-bots-gray rounded border-bots-gray">
          <p className="text-md">SAVE</p>
          <p className="text-xs">FILE</p>
        </button>
      }
    >
      {close => (
        <div className="modal">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Save File:</div>
          <br />
          <div>
            <input
              value={props.newFileName}
              onChange={event => {
                setNewFileName(event.target.value);
              }}
            />
            <span>.txt</span>
            <button
              onClick={() => {
                saveFile();
                close();
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
}
