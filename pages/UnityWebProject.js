import React, { useState, useEffect } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
export default function UnityWebPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnityMounted, setIsUnityMounted] = useState(false);

  const unityContext = new UnityContext({
    loaderUrl: "build/webgl.loader.js",
    dataUrl: "build/webgl.data",
    frameworkUrl: "build/webgl.framework.js",
    codeUrl: "build/webgl.wasm",

  });
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
    unityContext.on("progress", handleOnUnityProgress);
    unityContext.on("loaded", handleOnUnityLoaded);

    // When the component is unmounted, we'll unregister the event listener.
    return function () {
      unityContext.removeAllEventListeners();
    };

  }, []);
  return <div className="wrapper">>
    <button className="red" onClick={handleOnClickUnMountUnity}>(Un)mount Unity</button>
    {isUnityMounted === true && (
      <Unity className="canvas" unityContext={unityContext} />
    )}
    <p>dsd</p>
  </div>
}