import React, { useState } from "react";
import createStore from "./store";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import GraphPlot from "./components/GraphPlot";

//import GraphPlot from "./components/Graph";
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const httpLink = createHttpLink({
  uri: 'https://react.eogresources.com/graphql'
});

const wsLink = new WebSocketLink({
  uri: `ws://react.eogresources.com/graphql`,
  options: {
    reconnect: true
  }
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});

const store = createStore();
const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "rgb(39,49,66)"
    },
    secondary: {
      main: "rgb(197,208,222)"
    },
    background: {
      main: "rgb(226,231,238)"
    }
  }
});


const App = props => {
  const [oilTemp, setOilTemp] = useState(false);
  const [flareTemp, setFlareTemp] = useState(false);
  const [waterTemp, setWaterTemp] = useState(false);
  const [tubingPressure, setTubingPressure] = useState(false);
  const [casingPressure, setCasingPressure] = useState(false);
  const [injValveOpen, setInjValueOpen] = useState(false);

  const handleToggleMetric = (metric, setter) => {
    setter(!metric)
  }
  
  return (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <ApolloProvider client={client}>
    <Provider store={store}>
      <Wrapper>
        <Header />
        <button onClick={() => handleToggleMetric(oilTemp, setOilTemp)}>Toggle oil</button>
        <button onClick={() => handleToggleMetric(waterTemp, setWaterTemp)}>Toggle water</button>
        <button onClick={() => handleToggleMetric(flareTemp, setFlareTemp)}>Toggle flare</button>
        <button onClick={() => handleToggleMetric(tubingPressure, setTubingPressure)}>Toggle tube</button>
        <button onClick={() => handleToggleMetric(casingPressure, setCasingPressure)}>Toggle case</button>
        <button onClick={() => handleToggleMetric(injValveOpen, setInjValueOpen)}>Toggle valve</button>
        <GraphPlot
          oilTemp={oilTemp}
          flareTemp={flareTemp}
          waterTemp={waterTemp}
          tubingPressure={tubingPressure}
          casingPressure={casingPressure}
          injValveOpen={injValveOpen}
        />
        <ToastContainer />
      </Wrapper>
    </Provider>
    </ApolloProvider>
  </MuiThemeProvider>
  )
};

export default App;