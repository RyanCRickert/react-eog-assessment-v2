import React, { useEffect, useState } from "react";
import { Subscription } from "react-apollo";
import { gql } from "apollo-boost";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import * as moment from 'moment';

import Spinner from "./Spinner/Spinner";

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

      for(let i = call.length -1; i >= call.length -1500; i--) {
        target.push({
          [metric]: call[i].metric,
          [metric + "At"]: moment(call[i].at).format('MMM DD YYYY H:mm:ss A'),
          [metric + "Value"]: call[i].value,
          [metric + "Unit"]: call[i].unit
        });
      }
      return helperArray(target);
    })
    .catch(err => {
      console.log(err);
    })
}

const Graph = props => {

  const [ flareTempArray , setFlareTempArray ] = useState();
  const [ oilTempArray , setOilTempArray ] = useState();
  const [ waterTempArray , setWaterTempArray ] = useState();
  const [ tubingPressureArray , setTubingPressureArray ] = useState();
  const [ casingPressureArray , setCasingPressureArray ] = useState();
  const [ injValveOpenArray , setInjValveOpenArray ] = useState();
  const hasTemp = props.flareTemp || props.oilTemp || props.waterTemp;
  const hasPressure = props.tubingPressure || props.casingPressure;

  let metricsArray = ["oilTemp", "waterTemp", "flareTemp", "tubingPressure", "casingPressure", "injValveOpen"];

  metricsArray.forEach(metric => {
    switch(metric) {
      case "waterTemp":
        return getMetric(metric, setWaterTempArray);
      case "oilTemp":
        return getMetric(metric, setOilTempArray);
      case "flareTemp":
        return getMetric(metric, setFlareTempArray);
      case "tubingPressure":
        return getMetric(metric, setTubingPressureArray);
      case "casingPressure":
        return getMetric(metric, setCasingPressureArray);
      case "injValveOpen":
        return getMetric(metric, setInjValveOpenArray);
      default:
        break;
    }
  })

  const updateMetric = (data, metric) => {
    const newValue = {
      [metric]: data.metric,
      [metric + "At"]: moment(data.at).format('MMM DD YYYY H:mm:ss A'),
      [metric + "Value"]: data.value,
      [metric + "Unit"]: data.unit
    }

    switch(metric) {
      case "waterTemp":
        if(waterTempArray) {
          const newWaterArray = waterTempArray;
          newWaterArray.unshift(newValue);
          newWaterArray.pop();
          return setWaterTempArray(newWaterArray);
        }
        break;
      case "oilTemp":
        if(oilTempArray) {
          const newOilArray = oilTempArray;
          newOilArray.unshift(newValue);
          newOilArray.pop();
          return setOilTempArray(newOilArray);
        }
        break;
      case "flareTemp":
        if(flareTempArray) {
          const newFlareArray = flareTempArray;
          newFlareArray.unshift(newValue);
          newFlareArray.pop();
          return setFlareTempArray(newFlareArray);
        }
        break;
      case "tubingPressure":
        if(tubingPressureArray) {
          const newTubingArray = tubingPressureArray;
          newTubingArray.unshift(newValue);
          newTubingArray.pop();
          return setTubingPressureArray(newTubingArray);
        }
        break;
      case "casingPressure":
        if(casingPressureArray) {
          const newCasingArray = casingPressureArray;
          newCasingArray.unshift(newValue);
          newCasingArray.pop();
          return setCasingPressureArray(newCasingArray);
        }
        break;
      case "injValveOpen":
        if(injValveOpenArray) {
          const newInjArray = injValveOpenArray;
          newInjArray.unshift(newValue);
          newInjArray.pop();
          return setInjValveOpenArray(newInjArray);
        }
        break;
      default:
        break;
    }
  }

  const buildPlotObject = (metric) => {
    switch(metric) {
      case "waterTemp":
          let waterTempAt = [];
          waterTempArray && waterTempArray.map(item => {
            return waterTempAt.push(item.at);
          })
          let waterTempValue = [];
          waterTempArray && waterTempArray.map(item => {
            return waterTempValue.push(item.value);
          })
          return {
            x: waterTempAt,
            y: waterTempValue,
            type: 'scatter',
            mode: 'lines+points',
            marker: {color: 'blue'}
          };
      case "oilTemp":
          let oilTempAt = [];
          oilTempArray && oilTempArray.map(item => {
            return oilTempAt.push(item.at);
          })
          let oilTempValue = [];
          oilTempArray && oilTempArray.map(item => {
            return oilTempValue.push(item.value);
          })
          return {
            x: oilTempAt,
            y: oilTempValue,
            type: 'scatter',
            mode: 'lines+points',
            marker: {color: 'red'}
          };
      case "flareTemp":
        break;
      case "tubingPressure":
         break;
      case "casingPressure":
         break;
      case "injValveOpen":
        break;
      default:
        break;
    }
  }

  const buildMetricArray = () => {
    const metricArray = [];

    console.log(metricsArray);
  }

  return (
    <React.Fragment>
      <Subscription subscription={subscribe}>
        {({ loading,  data}) => {
          if(!loading) {
            metricsArray.forEach(metric => {
              if(props[metric] && metric === data.newMeasurement.metric) {
                //updateMetric(data.newMeasurement, metric);
              }
            })
          }

          let fullArray = [];

          if(waterTempArray && oilTempArray) {
            for(let i = 0; i < 1500; i++) {
              fullArray.push({
                "Water temp": waterTempArray[i].waterTempValue,
                waterTempAt: waterTempArray[i].waterTempAt,
                "Oil temp": oilTempArray[i].oilTempValue,
                oilTempAt: oilTempArray[i].oilTempAt
              })
            }
          }

          return (
            loading ?
            <Spinner /> :
            <LineChart width={1600} height={800} data={fullArray} >
            <Line dot={false} stroke="#ff0000" dataKey="Oil temp" />
            <Line dot={false} dataKey="Water temp" />
            <CartesianGrid stroke="#ccc" />
            <XAxis minTickGap={50} dataKey="oilTempAt" reversed />
            <XAxis minTickGap={50} dataKey="waterTempAt" reversed />
            {hasTemp &&
              <YAxis label={{ value: 'Temperature', angle: -90, position: 'insideLeft' }} domain={["auto", "auto"]} />
            }
            {hasPressure &&
              <YAxis label={{ value: 'PSI', angle: -90, position: 'insideLeft' }} domain={["auto", "auto"]} />
            }
            <Tooltip />
          </LineChart>
          )
        }}
      </Subscription>
      </React.Fragment>
  )
}

export default Graph;






/*

            <Plot
            data={[{
              x: oilTempAt,
              y: oilTempValue,
              type: 'scatter',
              mode: 'lines+points',
              marker: {color: 'red'}
            },
            {
              x: waterTempAt,
              y: waterTempValue,
              type: 'scatter',
              mode: 'lines+points',
              marker: {color: 'blue'}
            }]}
            layout={ {width: 1600, height: 800, title: 'A Fancy Plot'} }
            />



*/