import React, { useEffect, useState, useRef } from "react";
import { useReactFlow } from "reactflow";
import { useDisclosure, useInputState } from "@mantine/hooks";
import {
  Modal,
  Group,
  Button,
  TextInput,
  Select,
  Space,
  Text,
} from "@mantine/core";
import GraphCalculations from "./GraphCalculations";
import { getCheckedNodes, getPrunedElements } from "./PruneScript";
import Papa from "papaparse";

const DownloadButton = ({ onSave, children }) => {
  const handleDownload = () => {
    const jsonData = onSave();
    if (jsonData !== false) {
      const jsonStr = JSON.stringify(jsonData);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SaveData.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return <Button onClick={handleDownload}>{children}</Button>;
};

const Sidebar = ({ customNode, setCustomNode, onSave, onRestore }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [fieldCustomNode, setFieldCustomNode] = useInputState("");
  const [fieldCustomNodeType, setFieldCustomNodeType] = useInputState("");
  const [uploadFileData, setUploadFileData] = useState({});

  const [complexity, setComplexity] = useState(false);
  const [falsifiability, setFalsifiability] = useState(false);
  const [replicability, setReplicability] = useState(false);

  const [oldComplexity, setOldComplexity] = useState(false);
  const [oldFalsifiability, setOldFalsifiability] = useState(false);
  const [oldReplicability, setOldReplicability] = useState(false);

  const [printComplexity, setPrintComplexity] = useState(false);
  const [printFalsifiability, setPrintFalsifiability] = useState(false);
  const [printReplicability, setPrintReplicability] = useState(false);

  const [prune, setPrune] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const { getEdges, getNodes, getNode } = useReactFlow();

  const onClickCalculate = () => {
    if (prune === true) {
      setPrintComplexity(oldComplexity);
      setPrintFalsifiability(oldFalsifiability);
      setPrintReplicability(oldReplicability);
    } else {
      setPrintComplexity(false);
      setPrintFalsifiability(false);
      setPrintReplicability(false);
    }
    const graphCalculations = new GraphCalculations(
      getNodes(),
      getEdges(),
      getNode
    );
    graphCalculations.calculateGeodesics();
    // Three attribute values
    const { complexity, falsifiability, replicability } =
      graphCalculations.calculateValues();
    setComplexity(complexity);
    setFalsifiability(falsifiability);
    setReplicability(replicability);
  };

  const onSubmitFile = () => {
    onRestore(uploadFileData);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the uploaded file
    const reader = new FileReader(); // Create a file reader object

    // Set up the onload event handler to read the file contents
    reader.onload = (e) => {
      const fileContent = e.target.result; // Get the file contents

      const allowedExtensions = ["csv", "json"];

      try {
        const fileExtension = file?.type.split("/")[1];

        if (!allowedExtensions.includes(fileExtension)) {
          alert("Please upload a valid file");
        }

        if (fileExtension === "json") {
          const jsonData = JSON.parse(fileContent); // Parse the JSON data

          if (typeof jsonData === "object") {
            // Check if the parsed data is an object
            // Process the JSON data or trigger any necessary actions
            setUploadFileData(jsonData);
            // console.log(jsonData);
          } else {
            // console.log('The uploaded file does not contain a valid JSON file.');
            alert("Please upload a valid json save file");
          }
        } else if (fileExtension === "csv") {
          Papa.parse(file, {
            complete: (result) => {
              const csvData = result.data;

              // Process the CSV data or trigger any necessary actions
              setUploadFileData(csvData);
            },
            header: false, // Set to true if the first row contains headers
          });
        }
      } catch (error) {
        console.log("Error parsing JSON:", error);
      }

      // // Process the JSON data here (e.g., parse JSON or perform any desired operations)
      // setUploadFileData(JSON.parse(fileContent));
      //
      // // Use the jsonData or trigger any necessary actions with the parsed JSON data
      // console.log(uploadFileData);
    };

    reader.readAsText(file); // Read the file as text
  };

  const onClickCustomNodeSubmit = () => {
    if (fieldCustomNodeType === "" || fieldCustomNode === "") {
      alert("Please fill in fields");
    } else {
      // console.log(fieldCustomNode)
      // console.log(fieldCustomNodeType)
      setCustomNode((prevState) => [
        ...prevState,
        {
          customNodeName: fieldCustomNode,
          customNodeType: fieldCustomNodeType,
        },
      ]);
      // setCustomNode((prevState) => {
      //     prevState.push({
      //         customNodeName: fieldCustomNode,
      //         customNodeType: fieldCustomNodeType,
      //         });
      //     return prevState;
      // });
      // console.log(customNode);
      setFieldCustomNode("");
      setFieldCustomNodeType("");
      close();
      // let test = prompt("Please enter your node name", 'None');
      // console.log(test)
    }
  };

  const onDragStart = (event, nodeValues) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeValues)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    //console.log(isChecked);
  };

  const [data, setData] = useState({});
  //const prevData = useRef("");

  // useEffect(() => {
  //   prevData.current = data;
  // }, [data]);

  const onPruneGraph = () => {
    if (data && prune) {
      console.log(data);
      onRestore(data);
      alert("Pruning Turned Off!!");
    } else if (getCheckedNodes().length === 0) {
      alert("You have to click a button on a node to prune the graph!");
      return;
    }
    setPrune(!prune);
    if (!prune) {
      setData(onSave());
      const graphData = onSave();

      const graphCalculations = new GraphCalculations(
        getNodes(),
        getEdges(),
        getNode
      );
      graphCalculations.calculateGeodesics();
      // Three attribute values
      const { complexity, falsifiability, replicability } =
        graphCalculations.calculateValues();
      setOldComplexity(complexity);
      setOldFalsifiability(falsifiability);
      setOldReplicability(replicability);

      //console.log(data);
      const getPrunedNodes = getPrunedElements(getEdges(), isChecked);
      const getFinalNodes = [];
      const getRidNodes = [];
      const getRidNodesID = [];
      for (let i = 0; i < getNodes().length; i++) {
        if (getPrunedNodes.includes(getNodes()[i].id)) {
          getFinalNodes.push(getNodes()[i]);
        } else {
          getRidNodes.push(getNodes()[i]);
          getRidNodesID.push(getNodes()[i].id);
        }
      }

      let nodeCounts = {};
      for (let i = 0; i < getFinalNodes.length; i++) {
        if (getFinalNodes[i].data.name in nodeCounts) {
          nodeCounts[getFinalNodes[i].data.name]++;
        } else {
          nodeCounts[getFinalNodes[i].data.name] = 1;
        }
      }

      const newEdges = getEdges().filter((edge) => {
        return (
          !getRidNodesID.includes(edge.source) &&
          !getRidNodesID.includes(edge.target)
        );
      });

      let prunedData = {}; // Initialize as an empty object if data is undefined
      //console.log(prunedData);
      if (graphData) {
        prunedData = { ...graphData };
        console.log(prunedData);
        prunedData.deletedNodes = getRidNodes || {};
        prunedData.nodeCount = nodeCounts;
        //prunedData.reactFlowInstance = prunedData.reactFlowInstance || {}; // Initialize as an empty object if undefined
        prunedData.reactFlowInstance.nodes = getFinalNodes || [];
        prunedData.reactFlowInstance.edges = newEdges || [];
        //console.log(prunedData);
        onRestore(prunedData);
      }
      // } else {
      //   if (data) {
      //     console.log(data);
      //     onRestore(data);
      //     alert("Pruning Turned Off!!");
      //   }
    }
  };

  return (
    <aside>
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      {/*{type:'input', name:'Resources'}*/}
      <div
        className="dndnode input"
        onDragStart={(event) =>
          onDragStart(event, { type: "ResourceNode", name: "Inputs" })
        }
        draggable
      >
        Inputs
      </div>
      <div
        className="dndnode"
        onDragStart={(event) =>
          onDragStart(event, { type: "PracticeNode", name: "Activities" })
        }
        draggable
      >
        Activites
      </div>
      {/*{type:'output', name: 'Performance'}*/}
      <div
        className="dndnode output"
        onDragStart={(event) =>
          onDragStart(event, { type: "PerformanceNode", name: "Outputs" })
        }
        draggable
      >
        Outputs
      </div>
      {/*<div className="dndnode" onDragStart={(event) => onDragStart(event, {type:'JointNode', name: 'JointNode'})} draggable>*/}
      {/*    Joint Node*/}
      {/*</div>*/}
      <div
        className="dndnode outcome"
        onDragStart={(event) =>
          onDragStart(event, { type: "PerformanceNode", name: "Outcomes" })
        }
        draggable
      >
        Outcomes
      </div>
      <div
        className="dndnode"
        onDragStart={(event) =>
          onDragStart(event, { type: "FeedbackNode", name: "FeedbackNode" })
        }
        draggable
      >
        Feedback Node
      </div>
      {customNode.map((item, index) => (
        <div
          key={index}
          className="dndnode"
          onDragStart={(event) =>
            onDragStart(event, {
              type: item.customNodeType,
              name: item.customNodeName,
            })
          }
          draggable
        >
          {item.customNodeName}
        </div>
      ))}

      <Modal
        size="lg"
        opened={opened}
        onClose={close}
        title="Create a custom node"
      >
        <TextInput
          value={fieldCustomNode}
          onChange={setFieldCustomNode}
          label="Name of node"
          placeholder="Name"
        />
        <Select
          dropdownPosition="bottom"
          label="Node type"
          placeholder="Select a node"
          value={fieldCustomNodeType}
          onChange={setFieldCustomNodeType}
          // searchable
          // nothingFound="No options"
          data={[
            { value: "ResourceNode", label: "Resource" },
            { value: "PracticeNode", label: "Practice" },
            { value: "PerformanceNode", label: "Performance" },
          ]}
        />
        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />
        <Group position="right">
          <Button onClick={onClickCustomNodeSubmit}>Submit</Button>
        </Group>
      </Modal>
      <Space h="sm" />
      <Button onClick={open}>Add Custom Node</Button>
      <Space h="sm" />
      <DownloadButton onSave={onSave}>Download Save</DownloadButton>
      <Space h="sm" />
      <input type="file" onChange={handleFileChange} multiple={false} />
      <Space h="sm" />
      <Button onClick={onSubmitFile}>Upload File</Button>
      <Space h="sm" />
      <Button onClick={onPruneGraph}>Prune Graph</Button>
      <div className="checkbox-container">
        <input
          type="checkbox"
          className="checkbox-custom"
          title="Toggle to Include Feedback Nodes"
          onChange={handleCheckboxChange}
        />
      </div>
      <Space h="sm" />
      <Button onClick={onClickCalculate}>Calculate Attributes</Button>
      <Space h="sm" />
      {complexity !== false && <Text size="lg">Complexity: {complexity}</Text>}
      {falsifiability !== false && (
        <Text size="lg">Falsifiability: {falsifiability}</Text>
      )}
      {replicability !== false && (
        <Text size="lg">Replicability: {replicability}</Text>
      )}
      <Space h="sm" />

      {(printComplexity !== false ||
        printFalsifiability !== false ||
        printReplicability !== false) && (
        <Text weight={700} size="lg">
          Old Calculations:
        </Text>
      )}
      {printComplexity !== false && (
        <Text size="lg">Complexity: {printComplexity}</Text>
      )}
      {printFalsifiability !== false && (
        <Text size="lg">Falsifiability: {printFalsifiability}</Text>
      )}
      {printReplicability !== false && (
        <Text size="lg">Replicability: {printReplicability}</Text>
      )}
    </aside>
  );
};

export default Sidebar;
