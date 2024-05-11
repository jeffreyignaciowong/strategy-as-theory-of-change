import React, { useState, useRef, useCallback, useMemo } from "react";
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import JointNode from "./JointNode";
import CustomEdge from "./CustomEdge";
import PerformanceNode from "./PerformanceNode";
import PracticeNode from "./PracticeNode";
import ResourceNode from "./ResourceNode";
import FeedbackNode from "./FeedbackNode";

import Sidebar from "./Sidebar";

import SetNodesContext from "./SetNodesContext";

import "./index.css";

const initialNodes = [
  // {
  //     id: '1',
  //     type: 'input',
  //     data: { label: 'input node' },
  //     position: { x: 250, y: 5 },
  // },
];

const DnDFlow = () => {
  const { getNode } = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const edgeTypes = {
    custom: CustomEdge,
  };
  const nodeTypes = useMemo(
    () => ({
      JointNode: JointNode,
      PerformanceNode: PerformanceNode,
      PracticeNode: PracticeNode,
      ResourceNode: ResourceNode,
      FeedbackNode: FeedbackNode,
    }),
    []
  );
  // Follow 2 lines used for restoring state when uploaded
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport } = useReactFlow();
  const [nodeCount, setNodeCount] = useState({});
  const [deletedNodes, setDeletedNodes] = useState({});
  // for sidebar. Here so it can be saved
  const [customNode, setCustomNode] = useState([]);

  // false if null
  const onSave = () => {
    if (reactFlowInstance) {
      // json object is the save data
      const saveData = {
        reactFlowInstance: reactFlowInstance.toObject(),
        nodeCount: nodeCount,
        deletedNodes: deletedNodes,
        customNode: customNode,
      };
      // console.log('saveData:');
      // console.dir(saveData);
      return saveData;
      // localStorage.setItem(flowKey, JSON.stringify(flow));
    }
    return false;
  };

  const onRestore = (fileData) => {
    if (
      typeof fileData === "object" &&
      fileData.hasOwnProperty("reactFlowInstance") &&
      fileData.hasOwnProperty("nodeCount") &&
      fileData.hasOwnProperty("deletedNodes") &&
      fileData.hasOwnProperty("customNode") &&
      fileData.reactFlowInstance.hasOwnProperty("viewport") &&
      Array.isArray(fileData.reactFlowInstance.edges) &&
      Array.isArray(fileData.reactFlowInstance.nodes)
    ) {
      const { x = 0, y = 0, zoom = 1 } = fileData.reactFlowInstance.viewport;
      setNodes(fileData.reactFlowInstance.nodes || []);
      setEdges(fileData.reactFlowInstance.edges || []);
      setViewport({ x, y, zoom });
      setCustomNode(fileData.customNode || []);
      setNodeCount(fileData.nodeCount || {});
      setDeletedNodes(fileData.deletedNodes || {});
    } else if (Array.isArray(fileData)) {
      const nodes = [];
      const edges = [];
      try {
        let fNodeIndex = 1;
        let terminologyUsed = fileData[0][0];
        console.log(terminologyUsed);
        let shouldBreak = true;
        let isParsingNodes = true;
        fileData.forEach((row) => {
          console.log("IAOOI selected woooooooo");
          const pattern = /^[IOAYZ]\d*$/;
          // Check if it's a blank row
          if (row[0] === "Node" && row[1] === "Description") {
            console.log("header");
          } else if (row[0] === "Start Node" && row[1] === "End Node") {
            isParsingNodes = false; // Switch to parsing edges
          } else {
            if (isParsingNodes) {
              if (!pattern.test(row[0].toUpperCase())) {
                throw new Error("Invalid Node Names");
              }
              if (nodes.some((node) => node.id === row[0].toUpperCase())) {
                throw new Error("Duplicate Nodes in file");
              }

              let header = null;
              let nodeType = null;
              let node = null;
              let xValue = 225;
              let yValue = -160;
              let nodeValue = row[0].substring(1);
              if (row[0].charAt(0).toUpperCase() === "I") {
                nodeType = "ResourceNode";
                header = "Inputs";
              } else if (row[0].charAt(0).toUpperCase() === "A") {
                nodeType = "PracticeNode";
                header = "Activities";
                xValue += 300;
              } else if (row[0].charAt(0).toUpperCase() === "O") {
                nodeType = "PerformanceNode";
                header = "Outputs";
                xValue += 600;
              } else if (row[0].charAt(0).toUpperCase() === "Y") {
                nodeType = "PerformanceNode";
                header = "Outcomes";
                xValue += 900;
              } else if (row[0].charAt(0).toUpperCase() === "Z") {
                nodeType = "PerformanceNode";
                header = "Outcomes";
                xValue += 1200;
              }
              node = {
                width: 198,
                height: 71,
                id: row[0].toUpperCase(), //header + '__' + nodeValue,
                type: nodeType,
                data: {
                  name: header,
                  //nodeNumber: nodeValue,
                  textAreaValue: row[1],
                  textAreaHeight: 35,
                  textAreaWidth: 180,
                },
                dragging: false,
                position: { x: xValue, y: yValue + nodeValue * 100 },
                selected: true,
              };
              nodes.push(node);
              // Extract the type and description for nodes
              const type = row[0];
              const description = row[1];

              // Perform actions with type and description for nodes
              console.log(`Node Type: ${type}, Description: ${description}`);
              // You can perform any additional logic or processing here for nodes
            } else {
              if (
                !pattern.test(row[0].toUpperCase()) ||
                !pattern.test(row[1].toUpperCase())
              ) {
                throw new Error("Invalid Edge");
              }
              if (
                nodes.every((node) => node.id !== row[0].toUpperCase()) ||
                nodes.every((node) => node.id !== row[1].toUpperCase())
              ) {
                throw new Error("Both Nodes must be present in the file");
              }

              let edgeSource = row[0].toUpperCase();
              let edgeTarget = row[1].toUpperCase();
              const isFeedback = [
                ["A", "I"],
                ["O", "A"],
                ["O", "I"],
                ["Y", "O"],
                ["Y", "A"],
                ["Y", "I"],
                ["Z", "Y"],
                ["Z", "O"],
                ["Z", "A"],
                ["Z", "I"],
              ];

              let createFeedback = isFeedback.some(
                (innerArray) =>
                  innerArray.length === row.length &&
                  innerArray[0] === row[0].charAt(0).toUpperCase() && // Check the first character of row[0]
                  innerArray[1] === row[1].charAt(0).toUpperCase() // Check the first character of row[1]
              );
              // let createFeedback = false;
              if (createFeedback) {
                console.log(`TRUE ${row}`);
                let header = "Feedback";
                let nodeType = "FeedbackNode";
                let node = null;
                let xValue = 1725;
                let yValue = -160;
                let nodeValue = fNodeIndex;
                node = {
                  width: 198,
                  height: 71,
                  id: "F" + fNodeIndex, //header + '__' + nodeValue,
                  type: nodeType,
                  data: {
                    name: header,
                    nodeNumber: nodeValue,
                    textAreaValue: row[1],
                    textAreaHeight: 35,
                    textAreaWidth: 180,
                  },
                  dragging: false,
                  position: { x: xValue, y: yValue + nodeValue * 100 },
                  selected: true,
                };
                let edge = {
                  id: edgeSource + "-F" + fNodeIndex,
                  source: edgeSource,
                  target: "F" + fNodeIndex,
                  type: "default",
                  markerEnd: { type: "arrowclosed" },
                };
                edges.push(edge);
                edge = {
                  id: "F" + fNodeIndex + "-" + edgeTarget,
                  source: "F" + fNodeIndex,
                  target: edgeTarget,
                  type: "default",
                  markerEnd: { type: "arrowclosed" },
                };
                edges.push(edge);
                fNodeIndex++;
                nodes.push(node);
              } else {
                const edge = {
                  id: edgeSource + "-" + edgeTarget,
                  source: edgeSource,
                  target: edgeTarget,
                  type: "default",
                  markerEnd: { type: "arrowclosed" },
                };
                edges.push(edge);
              }
              // Extract the nodes connected by an edge
              const sourceNode = row[0];
              const targetNode = row[1];

              // Perform actions with sourceNode and targetNode for edges
              console.log(`Edge: ${sourceNode} connects to ${targetNode}`);
              // You can perform any additional logic or processing here for edges
            }
          }
        });
        console.log(nodes);
        setNodes(nodes || []);
        setEdges(edges || []);
      } catch (error) {
        alert(error);
      }
    } else {
      alert("Please submit a valid SaveData.json file");
      // const  x = 0, y = 0, zoom = 1;
      // setNodes([]);
      // setEdges([]);
      // setViewport({ x, y, zoom });
      // setCustomNode([]);
      // setNodeCount({});
      // setDeletedNodes({});
    }
  };

  const onNodesDelete = useCallback(
    (deleted) => {
      // console.log(deleted);
      deleted.forEach((node) => {
        // console.log("node");
        // console.log(node);
        const nodeNum = node.data.nodeNumber;
        // const nodeType = node.type;
        const nodeName = node.data.name;
        // console.log(nodeNum);
        // console.log(nodeName);
        setDeletedNodes((prev) => {
          if (prev[nodeName] === undefined) {
            const res = { ...prev, [nodeName]: [nodeNum] };
            // console.log("onNodesDelete new obj undefined:");
            // console.log(res);
            return res;
          } else {
            // sorting is not the fastest O(log(n)n)
            const res = {
              ...prev,
              [nodeName]: [...prev[nodeName], nodeNum].sort((a, b) => a - b),
            };
            // console.log("onNodesDelete new obj:");
            // console.log(res);
            return res;
          }
        });
      });
    },
    [nodes, edges]
  );

  const onConnect = useCallback((params) => {
    const { source, target } = params;
    const sourceNode = getNode(source);
    const targetNode = getNode(target);
    let type = "default";
    if (
      sourceNode.type === "JointNode" ||
      sourceNode.type === "FeedbackNode" ||
      targetNode.type === "JointNode" ||
      targetNode.type === "FeedbackNode"
    ) {
      type = "smoothstep";
    }
    const newEdge = {
      id: `${source}-${target}`,
      source,
      target,
      type,
      // type: 'custom',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };
    return setEdges((eds) => addEdge(newEdge, eds));
  }, []);
  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // In onDrop
  const createNodeHelper = (type, position, name, nodeNumber) => {
    const id = `${name}_${nodeNumber}`;
    // console.log(id)
    const newNode = {
      // sourcePosition: 'right',
      // targetPosition: 'left',
      id: id,
      type,
      position,
      data: {
        name: name,
        nodeNumber,
        textAreaValue: "",
        textAreaHeight: 35,
        textAreaWidth: 180,
      },
      // data: { label: `${name}` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const jsonString = event.dataTransfer.getData("application/reactflow");
      const data = JSON.parse(jsonString);
      // console.log(data);
      const { type, name } = data;
      // const {type, name} = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // console.log('deletedNodes in onDrop')
      // console.log(deletedNodes)
      // console.log('deletedNodes[name]')
      // console.log(deletedNodes[name])
      // console.log('name')
      // console.log(name)
      if (deletedNodes[name] !== undefined && deletedNodes[name].length > 0) {
        // The queue is O(n) right now. might change later
        //     const newList = [...(deletedNodes[name])]
        //     const newVal = newList.shift();
        setDeletedNodes((prev) => {
          const newList = [...prev[name]];
          const nodeNumber = newList.shift();
          const res = { ...prev, [name]: newList };
          // console.log('recreate obj');
          // console.log(res);

          createNodeHelper(type, position, name, nodeNumber);
          return res;
        });
      } else {
        setNodeCount((prev) => {
          const nodeNumber = isNaN(prev[name] + 1) ? 1 : prev[name] + 1;
          const res = { ...prev, [name]: nodeNumber };
          // console.log('nodeNumber:');
          // console.log(nodeNumber)
          // console.log('new obj created');
          // console.log(res);
          createNodeHelper(type, position, name, nodeNumber);
          return res;
        });
      }
    },
    [reactFlowInstance, deletedNodes, nodeCount]
  );

  const sidebarProps = {
    customNode,
    setCustomNode,
    onSave,
    onRestore,
    onNodesDelete,
  };
  // console.log('DnDFlow rerender');
  return (
    <div className="dndflow">
      <SetNodesContext.Provider value={setNodes}>
        {/*<ReactFlowProvider>*/}
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodesDelete={onNodesDelete}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar {...sidebarProps} />
        {/*</ReactFlowProvider>*/}
      </SetNodesContext.Provider>
    </div>
  );
};

export default DnDFlow;
