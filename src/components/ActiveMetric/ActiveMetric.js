import React from "react";

import "./activeMetric.css";

export default props => {
  return (
    <div className="container">
      <div className="header">
        {props.metric}
      </div>
      <div className="body">
        {props.value} {props.unit}
      </div>
    </div>
  )
}