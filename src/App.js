import './App.css';
import { ReactFlowProvider } from "reactflow";
import DnDFlow from "./DnDFlow";
import { MantineProvider } from '@mantine/core';

//   "homepage": "https://jeffreyignaciowong.github.io/strategy-as-theory-of-change",

function App() {
  return (
    <div className="App" style={{height: "100vh"}}>
      {/*<Flow></Flow>*/}
      {/*  <MantineProvider withGlobalStyles withNormalizeCSS>*/}
        <MantineProvider>
        <ReactFlowProvider>
            <DnDFlow></DnDFlow>
        </ReactFlowProvider>
        </MantineProvider>
      {/*<header className="App-header">*/}
      {/*  <img src={logo} className="App-logo" alt="logo" />*/}
      {/*  <p>*/}
      {/*    Edit <code>src/App.js</code> and save to reload.*/}
      {/*  </p>*/}
      {/*  <a*/}
      {/*    className="App-link"*/}
      {/*    href="https://reactjs.org"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    Learn React*/}
      {/*  </a>*/}
      {/*</header>*/}
    </div>
  );
}

export default App;
