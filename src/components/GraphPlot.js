import React, { useEffect, useState } from "react";
import { Subscription } from "react-apollo";
import { gql } from "apollo-boost";
import * as moment from "moment";
import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js/dist/plotly-cartesian";

import Spinner from "./Spinner/Spinner";
import ActiveMetric from "./ActiveMetric/ActiveMetric";

const PlotlyComponent = createPlotlyComponent(Plotly);

const subscription = gql`
subscription {
  newMeasurement {
    metric
    value
    at
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
          value: call[i].value
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
  const [ flareGraphData, setFlareGraphData ] = useState({});
  const [ oilGraphData, setOilGraphData ] = useState({});
  const [ waterGraphData, setWaterGraphData ] = useState({});
  const [ casingGraphData, setCasingGraphData ] = useState({});
  const [ tubingGraphData, setTubingGraphData ] = useState({});
  const [ injGraphData, setInjGraphData ] = useState({});

  const fetchAll = () => {
    getMetric("flareTemp", setFlareTempArray);
    getMetric("oilTemp", setOilTempArray);
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

  const updateMetrics = data => {
    const newValue = {
      at: moment(data.at).format("MMM DD H:mm:ss A"),
      value: data.value
    }
    
    switch(data.metric) {
      case "oilTemp":
        if(oilTempArray) {
          const newOilArray = oilTempArray;
          newOilArray.shift();
          newOilArray.push(newValue);
          setNewOil(data.value);
          return setOilTempArray(newOilArray);
        }
        break;
      case "waterTemp":
        if(waterTempArray) {
          const newWaterArray = waterTempArray;
          newWaterArray.shift();
          newWaterArray.push(newValue);
          setNewWater(data.value);
          return setWaterTempArray(newWaterArray);
        }
        break;
      case "flareTemp":
        if(flareTempArray) {
          const newFlareArray = flareTempArray;
          newFlareArray.shift();
          newFlareArray.push(newValue);
          setNewFlare(data.value);
          return setFlareTempArray(newFlareArray);
        }
        break;
      case "tubingPressure":
        if(tubingPressureArray) {
          const newTubingArray = tubingPressureArray;
          newTubingArray.shift();
          newTubingArray.push(newValue);
          setNewTubing(data.value);
          return setTubingPressureArray(newTubingArray);
        }
        break;
      case "casingPressure":
        if(casingPressureArray) {
          const newCasingArray = casingPressureArray;
          newCasingArray.shift();
          newCasingArray.push(newValue);
          setNewCasing(data.value);
          return setCasingPressureArray(newCasingArray);
        }
        break;
      case "injValveOpen":
        if(injValveOpenArray) {
          const newInjArray = injValveOpenArray;
          newInjArray.shift();
          newInjArray.push(newValue);
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
      valueArray.push(item["value"])
      atArray.push(item["at"])
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
      <Subscription subscription={subscription}>
        {({ loading,  data}) => {
          if(!loading) {
            updateMetrics(data.newMeasurement)
          }

          if(oilTempArray && props.oilTemp) {
            setOilGraphData(buildDataObject(oilTempArray));
          }

          if(waterTempArray && props.waterTemp) {
            setWaterGraphData(buildDataObject(waterTempArray));
          }

          if(flareTempArray && props.flareTemp) {
            setFlareGraphData(buildDataObject(flareTempArray));
          }

          if(casingPressureArray && props.casingPressure) {
            setCasingGraphData(buildDataObject(casingPressureArray));
          }

          if(tubingPressureArray && props.tubingPressure) {
            setTubingGraphData(buildDataObject(tubingPressureArray));
          }

          if(injValveOpenArray && props.injValveOpen) {
            setInjGraphData(buildDataObject(injValveOpenArray));
          }

          let plotData = [
            {
              type: "scattergl",
              x: oilGraphData.at,
              y: oilGraphData.value,
              name: "Oil Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              maxdisplayed: 500,
              marker: {
                color: "rgb(0, 0, 0)"
              }
            },
            {
              type: "scattergl",
              x: waterGraphData.at,
              y: waterGraphData.value,
              name: "Water Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(135, 206, 250)"
              }
            },{
              type: "scattergl",
              x: flareGraphData.at,
              y: flareGraphData.value,
              name: "Flare Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(250, 100, 115)"
              }
            },{
              type: "scattergl",
              x: casingGraphData.at,
              y: casingGraphData.value,
              name: "Casing Pressure (PSI)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(50, 104, 243)"
              }
            },
            {
              type: "scattergl",
              x: tubingGraphData.at,
              y: tubingGraphData.value,
              name: "Tubing Pressure (PSI)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(204, 206, 43)"
              }
            },{
              type: "scattergl",
              x: injGraphData.at,
              y: injGraphData.value,
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
              nticks: 20
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