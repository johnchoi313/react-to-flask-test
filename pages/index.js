import Image from "next/image";
import React from "react";
import UnityWebPage from "./UnityWebProject";
import { useState } from "react";

export default function Home() {
  const [apiData, setApiData] = useState("");

  const handleFetchApiData = async () => {
    // const apiDataResponse = await fetch("http://127.0.0.1:5000/click");
    const apiDataResponse = await fetch(
      `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/click`
    );
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
        <button
          className="my-3 bg-bots-yellow hover:bg-bots-orange text-bots-gray font-bold py-2 px-4 rounded font-robotomono"
          onClick={handleFetchApiData}
        >
          Submit Movements
        </button>
        {apiData ? <div>{apiData}</div> : null}
      </div>
      <UnityWebPage className="w-10" />
    </div>
  );
}
