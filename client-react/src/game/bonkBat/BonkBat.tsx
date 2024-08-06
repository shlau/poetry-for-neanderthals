import React from "react";
import * as bonkPng from "../../assets/bonk-bat.png";
import "./BonkBat.less";

export default function BonkBat() {
  return (
    <React.Fragment>
      <img src={bonkPng.default} />
    </React.Fragment>
  );
}
