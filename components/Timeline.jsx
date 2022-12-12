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
  const [maxFramesToBe, setmaxFramesToBe] = useState(0);
  const maxFramesUpperLimit = 30; // (TODO which val?) the UI'll get weird at high vals

  const [animationPlaying, setAnimationPlaying] = useState(false);

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
   * When our component loads, lets set our current "working" maxFrames to be
   * the current number of frames we have
   */
  useEffect(() => {
    setmaxFramesToBe(props.keyframes.length);
  }, []);

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
  function updateMaxFrames() {
    if (maxFramesToBe > 0 && maxFramesToBe <= maxFramesUpperLimit) {
      if (maxFramesToBe < props.keyframes.length) {
        const newKeyframes = [...props.keyframes].slice(0, maxFramesToBe);
        props.setKeyframes(newKeyframes);
      } else {
        const newKeyframes = [...props.keyframes].concat(
          Array(maxFramesToBe - props.keyframes.length).fill(0)
        );
        props.setKeyframes(newKeyframes);
      }
    }
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
