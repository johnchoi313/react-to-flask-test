import React, { useEffect, useState } from 'react';

// unity webgl
import { Unity, useUnityContext } from 'react-unity-webgl';

// react components
// import Slider from 'rc-slider';
// import 'rc-slider/assets/index.css';

// robot arm
// import RobotArmManager from './RobotArmManager';

// TODO is this as a componenet even necessary?

export default function UnityWebPage(props) {
  return <Unity className="canvas" unityProvider={props.UnityProvider} />;
}
