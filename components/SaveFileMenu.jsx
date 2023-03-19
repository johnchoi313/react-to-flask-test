import React, { useState } from 'react';
import Popup from 'reactjs-popup';

export default function SaveFileMenu(props) {
  const [newFileName, setNewFileName] =
    useState('newFile'); /* We'll automatically add '.txt' after it */

  function turnFileDataIntoSendableString() {
    const stringToSend = `{
      "name": "Nameless",
      "speed":1,
      "commandsArm1":[${props.joints[1]}],
      "commandsArm2":[${props.joints[2]}],
      "commandsArm3":[${props.joints[3]}],
      "commandsArm4":[${props.joints[4]}],
      "commandsArm5":[${props.joints[5]}],
      "commandsArm6":[${props.joints[6]}],
      "frame":0,
      "keyFrameIndices":[${props.keyframes}]
    }`;
    return stringToSend;
  }

  /**
   * saveFile saves a file and all of its data to the robot. For the moment, the
   * default behavior is to allow file overwriting
   * TODO I think the API automatically sets the file name -- we probably want
   * to give this power to the user instead
   * @param {string} fileName - the name of the file we want to save
   */
  const saveFile = async fileName => {
    console.log(`Saving ${fileName}...`);
    // TODO implement
    // TODO remember to add '.txt' after newFileName
    setNewFileName(fileName);
    const stringToSend = turnFileDataIntoSendableString();
    console.log(stringToSend);

    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/save-as-animation-file?angles_sequence=${stringToSend}`;
    const apiSavedFileDataResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiSavedFileDataJson = await apiSavedFileDataResponse.json();
    const fileSavedAs = apiSavedFileDataJson.response.split('as ')[1];
    props.setSavedFiles([...props.savedFiles, fileSavedAs]);
  };

  return (
    <Popup
      modal
      closeOnDocumentClick
      id="saveFileMenu"
      trigger={
        <button
          type="button"
          className="flex-item font-bold text-bots-gray rounded border-bots-gray"
        >
          <p className="text-md">SAVE</p>
          <p className="text-xs">FILE</p>
        </button>
      }
    >
      {close => (
        <div className="modal">
          <button type="button" className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Save File:</div>
          <br />
          <div>
            <input
              value={newFileName}
              onChange={event => {
                setNewFileName(event.target.value);
              }}
            />
            <span>.txt</span>
            <button
              type="button"
              onClick={() => {
                saveFile(newFileName);
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
