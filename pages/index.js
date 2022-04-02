import React from "react";
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
      <div>
        <button onClick={handleFetchApiData}>Hello</button>
        {apiData ? <div>{apiData}</div> : null}
      </div>
    </div>
  );
}
