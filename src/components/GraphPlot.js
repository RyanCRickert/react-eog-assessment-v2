import React, { useEffect, useState } from "react";
import { Subscription } from "react-apollo";
import { gql } from "apollo-boost";
import * as moment from "moment";
import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js/dist/plotly-cartesian";

import Spinner from "./Spinner/Spinner";
import ActiveMetric from "./ActiveMetric/ActiveMetric";

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
          at: moment(call[i].at).format("MMM DD H:mm:ss A"),
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
  const [ metricsArray, setMetricsArray] = useState([]);
  const [ newOil, setNewOil ] = useState();
  const [ newWater, setNewWater ] = useState();
  const [ newFlare, setNewFlare ] = useState();
  const [ newCasing, setNewCasing ] = useState();
  const [ newTubing, setNewTubing ] = useState();
  const [ newValve, setNewValve ] = useState();

  const fetchAll = () => {
    getMetric("oilTemp", setOilTempArray);
    getMetric("flareTemp", setFlareTempArray);
    getMetric("waterTemp", setWaterTempArray);
    getMetric("tubingPressure", setTubingPressureArray);
    getMetric("casingPressure", setCasingPressureArray);
    getMetric("injValveOpen", setInjValveOpenArray);
  }

  useEffect(() => {
    const getMetrics = () => {
      const fullArray = Object.keys(props);
      const truthyArray = [];
  
      fullArray.forEach(item => {
        if(props[item]) {
          truthyArray.push(item);
        }
      })
  
      setMetricsArray(truthyArray);
    }

    fetchAll();
    getMetrics();
  }, [props])

  const updateMetric = (data) => {
    switch(data.metric) {
      case "oilTemp":
        let newOilValue = {
          at: moment(data.at).format("MMM DD H:mm:ss A"),
          value: data.value,
          unit: data.unit
        }
        
        if(oilTempArray) {
          const newOilArray = oilTempArray;
          newOilArray.push(newOilValue);
          newOilArray.unshift();
          setNewOil(data.value);
          return setOilTempArray(newOilArray);
        }
        break;
      case "waterTemp":
          let newWaterValue = {
            at: moment(data.at).format("MMM DD H:mm:ss A"),
            value: data.value,
            unit: data.unit
          }
          
          if(waterTempArray) {
            const newWaterArray = waterTempArray;
            newWaterArray.push(newWaterValue);
            newWaterArray.unshift();
            setNewWater(data.value);
            return setWaterTempArray(newWaterArray);
          }
          break;
      case "flareTemp":
          let newFlareValue = {
            at: moment(data.at).format("MMM DD H:mm:ss A"),
            value: data.value,
            unit: data.unit
          }
          
          if(flareTempArray) {
            const newFlareArray = flareTempArray;
            newFlareArray.push(newFlareValue);
            newFlareArray.unshift();
            setNewFlare(data.value);
            return setFlareTempArray(newFlareArray);
          }
          break;
      case "tubingPressure":
          let newTubingValue = {
            at: moment(data.at).format("MMM DD H:mm:ss A"),
            value: data.value,
            unit: data.unit
          }
          
          if(tubingPressureArray) {
            const newTubingArray = tubingPressureArray;
            newTubingArray.push(newTubingValue);
            newTubingArray.unshift();
            setNewTubing(data.value);
            return setTubingPressureArray(newTubingArray);
          }
          break;
      case "casingPressure":
          let newCasingValue = {
            at: moment(data.at).format("MMM DD H:mm:ss A"),
            value: data.value,
            unit: data.unit
          }
          
          if(casingPressureArray) {
            const newCasingArray = casingPressureArray;
            newCasingArray.push(newCasingValue);
            newCasingArray.unshift();
            setNewCasing(data.value);
            return setCasingPressureArray(newCasingArray);
          }
          break;
      case "injValveOpen":
          let newInjValue = {
            at: moment(data.at).format("MMM DD H:mm:ss A"),
            value: data.value,
            unit: data.unit
          }
          
          if(injValveOpenArray) {
            const newInjArray = injValveOpenArray;
            newInjArray.push(newInjValue);
            newInjArray.unshift();
            setNewValve(data.value);
            return setInjValveOpenArray(newInjArray);
          }
          break;
      default:
        break;
    }
  }

  const buildDataObject = array => {
    const atArray = [];
    const valueArray = [];

    array.forEach(item => {
      atArray.push(item["at"]);
      valueArray.push(item["value"])
    })

    return {
      at: atArray,
      value: valueArray
    };
  }

  const showActiveMetrics = () => {
    const newestValues = [
      {metric: "Oil Temp", value: newOil, prop: "oilTemp", unit: "°F"},
      {metric: "Flare Temp", value: newFlare, prop: "flareTemp", unit: "°F"},
      {metric: "Water Temp", value: newWater, prop: "waterTemp", unit: "°F"},
      {metric: "Casing Pressure", value: newCasing, prop: "casingPressure", unit: "PSI"},
      {metric: "Tubing Pressure", value: newTubing, prop: "tubingPressure", unit: "PSI"},
      {metric: "Injector Valve Open", value: newValve, prop: "injValveOpen", unit: "%"}
    ];

    return (
      newestValues.map(item => {
        if(props[item["prop"]]){
         return <ActiveMetric key={item["metric"]} metric={item["metric"]} value={item["value"]} unit={item["unit"]}/>
        } else {
          return null
        }
      })
    )
  }
    
  return (
    <React.Fragment>
      <Subscription subscription={subscribe}>
        {({ loading,  data}) => {
          if(!loading) {
            updateMetric(data.newMeasurement)
          }
          
          let oilTempObj = {};
          let waterTempObj = {};
          let flareTempObj = {};
          let casingPressureObj = {};
          let tubingPressureObj = {};
          let injValveOpenObj = {};
          

          if(oilTempArray && props.oilTemp) {
            oilTempObj = buildDataObject(oilTempArray)
          }

          if(waterTempArray && props.waterTemp) {
            waterTempObj = buildDataObject(waterTempArray)
          }

          if(flareTempArray && props.flareTemp) {
            flareTempObj = buildDataObject(flareTempArray)
          }

          if(casingPressureArray && props.casingPressure) {
            casingPressureObj = buildDataObject(casingPressureArray)
          }

          if(tubingPressureArray && props.tubingPressure) {
            tubingPressureObj = buildDataObject(tubingPressureArray)
          }

          if(injValveOpenArray && props.injValveOpen) {
            injValveOpenObj = buildDataObject(injValveOpenArray)
          }

          let plotData = [
            {
              type: "scatter",  // all "scatter" attributes: https://plot.ly/javascript/reference/#scatter
              x: oilTempObj.at,     // more about "x": #scatter-x
              y: oilTempObj.value,     // #scatter-y
              name: "Oil Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {         // marker is an object, valid marker keys: #scatter-marker
                color: "rgb(0, 0, 0)" // more about "marker.color": #scatter-marker-color
              }
            },
            {
              type: "scatter",
              x: waterTempObj.at,
              y: waterTempObj.value,
              name: "Water Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(135, 206, 250)"
              }
            },{
              type: "scatter",
              x: flareTempObj.at,
              y: flareTempObj.value,
              name: "Flare Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(250, 100, 115)"
              }
            },{
              type: "scatter",
              x: casingPressureObj.at,
              y: casingPressureObj.value,
              name: "Casing Pressure (PSI)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(50, 104, 243)"
              }
            },
            {
              type: "scatter",
              x: tubingPressureObj.at,
              y: tubingPressureObj.value,
              name: "Tubing Pressure (PSI)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(204, 206, 43)"
              }
            },{
              type: "scatter",
              x: injValveOpenObj.at,
              y: injValveOpenObj.value,
              name: "Injector Valve Open (%)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(250, 206, 43)"
              }
            }
          ];
          let layout = {
            title: "Metric Tracker",
            xaxis: {
              nticks: 10
            },
            yaxis: {
              title: "°F"
            },
            height: 700,
          };
          let config = {
            showLink: false,
            displayModeBar: true
          };

          return (
            <div>
            {loading ?
            <Spinner /> :
            metricsArray.length !== 0 ?
            <PlotlyComponent className="whatever" data={plotData} layout={layout} config={config}/> :
            <div>No data selected</div>}
            </div>
          )
        }}
      </Subscription>
      <div style={{width: "100%", display: "flex"}}>
        {showActiveMetrics()}
      </div>
      </React.Fragment>
  )
}

export default Graph;