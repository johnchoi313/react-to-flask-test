import React, { useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

import JointSlider from '../components/JointSlider';
import BotsIQHeader from '../components/BotsIQHeader';
import UnityWebPage from '../components/UnityWebProject';

/**
 * TODO:
 * [x] Buttons: send current pose & get current pose & toggle drag&teach mode
 * [x] Button: reset pose
 * [x] Slider addons (inputs, plus/minus buttons)
 * [x] Max frames: UI
 * [x] Max frames: implement
 * [x] Current frame: UI
 * [x] Current frame: implement
 * [ ] Implement: toggle drag & teach; send pose; get pose
 * [ ] Frame interpolation
 * [ ] Clean frames logic (probably can be combined with separating out to new component)
 *
 * MAYBE
 * [ ] Buttons in own component?
 * [ ] Maybe set timeline logic/representation aside into its own component?
 * [ ] Allow ENTER to trigger setMaxFrames and setCurrentFrame?
 *
 * [ ] Joint indexing/naming (which one is the gripper? do we have too many joints?)
 * [ ] The TODO about set pose on mount
 */

export default function Home() {
  const animationSpeed = 500;
  const [signal, setSignal] = useState(''); /* why are we using a hook to store 
                                            signal? should we even have any 
                                            concept of signal at this scope? I 
                                            feel like it should only be set just
                                            before it's sent, right? */
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

  // TODO on mount set the pose to whatever the current frame's joint values are

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
    // changeMySignal(signal); we shouldn't need this as state, right?
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

  /**
   * For maxFrames, we've decided to delete any frame data that would no longer
   * be accessed on reducing maxFrames (so if we set maxFrames to 2, frames 3
   * and onwards are erased. If we increase maxFrames again, we'd use fresh
   * frames)
   */

  const [maxFramesToBe, setmaxFramesToBe] = useState(0);
  const [currentFrameToBe, setCurrentFrameToBe] = useState(0);
  const maxFramesUpperLimit = 30; // (TODO which val?) the UI'll get weird at high vals
  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState([1, 0, 0, 0, 1, 0]);
  const [animationPlaying, setAnimationPlaying] = useState(false);

  useEffect(() => {
    setmaxFramesToBe(keyframes.length);
  }, []);

  /**
   * setFrame sets the current frame to a new value.
   * @param {int} frameIndex - the frame we'd like to jump to
   */
  function setFrameByTimelineClick(frameIndex) {
    if (frameIndex >= 0 && frameIndex < keyframes.length) {
      // TODO: answer q about "do we use maxFramesToBe or just delete frame data
      // when decreasing maximum number of frames?"
      setCurrentFrame(frameIndex);
    }
  }

  /**
   * toggleKeyframe toggles given frame from tween to keyframe (and vice versa)
   * @param {int} frameIndex the target frame
   */
  function toggleKeyframe(frameIndex) {
    const newKeyframes = [...keyframes];
    newKeyframes[frameIndex] = 1 - keyframes[frameIndex];
    setKeyframes(newKeyframes);
  }

  /**
   * togglePlayAnimation toggles `animationPlaying` between true and false
   */
  function togglePlayAnimation() {
    setAnimationPlaying(!animationPlaying);
  }

  /**
   * This effect triggers our animation to proceed to the next frame every
   * `animationSpeed` milliseconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationPlaying === true) {
        setCurrentFrame((currentFrame + 1) % keyframes.length);
      }
    }, animationSpeed);
    return () => {
      clearInterval(interval);
    };
  }, [animationPlaying, currentFrame]);

  /*
    TODO: when it goes blank or we go from 16 -> 1 -> 18, etc we'll end up 
    zeroing out the existing keyframes with the current behavior. I'm kinda a 
    fan of adding a button to confirm the new maxFramesToBe number? also then we'll
    be able to explain if they try to submit 0 or a really high number
    Or, we could solve this by making the user hit ENTER, but I'm not sure if
    that would be immediately intuitive on an iPad. Maybe it would?
    */

  function updateMaxFrames() {
    if (maxFramesToBe > 0 && maxFramesToBe <= maxFramesUpperLimit) {
      if (maxFramesToBe < keyframes.length) {
        const newKeyframes = [...keyframes].slice(0, maxFramesToBe);
        setKeyframes(newKeyframes);
      } else {
        const newKeyframes = [...keyframes].concat(
          Array(maxFramesToBe - keyframes.length).fill(0)
        );
        setKeyframes(newKeyframes);
      }
    }
  }
  function updateCurrentFrame() {}

  /* ------------------------------------------------------------------------ */
  /* HANDLE FORMATTING: */

  /* Specify standard button format to keep html easier to read */
  const stdButtonFormat =
    'font-bold text-bots-gray rounded border-bots-gray bg-bots-light-grayx';

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
    const prefix = 'flex-item h-72 font-bold text-bots-gray rounded';
    if (isKeyframe && currentFrame == frameIndex) {
      return `${prefix} bg-bots-light-orange border-bots-orange`;
    }
    if (isKeyframe) {
      return `${prefix} bg-bots-light-blue border-bots-blue`;
    }
    if (currentFrame == frameIndex) {
      return `${prefix} border-bots-orange`;
    }
    return `${prefix} bg-bots-white border-bots-blue`;
  }

  /**
   * getCurrenAndKeyframeText displays text below each frame on the timeline to
   * let the user see which frame is the frame we're currenly on, and which
   * frames on the timeline are currently keyframes. We show this with the UI,
   * but it's safest to also explicitly say so, in case users are colorblind or
   * the UI differences are insufficiently clear.
   * @param {int} frameIndex
   * @param {boolean} isKeyframe
   * @returns
   */
  function getCurrentAndKeyframeText(frameIndex, isKeyframe) {
    if (isKeyframe && frameIndex == currentFrame) {
      return '[CURR & KEY]';
    }
    if (isKeyframe) {
      return '[KEY]';
    }
    if (frameIndex == currentFrame) {
      return '[CURRENT]';
    }
    return '';
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER PAGE: */

  return (
    <div>
      <BotsIQHeader />
      <div className="flex-container">
        <UnityWebPage className="flex-item" UnityProvider={unityProvider} />
        <div className="flex-item">
          <div className="flex-container">
            <button
              className={`flex-item bg-bots-light-gray ${stdButtonFormat}`}
              onClick={() => {
                console.log('Implement drag & teach!');
              }}
            >
              <p className="text-md">DRAG & TEACH MODE</p>
              <p className="text-xs">[OFF]</p>
            </button>
            <button
              className={`flex-item ${stdButtonFormat}`}
              onClick={() => {
                console.log('Implement get pose from Cobot!');
              }}
            >
              <p className="text-md">GET POSE</p>
              <p className="text-xs">FROM COBOT</p>
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
                console.log('Implement send pose to Cobot!');
              }}
            >
              <p className="text-md">SEND POSE</p>
              <p className="text-xs">TO COBOT</p>
            </button>
          </div>
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
            <p className="text-xs">
              {getCurrentAndKeyframeText(frameIndex, isKeyframe)}
            </p>
          </button>
        ))}
      </div>
      <div className="flex-container">
        <button
          className="flex-item text-md font-bold text-bots-light-gray rounded border-bots-gray bg-bots-gray"
          onClick={() => {
            togglePlayAnimation();
          }}
        >
          {animationPlaying ? 'STOP' : 'PLAY'}
        </button>
        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={() => {
            toggleKeyframe(currentFrame);
          }}
        >
          TOGGLE KEYFRAME{' '}
        </button>
        <input
          className="flex-item"
          value={currentFrameToBe}
          onChange={event => {
            setCurrentFrameToBe(event.target.value);
          }}
        />
        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={() => setFrameByTimelineClick(currentFrameToBe)}
        >
          Set Current Frame
        </button>
        <input
          className="flex-item"
          value={maxFramesToBe}
          onChange={event => {
            setmaxFramesToBe(event.target.value);
          }}
        />
        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={updateMaxFrames}
        >
          Set Max Frames
        </button>
      </div>
    </div>
  );
}
