import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';

// react components
import 'rc-slider/assets/index.css';

export default function JointSlider(props) {
  return (
    <>
      <p className="text-sm">
        <span>J{props.jointNumber}: </span>
        <span>{props.getJoint(props.jointNumber, props.currentFrame)}</span>
      </p>
      <Slider
        min={-30}
        max={30}
        id={`slider_${props.jointNumber}`}
        value={props.getJoint(props.jointNumber, props.currentFrame)}
        onChange={event => {
          props.setJoint(props.jointNumber, props.currentFrame, event);
        }}
      />
    </>
  );
}
