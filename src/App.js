import logo from './logo.svg';
import './App.css';
import Flow from './Flow';
import { ReactFlowProvider } from "reactflow";
import DnDFlow from "./DnDFlow";

function App() {
  return (
    <div className="App" style={{height: "100vh"}}>
      {/*<Flow></Flow>*/}
        <ReactFlowProvider>
            <DnDFlow></DnDFlow>
        </ReactFlowProvider>
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
