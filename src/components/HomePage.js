import React, { useState } from "react";
import { Query, Subscription } from "react-apollo";
import { gql } from "apollo-boost";

const subscribe = gql`
subscription {
  newMeasurement {
    metric
    value
    at
    unit
  }
}
`;

const query = gql`
query {
  getMeasurements(input: {metricName: "oilTemp"}) {
    value
  }
}
`;

const HomePage = props => {
  const [ metric , setMetric ] = useState();
  const [ at , setAt ] = useState();
  const [ value , setValue ] = useState();
  const [ unit , setUnit ] = useState();

  const updateValues =(data) => {
    setMetric(data.metric);
    setAt(data.at);
    setValue(data.value);
    setUnit(data.unit);
  }
  

  return (
    <Subscription subscription={subscribe}>
      {({ loading,  data}) => {
        if(!loading && data.newMeasurement.metric === props.metric) {
          updateValues(data.newMeasurement);
        }

        return (
          loading ?
          <div>Loading...</div> :
          <div className="home">{metric} is currently at {value} {unit}.  {new Date(at).toString()}</div>
        )
      }}
    </Subscription>
  )
}

HomePage.defaultProps = {
  metric: "tubingPressure"
}

export default HomePage;