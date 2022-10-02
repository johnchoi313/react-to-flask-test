import TestInput from "../components/test-input.component";

import "rc-slider/assets/index.css";
import TextField from "@material-ui/core/TextField";

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

  const [maxFrames, setMaxFrames] = useState(12);
  const [changedFrame, setChangedFrame] = useState(false);
  const [playing, setPlaying] = useState();

  function updateMaxFrames(newMaxFrames) {
    setMaxFrames(newMaxFrames);
    framelist = [...Array(maxFrames).keys()];
  }

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
    if (robotArmManager.frame + dir < maxFrames && robotArmManager.frame + dir >= 0) { // TODO LIV maxFrames
      robotArmManager.frame += dir;
      setCurFrame(robotArmManager.frame); // TODO LIV - would like to add hooks to robotArmManager so we don't need this redundancy just to trigger changes that rely on state
    }
  }

  function sendAnimationCommand() {
    //my input on react to unity

    let signal = robotArmManager.SendAnimationCommand();
    props.changeMySignal(signal);
    //console.log(signal);

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
    console.log("gV");
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


  const [apiData, setApiData] = useState("");
  const [signal, setSignal] = useState("");
  const [apiFileData, setApiFileData] = useState("");
  const [apiSavedFileData, setApiSavedFileData] = useState("");
  const [apiSingleFileData, setApiSingleFileData] = useState("");

  const [loadAnimationMenuVisible, setLoadAnimationMenuVisible] = useState(false);
  const [deleteAnimationMenuVisible, setDeleteAnimationMenuVisible] = useState(false);
  
  const toggleLoadAnimationMenuVisible = async() => {
    setDeleteAnimationMenuVisible(false);
    if (!loadAnimationMenuVisible) {
      await handleGetAllAnimationFiles();
      setLoadAnimationMenuVisible(true);       
    }
    else {
      setLoadAnimationMenuVisible(false);
    }
  }
  const toggleDeleteAnimationMenuVisible = async() => {
    console.log("checkpoint 1");
    setLoadAnimationMenuVisible(false);
    if (!deleteAnimationMenuVisible) {
      await handleGetAllAnimationFiles();
      console.log("checkpoint 2");
      setDeleteAnimationMenuVisible(true);       
    }
    else {
      setDeleteAnimationMenuVisible(false);
    }
  }
  
  function changeMySignal(outputJsonString) {
    setSignal("CHECK2-"+outputJsonString);
    console.log(`This is the output string: ${outputJsonString}`);
  }
  function makeActiveSignal(item) {
    console.log(`Will play ${item} file`);
  }

  const handleSendClick = async () => {
    console.log("sending click...");
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/click`;
    const apiDataResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiDataJson = await apiDataResponse.json();
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  };
  
  const handleSendAllAnglesToApi = async () => {
    let signal = robotArmManager.SendAnimationCommand();
    props.changeMySignal(signal);

    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/send-angles-sequence?angles_sequence=${signal}`;
    const apiDataResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiDataJson = await apiDataResponse.json();
    setApiFileData(apiDataJson["response"]);
    console.log(apiDataJson);
  };

  const handleGetAllAnimationFiles = async () => {
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/get-all-animation-files`;
    const apiFileDataResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiFileDataJson = await apiFileDataResponse.json();
    setApiFileData(apiFileDataJson["response"].sort());
    console.log(apiFileDataJson);
    return true;
  };
  
  const handleSaveAsAnimationFile = async () => {
    let signal = robotArmManager.SendAnimationCommand();
    props.changeMySignal(signal); 
    
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/save-as-animation-file?angles_sequence=${signal}`;
    const apiSavedFileDataResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiSavedFileDataJson = await apiSavedFileDataResponse.json();
    setApiSavedFileData(apiSavedFileDataJson["response"]);
    handleGetAllAnimationFiles(); // reload the list of available files
    console.log(apiSavedFileDataJson);
  };

  const handleTurnMotorsOff = async () => {
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/turn-off-motors`;
    const apiDataResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiDataJson = await apiDataResponse.json();
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  }

  const handleSendPose = async () => {
    // TODO written by Olivia - check in that this is all good
    let signal = [0,1,2,3,4,5].map((armIndex) => {
      return robotArmManager.AnimationFrameReceive(armIndex);
    }).join(",");
    props.changeMySignal(signal); 

    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/send-pose?angles=${signal}`;
    const apiDataResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiDataJson = await apiDataResponse.json();
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  }

  async function handleGetSingleFile(item) { // TODO connect this to a button
    console.log("Need to make the main file");
    const url = `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/get-single-file?file=${item}`;
    const apiSingleFileDataResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const apiSingleFileDataJson = await apiSingleFileDataResponse.json();
    setApiSingleFileData(apiSingleFileDataJson["response"]);
    setSignal(apiSingleFileData);
    console.log(signal);
  }

  let list1 = [1, 2, 3, 4, 5, 6];
  let framelist = [...Array(maxFrames).keys()]; // TODO LIV this shouldn't have to be set from updateMaxFrames



  const [sF, setSF] = useState("default");
  
  const handleSearchChange = (event) => {
    console.log("!!");
    const sFString = event.target.value;
    setSF(sFString);
  };
  function handleSubmit(event) {
    console.log("!");
    alert('A name was submitted: ');
    console.log(event);
    console.log(event.target);
    console.log(event.target.value);
    event.preventDefault();
  }

  let testInputRef = React.createRef();
  //console.log(testInputRef);

  return (
    <>
      <div>
        
    {<p className="text-xs font-robotomono">SIG: {signal}</p>}
    {<p className="text-xs font-robotomono">API DATA: {apiData}</p>}
    {<p className="text-xs font-robotomono">API FILE DATA: {apiFileData}</p>}

    {/*
          <button onClick={handleSendClick}>Send Click</button>
          <button onClick={handleSendAllAnglesToApi}>Submit Movements</button>
          <button onClick={handleGetAllAnimationFiles}>Get All Animation Files</button>
          <button onClick={handleSaveAsAnimationFile}>Save As Animation File</button>
    */}
          {/*
        <TextField id="outlined-basic" label="Outlined" variant="outlined" /> */}

  <br />
  

  <div>
    
  <form onSubmit={handleSubmit}>
      <span>Test Input Component: </span>
      <input 
        value={sF}
        onChange={(e) => {handleSearchChange(e)}} 
        />
        <input type="submit" value="Submit" />

      <button onClick={() => {setSF("ok!!")}}>ok!!</button>
  </form>

  </div>


  <br />

  <hr />

        {/* Upper Third */}
        <div className="flex-container-centered">
          <div className="flex-item">
            <p className="text-bots-light-gray font-bold text-xs my-2">
              Speed:
            </p>
            <Slider min={0} max={10} defaultValue={1} disabled={true} />
          </div>
            <input
              className="flex-item text-bots-light-gray font-bold border-2 rounded text-sm p-1 m-4"
              placeholder={robotArmManager.speed}
            />

            <button 
              className="flex-item bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold px-2 py-2 rounded font-robotomono"
              onClick={handleTurnMotorsOff}>
                Toggle Drag & Teach Mode
            </button>
            <button className="flex-item bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold px-2 py-2 rounded font-robotomono">
              Get Pose From Cobot
            </button>
            <button 
              className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold px-2 py-2 rounded font-robotomono"
              onClick={handleSendPose}>
                Send Pose To Cobot
            </button>
            <button
              className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold px-2 py-2 rounded font-robotomono"
              onClick={() => {
                resetPose();
              }}
            >
              Reset Sliders
            </button>
        </div>

        {/* Middle Third */}
        <div className="flex-container">
            <div className="flex-item-50 wrapper">
              <Unity className="canvas" unityProvider={unityProvider} />
            </div>
          <div className="flex-item-50">
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
                              /*value={joints[index]}*/
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
                            className="border-2 text-bots-blue rounded flex-item-20 text-sm"
                            type="number"
                            defaultValue={joints[index]}
                            readOnly={false}
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
                              min={-120}
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
                            className="border-2 text-bots-blue rounded flex-item-20 text-sm"
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
                  className="border-2 text-bots-blue rounded flex-item-20 text-sm"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>


            <div className="flex-container-centered">
                
                <button
                  className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                  onClick={() => {
                    sendAnimationFrameToDisplay(-1);
                  }}
                >
                  <p>◀◀</p>
                  <p className="text-xs">Prev Frame</p>
                </button>

                {playAnimation === false ? (
                  <button
                    className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                    onClick={changeDefPlayAnimation}
                  >
                  <p>▶</p>
                  <p className="text-xs">Play Animation</p>
                  </button>
                ) : (
                  <button
                    className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                    onClick={StopAnimation}
                  >
                  <p> </p>
                  <p className="text-xs">Stop Animation</p>
                  </button>
                )}

                <button
                  className="flex-item bg-bots-light-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                  onClick={() => {
                    sendAnimationFrameToDisplay(1);
                  }}
                >
                  <p>▶▶</p>
                  <p className="text-xs">Next Frame</p>
                </button>

            </div>

            <div className="flex-container">
              <button
                className="flex-item-third bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                onClick={() => {
                  console.log("Implement save keyframe!");
                }}
              >
                  <p>⯁</p>
                  <p className="text-xs">Toggle Keyframe</p>
              </button>
              <button
                className="flex-item bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                onClick={handleSendAllAnglesToApi}
              >
              <p>[icon]</p>
              <p className="text-xs">Send Current Animation To Cobot</p>
              </button>
              {/*
              <button
                className="flex-item bg-bots-light-gray hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                onClick={() => {
                  console.log("empty button");
                }}
              >
              <p>[icon]</p>
              <p className="text-xs">Empty</p>
              </button>
              */}
            </div>
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

      <div className="flex-container-centered">

        <button
          className="flex-item bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={handleSaveAsAnimationFile}>
            <p><span className="text-xl">🖫 </span>Save Animation File</p>
        </button>

        <button
          className="flex-item bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={toggleLoadAnimationMenuVisible}>
            <p><span className="text-2xl">{loadAnimationMenuVisible ? "^" : "▼"}</span> Load Animation Files</p>
        </button>

        <button
          className="flex-item bg-bots-blue hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={toggleDeleteAnimationMenuVisible}>
            <p><span className="text-2xl">{deleteAnimationMenuVisible ? "^" : "▼" }</span> Delete Animation Files</p>
        </button>
      </div>

      <div className="flex-container">
        {
          (loadAnimationMenuVisible) ? apiFileData.map((fileName) => {
            return <button 
                    className="flex-item bg-bots-yellow hover:bg-bots-orange" 
                    key={fileName}
                    onClick={() => {handleGetSingleFile(fileName)}}>
                      {fileName}
                    </button>}) 
          : null
        }
        
        {
          (deleteAnimationMenuVisible) ? apiFileData.map((fileName) => {
            return <button 
                    className="flex-item bg-bots-yellow hover:bg-bots-orange" 
                    key={fileName}
                    onClick={() => {console.log("Delete: " + fileName)}}>
                      {fileName}
                    </button>}) 
          : null
        }
      </div>

    </>
  );
}
