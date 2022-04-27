import React from "react";
import { useState, useRef } from "react";

export default function Home() {
  const [apiData, setApiData] = useState("");

  let initialFields = [
    { "name": "axis1", "axis": [0] },
    { "name": "axis2", "axis": [0] },
    { "name": "axis3", "axis": [0] },
    { "name": "axis4", "axis": [0] },
    { "name": "axis5", "axis": [0] },
    { "name": "axis6", "axis": [0] },
  ];

  const [inputFields, setInputFields] = useState(initialFields);

  const handleFetchApiData = async () => {
    // const apiDataResponse = await fetch("http://127.0.0.1:5000/click");
    const apiDataResponse = await fetch(
      `http://${process.env.NEXT_PUBLIC_PUBLIC_IP_ADDRESS}:5000/click`
    );
    const apiDataJson = await apiDataResponse.json();
    setApiData(apiDataJson["response"]);
    console.log(apiDataJson);
  };
  const getInputValue = (event) => {
    const userValue = event.target.value;
    console.log(userValue);
  }
  return (
    <div>
      <div>
        <button onClick={handleFetchApiData}>Hello</button>
        {apiData ? <div>{apiData}</div> : null}

      </div>
      <div>
        {(inputFields.map((index) => (<input type="number" label={inputFields[index.name]} onChange={e => { setInputFields({ ...inputFields, [inputFields[index]]: { ...inputFields[index], "axis": { e } } }) }} value={inputFields[index.axis]} />)))}
      </div>
    </div>
  );
}
