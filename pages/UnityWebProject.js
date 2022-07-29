import React, { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import RobotArmManager from "./RobotArmManager";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

export default function UnityWebPage() {
  const [isUnityMounted, setIsUnityMounted] = useState(true);
  const [playAnimation, setPlayAnimation] = useState(false);
  const [mySignal, setmySignal] = useState([]);
  const [customSignal, setCustomSignal] = useState("my message!");
  const robotArmManager = new RobotArmManager();


  const {unityProvider,sendMessage,isLoaded, loadingProgression} = useUnityContext({
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
      sendAnimationCommand();
  }
  function triggerSendSignals(){
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
  useEffect(function(){
    if (isLoaded){
      console.log(
        "log"
      );
      sendAnimationCommand();

    }
  },[isLoaded]);
  // Event invoked when the user clicks the button, the unity container will be
  // mounted or unmounted depending on the current mounting state.
  function handleOnClickUnMountUnity() {
    if (isLoaded === true) {
      setIsLoaded(false);
    }
    setIsUnityMounted(isUnityMounted === false);
  }


  function updateFrame(dir){
    if (robotArmManager.frame+dir<=20){
    robotArmManager.frame += dir;
  
  }
  else if (robotArmManager.frame+dir>0) {
    robotArmManager.frame += dir;

  }
}


  function sendAnimationCommand() {
    //my input on react to unity
    let signal = robotArmManager.SendAnimationCommand();
    console.log(signal);
    sendMessage("GameController", "ReceiveAnimationFullUpdate", signal);
    //sendMessage("GameController", "ReceiveAnimationFrameToDisplay", robotArmManager.frame);

  }

  function sendAnimationFrameToDisplay(dir){
    updateFrame(dir);
    sendMessage("GameController", "SpawnEnemies", 100);

  }
  function sendAnimationSpeed(){
    sendMessage("GameController", "ReceiveAnimationSpeed", robotArmManager.speed);
  }
  function pushSignal(){

    console.log("help");
    sendMessage("GameController", "SpawnEnemies", 100);

  }
  function PlayAnimation(){
    setPlayAnimation(true);
    robotArmManager.frame += 1;
    robotArmManager.frame= robotArmManager.frame;

    sendMessage("GameController", "ReceiveAnimationSpeed", robotArmManager.frame);
  }
  function StopAnimation(){
    setPlayAnimation(false);
    sendMessage("GameController", "ReceiveAnimationSpeed", robotArmManager.frame);
  }
  useEffect(function(){
    if (playAnimation===true){
      PlayAnimation();
    }
  },[]);
  let list1 = [1,2,3,4,5,6];
  return (
    <>
    <div>
      {/* > */}
      {/* <button className="red" onClick={handleOnClickUnMountUnity}>
        (Un)mount Unity
      </button> */}
      <input onChange={setCustomSignal}></input>

      <p>{mySignal}</p>
      {list1.map((number,index)=>{
        return (
        <>
              <Slider min={-90} max={90} onChange={(value)=>{animationServoWhichToChange(number,value)}}/>

        </>
        )
      })}
      
      <button onClick={sendAnimationFrameToDisplay(1)}>ForwardOneFrame</button>
      <button onClick={sendAnimationFrameToDisplay(-1)}>BackOneFrame</button>
      </div>
      <button onClick={sendAnimationCommand}>signal</button>
    <div className="wrapper">
      


        <Unity className="canvas" unityProvider={unityProvider} />
    
    </div>
    </>
  );
}
