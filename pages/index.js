
import { useState } from "react";
import React from "react";


export default function Home() {
  const [apiData, setApiData] = useState("");

  const handleFetchApiData = async () => {
    // const apiDataResponse = await fetch("/api/click");
    const apiDataResponse = await fetch("http://127.0.0.1:5000/click");
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
