import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
export default function UnityWebPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnityMounted, setIsUnityMounted] = useState(true);
  const [mySignal, setmySignal] = useState([]);
  const [customSignal, setCustomSignal] = useState("my message!");
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
  function sendMessage(signal) {
    //my input on react to unity
    unityContext.send("GameController", "changeMessage", signal);
  }
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
      {isUnityMounted === true && (
        <Unity className="canvas" unityContext={unityContext} />
      )}
    </div>
  );
}
