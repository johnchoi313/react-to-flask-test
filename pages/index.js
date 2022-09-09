import Image from "next/image";
import React from "react";
import RobotArmManager from "./RobotArmManager";
import UnityWebPage from "./UnityWebProject";
import { useState } from "react";

export default function Home() {
  const [apiData, setApiData] = useState("");
  const [signal, setSignal] = useState("");
  const [apiFileData, setApiFileData] = useState("");
  const [apiSavedFileData, setApiSavedFileData] = useState("");

  function changeMySignal(outputJsonString) {
    setSignal(outputJsonString);
    console.log(`This is the output string: ${outputJsonString}`);
  }

  const handleFetchApiData = async () => {
    // const apiDataResponse = await fetch("http://127.0.0.1:5000/click");
    const apiDataResponse = await fetch(
      `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/click`
    );
    const apiDataJson = await apiDataResponse.json();
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  };

  const handleSendAllAnglesToApi = async () => {
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
    setApiFileData(apiFileDataJson["response"]);
    console.log(apiFileDataJson);
  };

  const handleSaveAsAnimationFile = async () => {
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
    console.log(apiSavedFileDataJson);
  };

  return (
    <div>
      <div className="flex items-center">
        <Image src="/logo.png" alt="Main logo" width="80" height="80" />
        <div className="text-bots-orange font-robotomono text-3xl bold">
          BotsIQ Cobot Challenge Interface
        </div>
      </div>
      <div className="flex">
        <div className="block">
          <button
            className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
            onClick={handleSendAllAnglesToApi}
          >
            Submit Movements
          </button>
          {apiData ? <div>{apiData}</div> : null}
        </div>
        <div className="block">
          <button
            className="m-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
            onClick={handleGetAllAnimationFiles}
          >
            Get All Animation Files
          </button>
          {apiFileData ? <div>{apiFileData}</div> : null}
        </div>
        <div className="block">
          <button
            className="m-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
            onClick={handleSaveAsAnimationFile}
          >
            Save As Animation File
          </button>
          {apiSavedFileData ? <div>{apiSavedFileData}</div> : null}
        </div>
      </div>
      <button>ds</button>
      <UnityWebPage changeMySignal={changeMySignal} />
    </div>
  );
}
