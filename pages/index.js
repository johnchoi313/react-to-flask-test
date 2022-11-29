import React, { useEffect, useState } from 'react';

import { Unity, useUnityContext } from 'react-unity-webgl';
import UnityWebPage from '../components/UnityWebProject';
import JointSlider from '../components/JointSlider';
import BotsIQHeader from '../components/BotsIQHeader';

export default function Home() {
  const [signal, setSignal] = useState(''); /* why are we using a hook to store 
                                            signal? */
  // const [isUnityMounted, setIsUnityMounted] = useState(true);
  // const [arm3, setArm3] = useState([]);
  // const robotArmManager = new RobotArmManager();

  /* ------------------------------------------------------------------------ */
  /* HANDLE UNTIY: */

  function changeMySignal(outputJsonString) {
    setSignal(outputJsonString);
  }

  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: 'build/RobotArm_React_WebGL (10-3-2022).loader.js',
      dataUrl: 'build/RobotArm_React_WebGL (10-3-2022).data',
      frameworkUrl: 'build/RobotArm_React_WebGL (10-3-2022).framework.js',
      codeUrl: 'build/RobotArm_React_WebGL (10-3-2022).wasm',
    });

  /* ------------------------------------------------------------------------ */
  /* HANDLE TIMELINE DATA: */

  /* We'll handle capitalization as if keyframe is one word, so only ever 
  capitalizing keyframe to Keyframe and never KeyFrame.

  For now, we'll just 0-index the frames and expose that on the front end. We 
  can go back and change the display to 1-indexing if we like, later, or we 
  could leave it to expose the users to the concept of 0-indexing. However, this
  runs into inconsistency in that we are 1-indexing the joint ids. Another 
  potential solution would be to use letters to refer to frames; however, this
  is fairly non-standard and may be counterintuitive. Potentially best to just 
  go back and translate to 1-indexing at the end. (Or, have frame 0 exist but 
  always be hidden? */

  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState([1, 0, 0, 0, 1, 0]);

  /**
   * setFrame sets the current frame to a new value.
   * @param {int} frameIndex - the frame we'd like to jump to
   */
  function setFrameByTimelineClick(frameIndex) {
    if (frameIndex >= 0 && frameIndex < keyframes.length) {
      // TODO: answer q about "do we use maxFrames or just delete frame data
      // when decreasing maximum number of frames?"
      setCurrentFrame(frameIndex);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* HANDLE ROBOT DATA: */

  /* We initially have only 1 frame per joint here */
  const [joints, setJoints] = useState([
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0],
    [6, 0, 0, 0, 0, 0],
  ]);

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
   * @TODO do we want to add an optional arg for which frame?
   */
  function setJoint(joint, frame, value) {
    const newJoints = [...joints];
    newJoints[joint][frame] = value;
    setJoints(newJoints);
  }

  /* Trigger animation updates after we update the joints' state */
  useEffect(() => {
    if (isLoaded) {
      setJointAnimation();
    }
  }, [joints]);

  function setJointAnimation() {
    const signal =
      `{"name":"${'name'}","speed":${1},` +
      `"commandsArm1":[${joints[1]}],` +
      `"commandsArm2":[${joints[2]}],` +
      `"commandsArm3":[${joints[3]}],` +
      `"commandsArm4":[${joints[4]}],` +
      `"commandsArm5":[${joints[5]}],` +
      `"commandsArm6":[${joints[6]}],` +
      `"frame":${0},"kf":[0]}`;
    changeMySignal(signal);
    sendMessage('PeterGameController', 'ReceiveAnimationFullUpdate', signal);
    sendMessage(
      'PeterGameController',
      'ReceiveAnimationFrameToDisplay',
      currentFrame
    );
  }
  /* ------------------------------------------------------------------------ */
  /* HANDLE FORMATTING: */

  /**
   * getClassesForFrame gets the CSS classes we want to apply to a given frame
   * in the timeline. The current frame will be highlighted in orange, while the
   * other frames are blue. Keyframes will be a solid color, while tween frames
   * will have only a border.
   * @param {int} frameIndex - given frame
   * @return {string} - CSS classes for frame
   */
  function getClassesForFrame(frameIndex) {
    const isKeyframe = keyframes[frameIndex] == 1;
    const prefix = 'flex-item font-bold text-bots-gray rounded';
    if (isKeyframe && currentFrame == frameIndex) {
      return `${prefix} bg-bots-orange border-bots-orange`;
    }
    if (isKeyframe) {
      return `${prefix} bg-bots-blue border-bots-blue`;
    }
    if (currentFrame == frameIndex) {
      return `${prefix} border-bots-orange`;
    }
    return `${prefix} bg-bots-white border-bots-blue`;
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER PAGE: */

  return (
    <div>
      <BotsIQHeader />
      <div className="flex-container">
        <UnityWebPage className="flex-item" UnityProvider={unityProvider} />
        <div className="flex-item">
          {joints.map((positionList, index) => (
            <div>
              <JointSlider
                key={index}
                jointNumber={joints.length - 1 - index}
                currentFrame={currentFrame}
                getJoint={getJoint}
                setJoint={setJoint}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-container">
        {keyframes.map((isKeyframe, frameIndex) => (
          <button
            key={frameIndex}
            className={getClassesForFrame(frameIndex)}
            onClick={() => {
              setFrameByTimelineClick(frameIndex);
            }}
          >
            <p className="text-lg">{frameIndex}</p>
            <p className="text-xs">{isKeyframe ? '[KEY]' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
