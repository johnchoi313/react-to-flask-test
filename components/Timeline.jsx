import React, { useEffect, useState } from 'react';

export default function Timeline(props) {
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

  /*
    TODO: when it goes blank or we go from 16 -> 1 -> 18, etc we'll end up 
    zeroing out the existing keyframes with the current behavior. I'm kinda a 
    fan of adding a button to confirm the new maxFramesToBe number? also then we'll
    be able to explain if they try to submit 0 or a really high number
    Or, we could solve this by making the user hit ENTER, but I'm not sure if
    that would be immediately intuitive on an iPad. Maybe it would?
    */

  const animationSpeed = 500;

  const [currentFrameToBe, setCurrentFrameToBe] = useState(0);
  const [maxFramesToBe, setMaxFramesToBe] = useState(0);
  const maxFramesUpperLimit = 30; // (TODO which val?) the UI'll get weird at high vals

  const [animationPlaying, setAnimationPlaying] = useState(false);

  /**
   * We want to call interpolateFrames at the very beginning, just in case the
   * values we're loading aren't already interpolated
   */
  useEffect(() => interpolateFrames(), []);
  /**
   * This effect triggers our animation to proceed to the next frame every
   * `animationSpeed` milliseconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationPlaying === true) {
        props.setCurrentFrame(
          (props.currentFrame + 1) % props.keyframes.length
        );
      }
    }, animationSpeed);
    return () => {
      clearInterval(interval);
    };
  }, [animationPlaying, props.currentFrame]);

  /**
   * When our component loads, let's set our current "working" maxFrames to be
   * the current number of frames we have.
   */
  useEffect(() => {
    setMaxFramesToBe(props.keyframes.length);
  }, []);
  /**
   * Let's keep our currentFrameToBe in sync with our currentFrame when we
   * aren't in the middle of manually setting it
   */
  useEffect(() => {
    setCurrentFrameToBe(props.currentFrame);
  }, [props.currentFrame]);

  /**
   * setFrame sets the current frame to a new value.
   * @param {int} frameIndex - the frame we'd like to jump to
   */
  function setFrameByTimelineClick(frameIndex) {
    if (frameIndex >= 0 && frameIndex < props.keyframes.length) {
      // TODO: answer q about "do we use maxFramesToBe or just delete frame data
      // when decreasing maximum number of frames?"
      props.setCurrentFrame(frameIndex);
    }
  }

  /**
   * getClassesForFrame gets the CSS classes we want to apply to a given frame
   * in the timeline. The current frame will be highlighted in orange, while the
   * other frames are blue. Keyframes will be a solid color, while tween frames
   * will have only a border.
   * @param {int} frameIndex - given frame
   * @return {string} - CSS classes for frame
   */
  function getClassesForFrame(frameIndex) {
    const isKeyframe = props.keyframes[frameIndex] == 1;
    const prefix = 'flex-item h-72 font-bold text-bots-gray rounded';
    if (isKeyframe && props.currentFrame == frameIndex) {
      return `${prefix} bg-bots-light-orange border-bots-orange`;
    }
    if (isKeyframe) {
      return `${prefix} bg-bots-light-blue border-bots-blue`;
    }
    if (props.currentFrame == frameIndex) {
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
    if (isKeyframe && frameIndex == props.currentFrame) {
      return '[CURR & KEY]';
    }
    if (isKeyframe) {
      return '[KEY]';
    }
    if (frameIndex == props.currentFrame) {
      return '[CURRENT]';
    }
    return '';
  }

  /**
   * togglePlayAnimation toggles `animationPlaying` between true and false
   */
  function togglePlayAnimation() {
    setAnimationPlaying(!animationPlaying);
  }

  /**
   * toggleKeyframe toggles given frame from tween to keyframe (and vice versa)
   * @param {int} frameIndex the target frame
   */
  function toggleKeyframe(frameIndex) {
    const newKeyframes = [...props.keyframes];
    newKeyframes[frameIndex] = 1 - props.keyframes[frameIndex];
    props.setKeyframes(newKeyframes);
  }

  /**
   * TODO
   */
  function updateMaxFrames(newMaxFrames) {
    console.log(`update max frames called: ${newMaxFrames}`);
    if (
      newMaxFrames > 0 &&
      newMaxFrames <= maxFramesUpperLimit &&
      newMaxFrames != props.keyframes.length
    ) {
      console.log('updating...');
      if (newMaxFrames < props.keyframes.length) {
        // Reduce frames
        console.log('reduce frames');
        const newKeyframes = [...props.keyframes].slice(0, newMaxFrames);
        props.setKeyframes(newKeyframes);
        const newJoints = [
          [...props.joints[0]].slice(0, newMaxFrames),
          [...props.joints[1]].slice(0, newMaxFrames),
          [...props.joints[2]].slice(0, newMaxFrames),
          [...props.joints[3]].slice(0, newMaxFrames),
          [...props.joints[4]].slice(0, newMaxFrames),
          [...props.joints[5]].slice(0, newMaxFrames),
          [...props.joints[6]].slice(0, newMaxFrames),
        ];
        props.setJoints(newJoints);
      } else {
        // Add more frames
        console.log('increase frames');
        const framesToAdd = Number(newMaxFrames - props.joints[0].length);
        increaseMaxFrames(framesToAdd);
      }
      interpolateFrames(); // so our new frames will be properly interpolated
    }
  }
  function increaseMaxFrames(framesToAdd) {
    props.setKeyframes(extendList(props.keyframes, framesToAdd));
    props.setJoints(oldJoints => [
      [...oldJoints[0], ...Array(framesToAdd).fill(42)],
      [...oldJoints[1], ...Array(framesToAdd).fill(42)],
      [...oldJoints[2], ...Array(framesToAdd).fill(42)],
      [...oldJoints[3], ...Array(framesToAdd).fill(42)],
      [...oldJoints[4], ...Array(framesToAdd).fill(42)],
      [...oldJoints[5], ...Array(framesToAdd).fill(42)],
      [...oldJoints[6], ...Array(framesToAdd).fill(42)],
    ]);
  }
  /**
   * reduceList reduces a given list to the given length. A helper for
   * updateMaxFrames.
   * @param {T[]} targetList
   * @param {int} newLength
   * @returns {T[]}
   */
  function reduceList(targetList, newLength) {}
  /**
   * extendList extends a list with howManyToAdd 0's. A helper for
   * updateMaxFrames.
   * @param {T[]} targetList
   * @param {int} howMuchToAdd
   * @returns {T[]} extendedList
   */
  function extendList(targetList, howMuchToAdd) {
    if (howMuchToAdd > 0) {
      const res = [...targetList, ...Array(Number(howMuchToAdd)).fill(42)];
      return res;
    }
    console.error(`Error adding # frames: ${howMuchToAdd.toString()}`);
  }

  /**
   * `interpolateFrames` interpolates the joints' values between each keyframe.
   *
   * If tween frames exist before the first keyframe, they should copy that
   * keyframe's values; if tween frames exist after the last keyframe, they
   * should copy that keyframe's values.
   *
   * `interpolateFrames` should be called every time we navigate to a tween
   * frame from a keyframe (by changing frame, by toggling a keyframe to a tween
   * frame, or by changing the max frame count) and the
   * `needToInterpolateFrames` flag is true. It should also be called just
   * before sending an animation command to the robot.
   *
   * The `needToInterpolateFrames` flag should be set anytime we change a joint
   * value on a keyframe, toggle a keyframe, or change the max frame count.
   */
  function interpolateFrames() {
    console.log('Interpolate Frames called');
    const data = [
      [...props.joints[0]],
      [...props.joints[1]],
      [...props.joints[2]],
      [...props.joints[3]],
      [...props.joints[4]],
      [...props.joints[5]],
      [...props.joints[6]],
    ];
    let frame = 0;
    let lastKeyframe = -1;
    let nextKeyframe = -1;
    while (frame < props.joints.length) {
      nextKeyframe = props.keyframes.indexOf(1, frame);
      if (nextKeyframe == -1 && lastKeyframe == -1) {
        // There are no keyframes at all. No interpolation to do, break out.
        // console.log("no keyframes");
        break;
      } else if (frame == nextKeyframe) {
        // At a keyframe. Do no interpolation, but update pointer to last keyframe.
        lastKeyframe = frame;
        // console.log("at a keyframe");
      } else if (lastKeyframe == -1) {
        // In the beginning. Set value to upcoming keyframe.
        // console.log("in the beginning");
        setByOneKeyframe(data, frame, nextKeyframe);
      } else if (nextKeyframe == -1) {
        // At the end. Set value to last keyframe.
        // console.log("at the end");
        setByOneKeyframe(data, frame, lastKeyframe);
      } else {
        // In between two keyframes. Set value to an interpolation of the two.
        // console.log("in between");
        setByTwoKeyframes(data, frame, lastKeyframe, nextKeyframe);
      }
      frame++;
    }
    props.setJoints(data);
  }
  /**
   * setByOneKeyframe duplicates the joint values in one frame to a different
   * frame. A helper for interpolateFrames.
   * @param {float[][]} data
   * @param {int} frameToSet
   * @param {int} frameToCopy
   */
  function setByOneKeyframe(data, frameToSet, frameToCopy) {
    for (let joint = 0; joint < data.length; joint++) {
      data[joint][frameToSet] = data[joint][frameToCopy];
    }
  }
  /**
   * setByTwoKeyframes sets one frame's joints to be an interpolation between
   * the joints in two given frames. A helper for interpolateFrames.
   * @param {float[][]} data
   * @param {int} frameToSet
   * @param {int} frameA
   * @param {int} frameB
   */
  function setByTwoKeyframes(data, frameToSet, frameA, frameB) {
    if (frameA == frameB) {
      console.log('Error: interpolating between keyframe and itself');
    }
    const interval = frameB - frameA;
    const leftInterval = frameToSet - frameA;
    const rightInterval = frameB - frameToSet;
    for (let arm = 0; arm < data.length; arm++) {
      data[arm][frameToSet] =
        data[arm][frameA] * ((1.0 * rightInterval) / interval) +
        data[arm][frameB] * ((1.0 * leftInterval) / interval);
    }
  }
  /**
   * If the current frame changes, and the new current frame is a tween frame,
   * we want to make sure our frames are interpolated.
   */
  useEffect(() => {
    if (props.keyframes[props.currentFrame] == 0) interpolateFrames();
  }, [props.currentFrame]);

  function tempMakeRandomTWO() {
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
  function tempSetJointsInFunction() {
    props.setJoints(tempMakeRandomTWO());
  }

  return (
    <div>
      <div className="flex-container">
        {props.keyframes.map((isKeyframe, frameIndex) => (
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
            toggleKeyframe(props.currentFrame);
          }}
        >
          TOGGLE KEYFRAME{' '}
        </button>

        <input
          className="flex-item rounded border-2 px-2 border-bots-gray text-bots-gray font-bold"
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
          className="flex-item rounded border-2 px-2 border-bots-gray text-bots-gray font-bold"
          value={maxFramesToBe}
          onChange={event => {
            setMaxFramesToBe(event.target.value);
          }}
        />
        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={() => {
            setMaxFramesToBe(props.joints[0].length + 1);
            updateMaxFrames(props.joints[0].length + 1);
          }}
        >
          +
        </button>
        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={() => {
            updateMaxFrames(maxFramesToBe);
          }}
        >
          Set Max Frames
        </button>

        <button
          className="flex-item text-md font-bold text-bots-gray rounded border-bots-gray bg-bots-light-gray"
          onClick={() => {
            tempSetJointsInFunction();
          }}
        >
          <p className="text-md">Random</p>
        </button>
      </div>
    </div>
  );
}
