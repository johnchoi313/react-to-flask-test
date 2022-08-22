import "rc-slider/assets/index.css";

import React, { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

import RobotArmManager from "./RobotArmManager";
import Slider from "rc-slider";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";

export default function UnityWebPage(props) {
  const [isUnityMounted, setIsUnityMounted] = useState(true);
  const [playAnimation, setPlayAnimation] = useState(false);
  const [robotArmManager, setNewRobotArmManager] = useState(
    new RobotArmManager()
  );
  const [mySignal, setmySignal] = useState([]);
  const [customSignal, setCustomSignal] = useState("my message!");

  const [changedFrame, setChangedFrame] = useState(false);
  const [playing, setPlaying] = useState();
  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: "build/webgl.loader.js",
      dataUrl: "build/webgl.data",
      frameworkUrl: "build/webgl.framework.js",
      codeUrl: "build/webgl.wasm",
    });

  const [anglesApiData, setAnglesApiData] = useState("");

  const sendAnglesToApi = async (strMine) => {
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/demo-move?angles=${strMine}`;
    console.log(url);
    const anglesApiDataResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const anglesApiDataJson = await anglesApiDataResponse.json();
    setAnglesApiData(anglesApiDataJson["response"]);
    console.log(anglesApiDataJson["response"]);
  };
  const [theVal, setTheVal] = useState(0);
  function animationServoWhichToChange(index, myArmAnimationValue) {
    robotArmManager.AnimationUpdate(index, myArmAnimationValue);
    sendAnimationCommand();
  }
  function triggerSendSignals() {
    console.log(strMine);
    let mystr = strMine;
    let mystrSplit = [];
    mystrSplit = mystr.split(",");
    setmySignal(mystrSplit);
    console.log(mystrSplit);
    sendAnglesToApi(strMine);
    sendAnimationCommand();
  }

  // Built-in event invoked when the Unity canvas is ready to be interacted with.

  // Built-in event invoked when the Unity app is loaded.
  useEffect(
    function () {
      if (isLoaded) {
        console.log("log");
        sendAnimationCommand();
        setNewRobotArmManager(new RobotArmManager());
      }
    },
    [isLoaded]
  );
  // Event invoked when the user clicks the button, the unity container will be
  // mounted or unmounted depending on the current mounting state.
  function handleOnClickUnMountUnity() {
    if (isLoaded === true) {
      setIsLoaded(false);
    }
    setIsUnityMounted(isUnityMounted === false);
  }

  function updateFrame(dir) {
    if (robotArmManager.frame + dir < 20 && robotArmManager.frame + dir >= 0) {
      robotArmManager.frame += dir;
    }
  }

  function sendAnimationCommand() {
    //my input on react to unity

    let signal = robotArmManager.SendAnimationCommand();
    props.changeMySignal(signal);
    console.log(signal);

    sendMessage("GameController", "ReceiveAnimationFullUpdate", signal);
    sendMessage(
      "GameController",
      "ReceiveAnimationFrameToDisplay",
      robotArmManager.frame
    );
  }

  function sendAnimationFrameToDisplay(dir) {
    updateFrame(dir);
    let signal = robotArmManager.SendAnimationCommand();
    sendMessage("GameController", "ReceiveAnimationFullUpdate", signal);

    sendMessage(
      "GameController",
      "ReceiveAnimationFrameToDisplay",
      robotArmManager.frame
    );
    setChangedFrame(true);
  }
  function sendAnimationSpeed() {
    sendMessage(
      "GameController",
      "ReceiveAnimationSpeed",
      robotArmManager.speed
    );
  }
  function pushSignal() {
    console.log("help");
    sendMessage("GameController", "SpawnEnemies", 100);
  }
  function changeDefPlayAnimation() {
    let signal = robotArmManager.SendAnimationCommand();

    sendMessage("GameController", "ReceiveAnimationFullUpdate", signal);

    setPlayAnimation(true);
  }
  function PlayAnimation() {
    console.log(playAnimation);
    if (playAnimation === true) {
      robotArmManager.frame += 1;
      robotArmManager.frame = robotArmManager.frame % 20;

      sendMessage("GameController", "PlayAnimation", robotArmManager.frame);
      setPlaying(
        setTimeout(() => {
          PlayAnimation();
        }, robotArmManager.speed * 1000)
      );
      console.log(playAnimation);
    }
  }
  function StopAnimation() {
    //let signal = robotArmManager.SendAnimationCommand();
    //console.log(signal);
    //  sendMessage("GameController", "ReceiveAnimationFullUpdate", signal);

    setPlayAnimation(false);
    console.log(playAnimation);
    sendMessage(
      "GameController",
      "ReceiveAnimationSpeed",
      robotArmManager.frame
    );
  }
  useEffect(
    function () {
      if (playAnimation === true) {
        console.log(robotArmManager.frame);
        PlayAnimation();
      } else {
        clearTimeout(playing);
      }
    },
    [playAnimation]
  );
  function getValue(index) {
    robotArmManager.AnimationFrameReceive(index, robotArmManager.frame);
  }
  let list1 = [1, 2, 3, 4, 5, 6];
  return (
    <>
      <div>
        {/* > */}
        {/* <button className="red" onClick={handleOnClickUnMountUnity}>
        (Un)mount Unity
      </button> */}
        <input onChange={setCustomSignal}></input>

        <p>{mySignal}</p>
        {playAnimation
          ? list1.map((number, index) => {
              return (
                <>
                  <Slider
                    min={-90}
                    max={90}
                    value={robotArmManager.AnimationFrameReceive(number)}
                  />
                </>
              );
            })
          : list1.map((number, index) => {
              return (
                <>
                  <Slider
                    min={-90}
                    max={90}
                    defaultValue={robotArmManager.AnimationFrameReceive(number)}
                    onChange={(value) => {
                      animationServoWhichToChange(number, value);
                    }}
                  />
                </>
              );
            })}

        <button
          onClick={() => {
            sendAnimationFrameToDisplay(1);
          }}
        >
          ForwardOneFrame
        </button>
        <button
          onClick={() => {
            sendAnimationFrameToDisplay(-1);
          }}
        >
          BackOneFrame
        </button>
        {playAnimation === false ? (
          <button onClick={changeDefPlayAnimation}>Play</button>
        ) : (
          <button onClick={StopAnimation}>Stop</button>
        )}
      </div>
      <button onClick={sendAnimationCommand}>signal</button>
      <div className="wrapper">
        <Unity className="canvas" unityProvider={unityProvider} />
      </div>
    </>
  );
}
