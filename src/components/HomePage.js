import React, { useEffect, useState } from "react";
import { Subscription } from "react-apollo";
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

const getMetric = (metric, helperArray) => {
  const requestBody = {
    query: `
      query getMeasurements($metric: String!) {
        getMeasurements(input: {metricName : $metric}) {
          metric
          at
          value
          unit
        }
      }
    `,
    variables: {
      metric
    }
  };

    fetch("https://react.eogresources.com/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
      return res.json();
    }).then(resData => {
      if(resData.errors) {
        throw new Error(resData.errors[0].message)
      }

      const target = [];
      const call = resData.data.getMeasurements;

      for(let i = call.length -1; i >= call.length -100; i--) {
        target.push(call[i]);
      }

      return helperArray(target);
    })
    .catch(err => {
      console.log(err);
    })
}

const HomePage = props => {
  const [ metricArray , setMetricArray ] = useState();

  useEffect(() => {
    getMetric(props.metric, setMetricArray);
  }, [props])

  const updateValues = (data) => {
    const newValue = {
      metric: data.metric,
      at: data.at,
      value: data.value,
      unit: data.unit
    }

    if(metricArray) {
      const newArray = metricArray;

      newArray.unshift(newValue);
      newArray.pop();
      
      setMetricArray(newArray);
    }
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
            <div className="home">{metricArray && metricArray.map(item => {
          return <div key={item.at}>{item.metric} was at {item.value} {item.unit}.  {new Date(item.at).toString()}</div>
        })}</div>
          )
        }}
      </Subscription>
  )
}

export default HomePage;