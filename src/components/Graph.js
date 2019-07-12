import React from "react";
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

const getMetric = (metric, metricArray) => {
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
      return this.setState({
        [metricArray]: target
      });
    })
    .catch(err => {
      console.log(err);
    })
}

class Graph extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      flareTempArray: [],
      oilTempArray: [],
      waterTempArray: [],
      tubingPressureArray: [],
      casingPressureArray: [],
      injValveOpenArray: [],
      metricsArray: [],
      newOil: "",
      newWater: "",
      newFlare: "",
      newCasing: "",
      newTubing: "",
      newValve: ""
    }
  }
  
  componentDidMount() {
    //this.fetchAll();
    //this.getMetrics()
  }

  getMetrics = () => {
    const fullArray = Object.keys(this.props);
    const truthyArray = [];

    fullArray.forEach(item => {
      if(this.props[item]) {
        truthyArray.push(item);
      }
    })

    this.setState({
      metricsArray: truthyArray
    });
  }

  fetchAll = () => {
    getMetric("flareTemp", "flareTempArray");
    getMetric("oilTemp", "oilTempArray");
    getMetric("waterTemp", "waterTempArray");
    getMetric("tubingPressure", "tubingPressureArray");
    getMetric("casingPressure", "casingPressureArray");
    getMetric("injValveOpen", "injValveOpenArray");
  }

  updateMetrics = data => {
    const newValue = {
      at: moment(data.at).format("MMM DD H:mm:ss A"),
      value: data.value
  }
    
    switch(data.metric) {
      case "oilTemp":
        if(this.state.oilTempArray) {
          const newOilArray = this.state.oilTempArray;
          newOilArray.push(newValue);
          newOilArray.shift();
          return this.setState({
            oilTempArray: newOilArray,
            newOil: data.value
          })
        }
        break;
      case "waterTemp":
        if(this.state.waterTempArray) {
          const newWaterArray = this.state.waterTempArray;
          newWaterArray.push(newValue);
          newWaterArray.shift();
          return this.setState({
            waterTempArray: newWaterArray,
            newWater: data.value
          })
        }
        break;
      case "flareTemp":
        if(this.state.flareTempArray) {
          const newFlareArray = this.state.flareTempArray;
          newFlareArray.push(newValue);
          newFlareArray.shift();
          return this.setState({
            flareTempArray: newFlareArray,
            newFlare: data.value
          })
        }
        break;
      case "tubingPressure":
        if(this.state.tubingPressureArray) {
          const newTubingArray = this.state.tubingPressureArray;
          newTubingArray.push(newValue);
          newTubingArray.shift();
          return this.setState({
            tubingPressureArray: newTubingArray,
            newTubing: data.value
          })
        }
        break;
      case "casingPressure":
        if(this.state.casingPressureArray) {
          const newCasingArray = this.state.casingPressureArray;
          newCasingArray.push(newValue);
          newCasingArray.shift();
          return this.setState({
            casingPressureArray: newCasingArray,
            newCasing: data.value
          })
        }
        break;
      case "injValveOpen":
        if(this.state.injValveOpenArray) {
          const newInjArray = this.state.injValveOpenArray;
          newInjArray.push(newValue);
          newInjArray.shift();
          return this.setState({
            injValveOpenArray: newInjArray,
            newValve: data.value
          })
        }
        break;
      default:
        break;
    }
  }

  buildDataObject = array => {
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

  showActiveMetrics = props => {
    const newestValues = [
      {metric: "Oil Temp", value: this.state.newOil, prop: "oilTemp", unit: "°F"},
      {metric: "Flare Temp", value: this.state.newFlare, prop: "flareTemp", unit: "°F"},
      {metric: "Water Temp", value: this.state.newWater, prop: "waterTemp", unit: "°F"},
      {metric: "Casing Pressure", value: this.state.newCasing, prop: "casingPressure", unit: "PSI"},
      {metric: "Tubing Pressure", value: this.state.newTubing, prop: "tubingPressure", unit: "PSI"},
      {metric: "Injector Valve Open", value: this.state.newValve, prop: "injValveOpen", unit: "%"}
    ];

    return (
      newestValues.map(item => {
        if(this.props[item["prop"]]){
         return <ActiveMetric key={item["metric"]} metric={item["metric"]} value={item["value"]} unit={item["unit"]}/>
        } else {
          return null
        }
      })
    )
  }

  render() {
    
  return (
    <React.Fragment>
      <Subscription subscription={subscription}>
        {({ loading,  data}) => {
          if(!loading) {
            this.updateMetrics(data.newMeasurement)
          }
          
          var oilTempObj = {};
          var waterTempObj = {};
          var flareTempObj = {};
          var casingPressureObj = {};
          var tubingPressureObj = {};
          var injValveOpenObj = {};
          

          if(this.state.oilTempArray && this.props.oilTemp) {
            oilTempObj = this.buildDataObject(this.state.oilTempArray)
          }

          if(this.state.waterTempArray && this.props.waterTemp) {
            waterTempObj = this.buildDataObject(this.state.waterTempArray)
          }

          if(this.state.flareTempArray && this.props.flareTemp) {
            flareTempObj = this.buildDataObject(this.state.flareTempArray)
          }

          if(this.state.casingPressureArray && this.props.casingPressure) {
            casingPressureObj = this.buildDataObject(this.state.casingPressureArray)
          }

          if(this.state.tubingPressureArray && this.props.tubingPressure) {
            tubingPressureObj = this.buildDataObject(this.state.tubingPressureArray)
          }

          if(this.state.injValveOpenArray && this.props.injValveOpen) {
            injValveOpenObj = this.buildDataObject(this.state.injValveOpenArray)
          }

          let plotData = [
            {
              type: "scattergl",
              x: oilTempObj.at,
              y: oilTempObj.value,
              name: "Oil Temp (°F)",
              hoverlabel: {
                namelength: 30
              },
              marker: {
                color: "rgb(0, 0, 0)"
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
            this.state.metricsArray.length !== 0 ?
            <PlotlyComponent className="whatever" data={plotData} layout={layout} config={config}/> :
            <div>No data selected</div>}
            </div>
          )
        }}
      </Subscription>
      <div style={{width: "100%", display: "flex"}}>
        {this.showActiveMetrics()}
      </div>
      </React.Fragment>
  )
      }
}

export default Graph;