import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function JointSlider(props) {
  const miniButtonFormat =
    'font-bold text-bots-gray rounded bg-bots-blue border-bots-blue';
  const plusMinusButtonInterval = 5;
  return (
    <>
      <p className="text-sm" />
      <div className="flex-container">
        <p className="flex-item text-lg text-center">{props.jointName}</p>
        <button
          className={`flex-item basis-1/4 h-10 ${miniButtonFormat}`}
          onClick={() => {
            props.setJoint(
              props.jointNumber,
              props.currentFrame,
              props.getJoint(props.jointNumber, props.currentFrame) -
                plusMinusButtonInterval
            );
          }}
        >
          -
        </button>
        <Slider
          className="flex-item flex-basis-500"
          min={-105}
          max={105}
          id={`slider_${props.jointNumber}`}
          trackStyle={{ backgroundColor: '#F17E34', height: 14 }}
          handleStyle={{
            backgroundColor: '#F17E34',
            borderColor: '#F17E34',
            height: 20,
            width: 20,
            marginLeft: -5,
            marginTop: -3,
          }}
          railStyle={{ backgroundColor: '#F6DE37', height: 14 }}
          value={props.getJoint(props.jointNumber, props.currentFrame)}
          onChange={event => {
            props.setJoint(props.jointNumber, props.currentFrame, event);
          }}
        />
        <button
          className={`flex-item basis-1/4 h-10 ${miniButtonFormat}`}
          onClick={() => {
            props.setJoint(
              props.jointNumber,
              props.currentFrame,
              props.getJoint(props.jointNumber, props.currentFrame) +
                plusMinusButtonInterval
            );
          }}
        >
          +
        </button>
        <input
          className="flex-item rounded border-2 px-2 border-bots-light-blue text-bots-gray font-bold"
          value={props.getJoint(props.jointNumber, props.currentFrame)}
          onChange={event => {
            // TODO set min and max values (actually maybe this is best to set in setJoint?)
            props.setJoint(
              props.jointNumber,
              props.currentFrame,
              event.target.value
            );
          }}
        />
      </div>
    </>
  );
}
