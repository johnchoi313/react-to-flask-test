import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import RobotArmManager from "./RobotArmManager";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

export default function UnityWebPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnityMounted, setIsUnityMounted] = useState(true);
  const [playAnimation, setPlayAnimation] = useState(false);
  const [mySignal, setmySignal] = useState([]);
  const [customSignal, setCustomSignal] = useState("my message!");
  const robotArmManager = useState(new RobotArmManager())


  const unityContext = new UnityContext({
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
  
  function animationServoWhichToChange( index,  myArmAnimationValue)
  {
      robotArmManager.AnimationUpdate(index, myArmAnimationValue);
  }
  useEffect(function () {
    unityContext.on("ReactReceiveMessage", function (strMine) {
      // my input in unity to react
      console.log(strMine);
      let mystr = strMine;
      let mystrSplit = [];
      mystrSplit = mystr.split(",");
      setmySignal(mystrSplit);
      console.log(mystrSplit);
      sendAnglesToApi(strMine);
      sendAnimationCommand();
    });
  }, []);
  // Built-in event invoked when the Unity canvas is ready to be interacted with.
  function handleOnUnityCanvas(canvas) {
    canvas.setAttribute("role", "unityCanvas");
  }
  // Built-in event invoked when the Unity app's progress has changed.
  function handleOnUnityProgress(progression) {
    setProgression(progression);
  }
  // Built-in event invoked when the Unity app is loaded.
  function handleOnUnityLoaded() {
    setIsLoaded(true);
  }
  // Event invoked when the user clicks the button, the unity container will be
  // mounted or unmounted depending on the current mounting state.
  function handleOnClickUnMountUnity() {
    if (isLoaded === true) {
      setIsLoaded(false);
    }
    setIsUnityMounted(isUnityMounted === false);
  }
  useEffect(() => {
    unityContext.on("canvas", handleOnUnityCanvas);
    // unityContext.on("progress", handleOnUnityProgress);
    unityContext.on("loaded", handleOnUnityLoaded);
    // When the component is unmounted, we'll unregister the event listener.
    return function () {
      unityContext.removeAllEventListeners();
    };
  }, []);

  function updateFrame(dir){
    if (robotArmManager.frame+dir<=60){
    robotArmManager.frame += dir;
  
  }
  else if (robotArmManager.frame+dir>=0) {
    robotArmManager.frame += dir;

  }
}


  function sendAnimationCommand() {
    //my input on react to unity
    let signal = robotArmManager.SendAnimationCommand();
    unityContext.send("GameController", "ReceiveAnimationFullUpdate", signal);
  }

  function sendAnimationFrameToDisplay(dir){
    updateFrame(dir);
    unityContext.send("GameController", "ReceiveAnimationFrameToDisplay", robotArmManager.frame);
  }
  function sendAnimationSpeed(){
    unityContext.send("GameController", "ReceiveAnimationSpeed", robotArmManager.speed);
  }
  function PlayAnimation(){
    setPlayAnimation(true);
    robotArmManager.frame += 1;
    robotArmManager.frame= robotArmManager.frame%60;

    unityContext.send("GameController", "ReceiveAnimationSpeed", robotArmManager.frame);
  }
  function StopAnimation(){
    setPlayAnimation(false);
    unityContext.send("GameController", "ReceiveAnimationSpeed", robotArmManager.frame);
  }
  useEffect(function(){
    if (playAnimation===true){
      PlayAnimation();
    }
  },[]);
  const list1 = [1,2,3,4,5,6];
  return (
    <div className="wrapper">
      {/* > */}
      {/* <button className="red" onClick={handleOnClickUnMountUnity}>
        (Un)mount Unity
      </button> */}
      <input onChange={setCustomSignal}></input>
      {/* <button
        onClick={() => {
          sendMessage(customSignal);
        }}
      >
        Send inputted
      </button> */}
      <p>{mySignal}</p>
      {list1.map((number,index)=>{
        <>
              <Slider min={-90} max={90} onChange={(value)=>{animationServoWhichToChange(number,value);sendAnimationCommand()}}/>

        </>
      })}
      <button onClick={playAnimation?StopAnimation():PlayAnimation()}>{playAnimation?"Play":"Pause"}</button>
      <button onClick={()=>{sendAnimationFrameToDisplay(1)}}>ForwardOneFrame</button>
      <button onClick={()=>{sendAnimationFrameToDisplay(-1)}}>BackOneFrame</button>

      {isUnityMounted === true && (
        <Unity className="canvas" unityContext={unityContext} />
      )}
    </div>
  );
}
