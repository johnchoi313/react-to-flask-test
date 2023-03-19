/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import 'reactjs-popup/dist/index.css';

import { getPageFiles } from 'next/dist/server/get-page-files';
import { Button } from '@material-ui/core';
import JointSlider from '../components/JointSlider';
import BotsIQHeader from '../components/BotsIQHeader';
import LoadFileMenu from '../components/LoadFileMenu';
import SaveFileMenu from '../components/SaveFileMenu';
import DeleteFileMenu from '../components/DeleteFileMenu';
import UnityWebPage from '../components/UnityWebProject';
import Timeline from '../components/Timeline';

/**
 * TODO:
 * [ ] Load file should adjust frame count
 * [ ] Figure out joint indices !! Doubled in load file
 *
 * [ ] File names -> allow user to specify, then stop parsing them from save file response
 * [ ] Address Logic: TODO about set pose on mount
 * [ ] Address Logic: TODOs at the top of Timeline component
 * [ ] Address Logic: Joint indexing/naming
 *     (which one is the gripper? do we have too many joints?)
 * [ ] Check that save overwriting is default desired behavior
 * [ ] Phase out (or at least clean uses) of temp make random
 *
 * [x] Finish implementing (w/ API): file save, load, delete
 * [x] Move save/load/etc file functions into own components
 * [x] UI: file save, load, delete
 * [x] Move each file modal into their own components
 * [x] Implement: frame interpolation
 * [x] Implement: toggle drag & teach
 * [x] Implement: send pose
 * [x] Implement: send animation
 * [x] Implement: get pose
 *
 * END
 * [ ] Styles!
 *
 * MAYBE
 * [ ] Address Logic: should we put buttons in their own component?
 * [ ] Address Logic: does it makes sense to allow ENTER to trigger setMaxFrames
 *     and setCurrentFrame?
 * [ ] Clean up side effects (https://dmitripavlutin.com/react-hooks-mistakes-to-avoid/)
 * [ ] Can I better organize the Timeline component's logic?
 * [x] Address Logic: UnityWebPage may be redundant
 */

