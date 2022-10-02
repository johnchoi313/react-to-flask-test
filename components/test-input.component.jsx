import React, { useEffect, useState } from "react";

export default function TestInput() {

  const [sF, setSF] = useState("default");
  
  const handleSearchChange = (event) => {
    console.log("!!");
    const sFString = event.target.value.toLocaleLowerCase();
    setSF(sFString);
  };

  return (
    <div>
      <span>Test Input Component: </span>
      <input placeholder={sF} onChangeHandler={handleSearchChange} />
    </div>
  )
}

