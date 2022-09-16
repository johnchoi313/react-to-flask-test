import Image from "next/image";
import React from "react";
import RobotArmManager from "./RobotArmManager";
import UnityWebPage from "./UnityWebProject";
import { useState } from "react";

export default function Home() {
  const [apiData, setApiData] = useState("");
  const [signal, setSignal] = useState("");

  function changeMySignal(outputJsonString) {
    setSignal(outputJsonString);
    console.log(`This is the output string: ${outputJsonString}`);
  }

  const handleFetchApiData = async () => {
    // const apiDataResponse = await fetch("http://127.0.0.1:5000/click");
    const apiDataResponse = await fetch(
      `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/click`
      //`http://192.168.0.103:5000/click`
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
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  };

  return (
    <div>
      <div className="flex items-center">
        <Image src="/logo.png" alt="Main logo" width="80" height="80" />
        <div className="text-bots-orange font-robotomono text-3xl bold">
          BotsIQ Cobot Challenge Demo Interface
        </div>
      </div>
      <div>
        <UnityWebPage changeMySignal={changeMySignal} />
        <button
          className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={handleSendAllAnglesToApi}
        >
          Submit Movements
        </button>
        {apiData ? (
          <div>
            <p className="log-text">{apiData}</p>
          </div>
        ) : null}
      </div>
      {/*<button className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono">*/}
      <button className="my-3 text-bots-white">ds</button>
    </div>
  );
}
