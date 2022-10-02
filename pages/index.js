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
  const [apiSingleFileData, setApiSingleFileData] = useState("");

  function changeMySignal(outputJsonString) {
    setSignal(outputJsonString);
    console.log(`This is the output string: ${outputJsonString}`);
  }
  /*

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

  async function handleSendSingleFile(item) {
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

  function makeActiveSignal(item) {
    console.log(`Will play ${item} file`);
  }
  */

  return (
    <div>
        {/*
          <button
            className="text-xs bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
            onClick={handleSendAllAnglesToApi}>
              DONE: Submit Movements
          </button>
        </div>
       
        <div className="block">
          <button
            className="text-xs bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
            onClick={handleGetAllAnimationFiles}>
              DONE: Get All Animation Files
          </button>

          
          <button
              className="text-xs bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
              onClick={handleSaveAsAnimationFile}
            >
              Save As Animation File
            </button>
            */}

          {/*
          {apiFileData ? (
            <ul>
              {apiFileData.map((item) => {
                return (
                  <li key={item}>
                    <button
                      className="m-1 text-sm bg-bots-orange hover:bg-bots-red text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
                      onClick={() => handleSendSingleFile(item)}
                      // onClick={() => makeActiveSignal(item)}
                    >
                      {item}
                    </button>
                    <br></br>
                  </li>
                );
              })}
            </ul>
          ) : null}

        </div>
        <div className="flex">
          <div className="block">
          </div>
          <div>
            <label
              for="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              First name
            </label>
            <input
              type="text"
              id="first_name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              defaultValue="Hello"
              required
            />
          </div>
          
      <hr />
          */}

      <div>
      <div className="flex items-center">
        <Image src="/logo.png" alt="Main logo" width="80" height="80" />
        <div className="text-bots-orange font-robotomono text-4xl bold">
          BotsIQ Cobot Challenge Demo Interface
        </div>
      </div>
      <div>
        <UnityWebPage changeMySignal={changeMySignal} />
        {/*
        <button
          className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={handleSendAllAnglesToApi}
        >
          Submit Movements
        </button>*/}
        {apiData ? (
          <div>
            <p className="log-text">{apiData}</p>
          </div>
        ) : null}
      </div>
      {/*<button className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono">*/}
      <button className="my-3 text-bots-white">ds</button>
    </div>

    </div>
  );
}