export default function Home() {
  /* ------------------------------------------------------------------------ */
  /* HANDLE UNTIY: */

  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: 'build/RobotArm_React_WebGL (10-3-2022).loader.js',
      dataUrl: 'build/RobotArm_React_WebGL (10-3-2022).data',
      frameworkUrl: 'build/RobotArm_React_WebGL (10-3-2022).framework.js',
      codeUrl: 'build/RobotArm_React_WebGL (10-3-2022).wasm',
    });

  // TODO on mount set the pose to whatever the current frame's joint values are
  // or maybe make sure to send a message to the robot to have a zeroed pose?
  // doesn't this already happen automatically? and does it actually even matter
  // though - once the user sends something it'll be synced/as soon as they move
  // the sliders it'll be unsynced again?

  /* ------------------------------------------------------------------------ */
  /* HANDLE ROBOT DATA: */

  /* Turn the motors off to use drag & teach mode */
  const [motorsOn, setMotorsOn] = useState(true);

  /* We initially have only a few frames per joint here */
  const [joints, setJoints] = useState([
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0],
  ]);

  function tempMakeRandom() {
    const newArr = [
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)),
    ];
    console.log(newArr[0]);
    return newArr;
  }

  /**
   * GetJoint gets the joint info for a target joint at the given frame. We
   * store the gripper data as joint #0, because the joint naming begins at
   * joint #1, and Python lists are 0-indexed (thus allowing data for joint #1
   * to be stored in joints[1] and so on)
   * @param {int} joint - the target joint
   * @param {int} frame - the given frame
   * @return {float} the value we've set that joint to for the given frame
   * (similar but not to be confused with the actual, real-life value we query
   * from the robot)
   */
  function getJoint(joint, frame) {
    return joints[joint][frame];
  }

  /**
   * SetJoint sets a new value for the given joint.
   * @param {int} joint - the target joint
   * @param {int} frame - the given frame
   * @param {float} value - the value we're giving that joint
   */
  function setJoint(joint, frame, value) {
    const newJoints = [...joints];
    newJoints[joint][frame] = value;
    setJoints(newJoints);
  }

  /**
   * This effect triggers animation updates in the Unity WebGL component every
   * time something updates the joints' state.
   * */
  useEffect(() => {
    if (isLoaded) {
      setJointsInWebGL();
    }
  }, [joints]);

  /**
   * setJointsInWebGL sends a signal to the Unity WebGL component to display the
   * 3D model at the given joint values. This function takes no arguments, as it
   * should be called if and only if a change has been made to `joints` (which
   * it then uses as the values to pass along to the WebGL component).
   */
  function setJointsInWebGL() {
    const signal =
      `{"name":"${'name'}","speed":${1},` +
      `"commandsArm1":[${joints[1]}],` +
      `"commandsArm2":[${joints[2]}],` +
      `"commandsArm3":[${joints[3]}],` +
      `"commandsArm4":[${joints[4]}],` +
      `"commandsArm5":[${joints[5]}],` +
      `"commandsArm6":[${joints[6]}],` +
      `"frame":${0},"kf":[0]}`;
    sendMessage('PeterGameController', 'ReceiveAnimationFullUpdate', signal);
    sendMessage(
      'PeterGameController',
      'ReceiveAnimationFrameToDisplay',
      currentFrame
    );
  }

  /**
   * resetJointsForCurrentFrame resets the every joint value in the current
   * frame to the default joint value.
   */
  function resetJointsForCurrentFrame() {
    const newJoints = [...joints];
    const defaultValue = 0;
    for (let jointIndex = 0; jointIndex < joints.length; jointIndex++) {
      newJoints[jointIndex][currentFrame] = defaultValue;
    }
    setJoints(newJoints);
  }

  /* ------------------------------------------------------------------------ */
  /* HANDLE TIMELINE DATA: (mostly in the Timeline component) */

  const [currentFrame, setCurrentFrame] = useState(0);
  const [maxFramesToBe, setMaxFramesToBe] = useState(0);
  const [keyframes, setKeyframes] = useState([1, 0, 0, 0, 1, 0]);
  const needToInterpolateFrames = true;

  /* ------------------------------------------------------------------------ */
  /* HANDLE FORMATTING: */

  /* Specify standard button format to keep html easier to read */
  const stdButtonFormat = 'font-bold text-bots-gray rounded border-bots-gray';

  /* ------------------------------------------------------------------------ */
  /* HANDLE API (NON-FILES): */

  const urlPrefix = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000`;

  // TODO add in docstrings!!

  const handleSendPose = async () => {
    const signal = joints.map(joint => joint[currentFrame]);
    signal.splice(0, 1); // TODO this relates to the total # of joints question
    // - I think there really might only be 6 including the gripper
    const url = `${urlPrefix}/send-pose?angles=${signal}`;
    const apiDataResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiDataJson = await apiDataResponse.json();
    // console.log(apiDataJson.response);
  };

  const handleTurnMotorsOff = async () => {
    const url = `${urlPrefix}/turn-off-motors`;
    const apiDataResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiDataJson = await apiDataResponse.json();
    console.log(apiDataJson.response);
  };

  const getPose = async () => {
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/get-pose`;
    const anglesApiDataResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const anglesApiDataJson = await anglesApiDataResponse.json();
    // console.log(anglesApiDataJson.response.map(val => Math.round(val)));
    const newJoints = [...joints];
    for (let i = 0; i < anglesApiDataJson.response.length; i++) {
      newJoints[i][currentFrame] = anglesApiDataJson.response[i];
    }
    setJoints(newJoints);
  };

  const handleSendAnimation = async () => {
    const signal = `{
      "name":"animationName",
      "speed":1,
      "commandsArm1":[${joints[1]}],
      "commandsArm2":[${joints[2]}],
      "commandsArm3":[${joints[3]}],
      "commandsArm4":[${joints[4]}],
      "commandsArm5":[${joints[5]}],
      "commandsArm6":[${joints[6]}],
      "frame":${currentFrame},
      "kf":[0]}`;

    const url = `${urlPrefix}/send-angles-sequence?angles_sequence=${signal}`;
    const apiDataResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiDataJson = await apiDataResponse.json();
    console.log(apiDataJson.response);
  };

  /* ------------------------------------------------------------------------ */
  /* HANDLE FILE DATA: */

  const [savedFiles, setSavedFiles] = useState(['none']);

  const getFiles = async () => {
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/get-all-animation-files`;
    const apiFileDataResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiFileDataJson = await apiFileDataResponse.json();
    setSavedFiles(apiFileDataJson.response.sort());
    return true;
  };

  /**
   * Get the list of files that are saved on the robot
   * Only call this once, at the beginning (we modify this list over time to
   * do the "soft" file deletion). Not ideal but until we have a "delete file"
   * API function it will have to do.
   */
  useEffect(() => {
    if (isLoaded) {
      console.log('Loading files...');
      getFiles();
    }
  }, [isLoaded]);

  /**
   * loadFile loads a file and all of its data from the robot
   * @param {string} fileName - the name of the file we want to load
   */
  const loadFile = async fileName => {
    console.log(`Loading ${fileName}...`);
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/get-single-file?file=${fileName}`;
    const apiSingleFileDataResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const apiSingleFileDataJson = await apiSingleFileDataResponse.json();
    console.log(apiSingleFileDataJson);
    /*
    const jsonString = apiSingleFileDataJson.response.replace(/'/g, '"'); // need to turn ' to " to be parsable
    const jsonData = JSON.parse(jsonString);
    console.log(jsonData);
    const loadedMaxFrames = jsonData.keyFrameIndices.length;
    setMaxFramesToBe(loadedMaxFrames);
    setKeyframes(jsonData.keyFrameIndices);
    setJoints([
      [...jsonData.commandsArm1.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm1.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm2.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm3.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm4.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm5.slice(0, loadedMaxFrames)],
      [...jsonData.commandsArm6.slice(0, loadedMaxFrames)],
    ]); // TODO we're just repeating a joint data for now
    */
  };

  /**
   * deleteFile ~should~ delete a file and all of its data from the robot
   * NOTE: this is currently just a "soft" delete - we hide its existence from
   * the user, but the file will still exist on the robot. iirc this is because
   * we don't have a "delete file" api command to use yet.
   * @param {string} fileName - the name of the file we want to delete
   */
  function deleteFile(fileName) {
    console.log(`Deleting ${fileName}...`);
    setSavedFiles(savedFiles.filter(item => item !== fileName));
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER PAGE: */

  return (
    <div>
      <BotsIQHeader />
      <div className="flex-container">
        <Unity className="canvas" unityProvider={unityProvider} />
        <div className="flex-item">
          <div className="flex-container">
            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                handleTurnMotorsOff();
              }}
            >
              <p className="text-md">TURN MOTORS OFF</p>
            </button>

            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                getPose();
              }}
            >
              <p className="text-md">GET POSE</p>
              <p className="text-xs">FROM COBOT</p>
            </button>

            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                setJoints(tempMakeRandom());
              }}
            >
              <p className="text-md">RANDOMIZE</p>
              <p className="text-xs">SLIDERS</p>
            </button>
          </div>

          {joints.map((positionList, index) => (
            <JointSlider
              key={index}
              jointNumber={joints.length - 1 - index}
              currentFrame={currentFrame}
              getJoint={getJoint}
              setJoint={setJoint}
              stdButtonFormat={stdButtonFormat}
            />
          ))}

          <div className="flex-container">
            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                resetJointsForCurrentFrame();
              }}
            >
              <p className="text-md">RESET POSE</p>
              <p className="text-xs">SLIDERS</p>
            </button>

            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                handleSendPose();
              }}
            >
              <p className="text-md">SEND POSE</p>
              <p className="text-xs">TO COBOT</p>
            </button>

            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                handleSendAnimation();
              }}
            >
              <p className="text-md">SEND ANIMATION</p>
              <p className="text-xs">TO COBOT</p>
            </button>
          </div>
        </div>
      </div>

      <Timeline
        joints={joints}
        setJoints={setJoints}
        keyframes={keyframes}
        setKeyframes={setKeyframes}
        maxFramesToBe={maxFramesToBe}
        setMaxFramesToBe={setMaxFramesToBe}
        currentFrame={currentFrame}
        setCurrentFrame={setCurrentFrame}
        needToInterpolateFrames={needToInterpolateFrames}
        tempMakeRandom={tempMakeRandom}
      />

      <div className="flex-container">
        <Button className="border-bots-gray" onClick={getFiles}>
          Get Files
        </Button>
        <LoadFileMenu
          savedFiles={savedFiles}
          getFiles={getFiles}
          loadFile={loadFile}
        />
        <SaveFileMenu
          joints={joints}
          keyframes={keyframes}
          savedFiles={savedFiles}
          setSavedFiles={setSavedFiles}
        />
        <DeleteFileMenu
          savedFiles={savedFiles}
          getFiles={getFiles}
          deleteFile={deleteFile}
        />
      </div>
    </div>
  );
}
