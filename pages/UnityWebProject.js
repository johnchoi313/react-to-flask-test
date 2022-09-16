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

  const [joints, setJoints] = useState([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  const [curFrame, setCurFrame] = useState(0);

  const [changedFrame, setChangedFrame] = useState(false);
  const [playing, setPlaying] = useState();
  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: "build/webgl.loader.js",
      dataUrl: "build/webgl.data",
      frameworkUrl: "build/webgl.framework.js",
      codeUrl: "build/webgl.wasm",
    });
  {
    /*      
       useUnityContext({
      loaderUrl: "build/RobotArm_React_WebGL (9-16-2022).loader.js",
      dataUrl: "build/RobotArm_React_WebGL (9-16-2022).data",
      frameworkUrl: "build/RobotArm_React_WebGL (9-16-2022).framework.js",
      codeUrl: "build/RobotArm_React_WebGL (9-16-2022).wasm",
    });
      */
  }

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
      setCurFrame(robotArmManager.frame);
    }
  }

  function sendAnimationCommand() {
    //my input on react to unity

    let signal = robotArmManager.SendAnimationCommand();
    props.changeMySignal(signal);
    console.log(signal);

    sendMessage("PeterGameController", "ReceiveAnimationFullUpdate", signal);
    sendMessage(
      "PeterGameController",
      "ReceiveAnimationFrameToDisplay",
      robotArmManager.frame
    );
  }

  function sendAnimationFrameToDisplay(dir) {
    updateFrame(dir);
    let signal = robotArmManager.SendAnimationCommand();
    sendMessage("PeterGameController", "ReceiveAnimationFullUpdate", signal);

    sendMessage(
      "PeterGameController",
      "ReceiveAnimationFrameToDisplay",
      robotArmManager.frame
    );
    setChangedFrame(true);
  }
  function sendAnimationSpeed() {
    sendMessage(
      "PeterGameController",
      "ReceiveAnimationSpeed",
      robotArmManager.speed
    );
  }
  function pushSignal() {
    console.log("help");
    sendMessage("PeterGameController", "SpawnEnemies", 100);
  }
  function changeDefPlayAnimation() {
    let signal = robotArmManager.SendAnimationCommand();

    sendMessage("PeterGameController", "ReceiveAnimationFullUpdate", signal);

    setPlayAnimation(true);
  }
  function PlayAnimation() {
    //console.log(playAnimation);
    if (playAnimation === true) {
      robotArmManager.frame += 1;
      robotArmManager.frame = robotArmManager.frame % 20;

      sendMessage(
        "PeterGameController",
        "PlayAnimation",
        robotArmManager.frame
      );
      setPlaying(
        setTimeout(() => {
          PlayAnimation();
        }, robotArmManager.speed * 1000)
      );
      //console.log(playAnimation);
    }
  }
  function StopAnimation() {
    //let signal = robotArmManager.SendAnimationCommand();
    //console.log(signal);
    //  sendMessage("PeterGameController", "ReceiveAnimationFullUpdate", signal);

    setPlayAnimation(false);
    console.log(playAnimation);
    sendMessage(
      "PeterGameController",
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
  function returnFrameButtonClass() {
    return;
    ("hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono flex-item");
  }

  function resetPose() {
    console.log("resetting pose...");
    animationServoWhichToChange(1, 0);
    animationServoWhichToChange(2, 0);
    animationServoWhichToChange(3, 0);
    animationServoWhichToChange(4, 0);
    animationServoWhichToChange(5, 0);
    animationServoWhichToChange(6, 0);
    // TODO reset slider
  }

  let list1 = [1, 2, 3, 4, 5, 6];
  let framelist = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];

  return (
    <>
      <div>
        {/* <button className="red" onClick={handleOnClickUnMountUnity}>
        (Un)mount Unity
        </button> */}

        {/* Olivia, Yasser, and John Choi are all not sure what this does so it's getting commented out: 
        <button
          className="bg-bots-orange hover:bg-bots-orange text-bots-gray font-bold px-4 rounded font-robotomono"
          onClick={sendAnimationCommand}
        >
          signal
        </button>
        <input className="bg-bots-yellow" onChange={setCustomSignal}></input>
        <span>signal: [{mySignal}]</span>
        <br />
        <br />
        <br />
        */}

        {/* Upper Third */}
        <div className="flex-container-centered">
          <div className="flex-item2">
            <span className="text-bots-light-gray font-bold text-xs">
              Speed:
            </span>
            <Slider min={0} max={10} defaultValue={1} disabled={true} />
            <span className="text-bots-white font-bold text-xs">.</span>
          </div>
          <div className="flex-item2">
            <input
              className="text-bots-light-gray font-bold border-2 rounded text-sm w-8 p-0.5"
              placeholder={robotArmManager.speed}
            />
          </div>

          <div className="flex-item2">
            <button className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold p-6 py-2 rounded font-robotomono">
              Toggle Drag-And-Teach Mode
            </button>
          </div>
          <div className="flex-item2">
            <button className="bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold p-6 py-2 rounded font-robotomono">
              Send Pose
            </button>
          </div>
          <div className="flex-item2">
            <button className="bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold p-6 py-2 rounded font-robotomono">
              Get Pose
            </button>
          </div>
          <div className="flex-item2">
            <button
              className="bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold p-6 py-2 rounded font-robotomono"
              onClick={() => {
                resetPose();
              }}
            >
              Reset Pose
            </button>
          </div>
          {/*
          <div className="flex-item2">
            <button className="bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold py-2 rounded font-robotomono">
              Save Angles To Keyframe
            </button>
          </div>
      */}
        </div>

        {/* Middle Third */}
        <div className="flex-container">
          <div className="flex-item-60">
            <div className="wrapper">
              <Unity className="canvas" unityProvider={unityProvider} />
            </div>
          </div>
          <div className="flex-item">
            {playAnimation
              ? list1.map((number, index) => {
                  return (
                    <>
                      <div>
                        <div className="flex-container-centered">
                          <button className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono">
                            -
                          </button>
                          <div className="flex-item-90">
                            <span className="text-bots-gray font-bold text-xs">
                              J{number}
                            </span>
                            <Slider
                              min={-90}
                              max={90}
                              defaultValue={robotArmManager.AnimationFrameReceive(
                                number
                              )}
                              value={joints[index]}
                              onChange={(value) => {
                                let newArr = joints;
                                newArr[index] = value;
                                setJoints(newArr);
                                animationServoWhichToChange(number, value);
                              }}
                            />
                          </div>
                          <button
                            className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono"
                            onClick={() => {
                              console.log(number + " plus!");
                            }}
                          >
                            +
                          </button>
                          <input
                            className="border-2 text-bots-blue rounded flex-item-15 text-sm"
                            type="number"
                            value={joints[index]}
                            readOnly={true}
                            onChange={() => {
                              let newArr = joints;
                              newArr[index] = value;
                              setJoints(newArr);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  );
                })
              : list1.map((number, index) => {
                  return (
                    <>
                      {/* todo make a slider component!! */}
                      <div>
                        <div className="flex-container-centered">
                          <button className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono">
                            -
                          </button>
                          <div className="flex-item-90">
                            <span className="text-bots-gray font-bold text-xs">
                              J{number}
                            </span>
                            <Slider
                              min={-90}
                              max={90}
                              value={robotArmManager.AnimationFrameReceive(
                                number
                              )}
                              onChange={(value) => {
                                let newArr = joints;
                                newArr[index] = value;
                                setJoints(newArr);
                                animationServoWhichToChange(number, value);
                              }}
                            />
                          </div>
                          <button
                            className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono"
                            onClick={() => {
                              console.log(number + " plus!");
                            }}
                          >
                            +
                          </button>
                          <input
                            className="border-2 text-bots-blue rounded flex-item-15 text-sm"
                            type="number"
                            value={robotArmManager.AnimationFrameReceive(
                              number
                            )}
                            readOnly={true}
                            onChange={() => {
                              let newArr = joints;
                              newArr[index] = value;
                              setJoints(newArr);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  );
                })}

            <div>
              <div className="flex-container-centered">
                <button className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono">
                  -
                </button>
                <div className="flex-item-90">
                  <span className="text-bots-gray font-bold text-xs">
                    Gripper
                  </span>
                  <Slider
                    min={0}
                    max={2}
                    defaultValue={1}
                    disabled={true}
                    onChange={(value) => {
                      //animationServoWhichToChange(number, value);
                      console.log("Implement gripper!");
                    }}
                  />
                </div>
                <button className="bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 rounded font-robotomono">
                  +
                </button>
                <input
                  className="border-2 text-bots-blue rounded flex-item-15 text-sm"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={() => {
                console.log("Implement save animation!");
              }}
            >
              🖫
            </button>
            <button
              className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={() => {
                sendAnimationFrameToDisplay(-1);
              }}
            >
              ◀◀
            </button>
            {playAnimation === false ? (
              <button
                className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                onClick={changeDefPlayAnimation}
              >
                ▶
              </button>
            ) : (
              <button
                className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                onClick={StopAnimation}
              >
                Stop
              </button>
            )}
            <button
              className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={() => {
                sendAnimationFrameToDisplay(1);
              }}
            >
              ▶▶
            </button>
            <button
              className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={() => {
                console.log("Implement save keyframe!");
              }}
            >
              ⯁
            </button>
            <button
              className="bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={() => {
                console.log("Implement delete animation!");
              }}
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {/* Lower Third */}
      <div className="flex-container">
        {framelist.map((number, index) => {
          return (
            <>
              <button
                className={
                  "font-bold rounded " +
                  (number == robotArmManager.frame + 1
                    ? "bg-bots-orange"
                    : "bg-bots-white")
                }
                onClick={() => {
                  console.log("Implement frame button!");
                }}
              >
                <p>⬦</p>
                <p>{number}</p>
              </button>
            </>
          );
        })}
      </div>
    </>
  );
}
