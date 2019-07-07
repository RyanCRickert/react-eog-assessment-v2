import React, { useEffect, useState } from "react";
import { Subscription } from "react-apollo";
import { gql } from "apollo-boost";
import * as moment from 'moment';
import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-cartesian';

import Spinner from "./Spinner/Spinner";

const PlotlyComponent = createPlotlyComponent(Plotly);
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
        target.unshift({
          at: moment(call[i].at).format('MMM DD H:mm:ss A'),
          value: call[i].value,
          unit: call[i].unit
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

  const help = props.oilTemp;

  let metricsArray = [];

  const fetchAll = () => {
    getMetric("oilTemp", setOilTempArray);
    getMetric("flareTemp", setFlareTempArray);
    getMetric("waterTemp", setWaterTempArray);
    getMetric("tubingPressure", setTubingPressureArray);
    getMetric("casingPressure", setCasingPressureArray);
    getMetric("injValveOpen", setInjValveOpenArray);
  }

  useEffect(() => {
    fetchAll();
    metricsArray
  }, [props.oilTemp])

  
  const updateMetric = (data, metric) => {
    const newValue = {
      at: moment(data.at).format('MMM DD H:mm:ss A'),
      value: data.value,
      unit: data.unit
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
          newOilArray.push(newValue);
          newOilArray.unshift();
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

  const updateMetric2 = (data) => {
    if(data.metric === "oilTemp") {

      const newValue = {
        at: moment(data.at).format('MMM DD H:mm:ss A'),
        value: data.value,
        unit: data.unit
      }
      
      if(oilTempArray) {
        const newOilArray = oilTempArray;
        newOilArray.push(newValue);
        newOilArray.unshift();
        return setOilTempArray(newOilArray);
      }
    }
  }

  const buildArray = (array, value) => {
    const fullArray = [];

    array.forEach(item => {
      fullArray.push(item[value]);
    })

    return fullArray;
  }
    
  return (
    <React.Fragment>
      <Subscription subscription={subscribe}>
        {({ loading,  data}) => {
          if(!loading) {
            updateMetric2(data.newMeasurement)
          }
          
          let oilTempAt = [];
          let oilTempValue = [];
          

          if(oilTempArray && props.oilTemp) {
            oilTempAt = buildArray(oilTempArray, "at")
            oilTempValue = buildArray(oilTempArray, "value")
          }

          let plotData = [
            {
              type: 'scatter',  // all "scatter" attributes: https://plot.ly/javascript/reference/#scatter
              x: oilTempAt,     // more about "x": #scatter-x
              y: oilTempValue,     // #scatter-y
              marker: {         // marker is an object, valid marker keys: #scatter-marker
                color: 'rgb(16, 32, 77)' // more about "marker.color": #scatter-marker-color
              }
            }
          ];
          let layout = {                     // all "layout" attributes: #layout
            title: 'Metric Tracker',  // more about "layout.title": #layout-title
            xaxis: {                  // all "layout.xaxis" attributes: #layout-xaxis
              title: 'time'         // more about "layout.xaxis.title": #layout-xaxis-title
            }
          };
          let config = {
            showLink: false,
            displayModeBar: true
          };

          return (
            loading ?
            <Spinner /> :
            <PlotlyComponent className="whatever" data={plotData} layout={layout} config={config}/>
          )
        }}
      </Subscription>
      </React.Fragment>
  )
}

export default Graph;