import {createContext} from "react";

const SetNodesContext = createContext((nodes) => (alert('function did not pass through context')));

export default SetNodesContext;