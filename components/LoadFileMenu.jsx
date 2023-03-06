import React from 'react';
import Popup from 'reactjs-popup';

export default function BotsIQHeader(props) {
  return (
    <Popup
      modal
      closeOnDocumentClick
      id="loadFileMenu"
      trigger={<button className="flex-item">Load File</button>}
    >
      {close => (
        <div className="modal">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Load File:</div>
          <br />
          <div className="flex-container-vertical">
            {savedFiles.map(fileName => (
              <button
                key={fileName}
                onClick={() => {
                  loadFile(fileName);
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
