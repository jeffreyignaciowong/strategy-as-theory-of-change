import React, {useState} from 'react';
import {useReactFlow} from 'reactflow';
import {useDisclosure, useInputState} from '@mantine/hooks';
import {Modal, Group, Button, TextInput, Select, Space, Text} from '@mantine/core';
import GraphCalculations from "./GraphCalculations";

const DownloadButton = ({ onSave, children }) => {
    const handleDownload = () => {
        const jsonData = onSave();
        if (jsonData !== false) {
            const jsonStr = JSON.stringify(jsonData);
            const blob = new Blob([jsonStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'SaveData.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <Button onClick={handleDownload}>{children}</Button>
    );
};

const Sidebar = ({ customNode, setCustomNode,  onSave, onRestore }) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [fieldCustomNode, setFieldCustomNode] = useInputState('');
    const [fieldCustomNodeType, setFieldCustomNodeType] = useInputState('');
    const [uploadFileData, setUploadFileData] = useState({});

    const [complexity, setComplexity ] = useState(false);
    const [falsifiability, setFalsifiability] = useState(false);
    const [replicability, setReplicability] = useState(false);

    const { getEdges, getNodes, getNode } = useReactFlow();

    const onClickCalculate = () => {
        const graphCalculations = new GraphCalculations(getNodes(), getEdges(), getNode);
        graphCalculations.calculateGeodesics();
        // Three attribute values
        const {complexity, falsifiability, replicability} = graphCalculations.calculateValues();
        setComplexity(complexity);
        setFalsifiability(falsifiability);
        setReplicability(replicability);
    }

    const onSubmitFile = () => {
        onRestore(uploadFileData);
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get the uploaded file
        const reader = new FileReader(); // Create a file reader object

        // Set up the onload event handler to read the file contents
        reader.onload = (e) => {
            const fileContent = e.target.result; // Get the file contents

            try {
                const jsonData = JSON.parse(fileContent); // Parse the JSON data

                if (typeof jsonData === 'object') {
                    // Check if the parsed data is an object
                    // Process the JSON data or trigger any necessary actions
                    setUploadFileData(jsonData);
                    console.log(jsonData);
                } else {
                    console.log('The uploaded file does not contain a valid JSON file.');
                    alert('Please upload a valid json save file');
                }
            } catch (error) {
                console.log('Error parsing JSON:', error);
            }

            // // Process the JSON data here (e.g., parse JSON or perform any desired operations)
            // setUploadFileData(JSON.parse(fileContent));
            //
            // // Use the jsonData or trigger any necessary actions with the parsed JSON data
            // console.log(uploadFileData);
        };

        reader.readAsText(file); // Read the file as text
    }

    const onClickCustomNodeSubmit = () => {
        if (fieldCustomNodeType === '' || fieldCustomNode === '') {
            alert('Please fill in fields');
        } else {
            console.log(fieldCustomNode)
            console.log(fieldCustomNodeType)
            setCustomNode((prevState) => ([...prevState, {
                customNodeName: fieldCustomNode,
                customNodeType: fieldCustomNodeType,
            }]));
            // setCustomNode((prevState) => {
            //     prevState.push({
            //         customNodeName: fieldCustomNode,
            //         customNodeType: fieldCustomNodeType,
            //         });
            //     return prevState;
            // });
            console.log(customNode);
            setFieldCustomNode('');
            setFieldCustomNodeType('');
            close();
            // let test = prompt("Please enter your node name", 'None');
            // console.log(test)
        }
    }
    const onDragStart = (event, nodeValues) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeValues));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            {/*{type:'input', name:'Resources'}*/}
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, {type:'ResourceNode', name:'Resources'})} draggable>
                Resources
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, {type:'PracticeNode', name: 'Practices'})} draggable>
                Practices
            </div>
            {/*{type:'output', name: 'Performance'}*/}
            <div className="dndnode output" onDragStart={(event) => onDragStart(event, {type:'PerformanceNode', name: 'Performance'})} draggable>
                Performance
            </div>
            {/*<div className="dndnode" onDragStart={(event) => onDragStart(event, {type:'JointNode', name: 'JointNode'})} draggable>*/}
            {/*    Joint Node*/}
            {/*</div>*/}
            <div className="dndnode" onDragStart={(event) => onDragStart(event, {type:'FeedbackNode', name: 'FeedbackNode'})} draggable>
                Feedback Node
            </div>
            {customNode.map((item, index) =>
                <div key={index} className="dndnode" onDragStart={(event) => onDragStart(event, {type: item.customNodeType, name: item.customNodeName})} draggable>
                    {item.customNodeName}
                </div>
            )}
            <Modal size="lg" opened={opened} onClose={close} title="Create a custom node">
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
                    data={[{ value: 'ResourceNode', label: 'Resource' },
                        { value: 'PracticeNode', label: 'Practice' },
                        {value: 'PerformanceNode', label: 'Performance' },
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
            <DownloadButton onSave={onSave} >Download Save</DownloadButton>
            <Space h="sm" />
            <input type="file" onChange={handleFileChange} multiple={false} />
            <Space h="sm" />
            <Button onClick={onSubmitFile}>Upload File</Button>
            <Space h="sm" />
            <Button onClick={onClickCalculate}>Calculate Attributes</Button>
            <Space h="sm" />
            {complexity !== false && <Text>Complexity: {complexity}</Text>}
            {falsifiability !== false && <Text>Falsifiability: {falsifiability}</Text>}
            {replicability !== false && <Text>Replicability: {replicability}</Text>}
        </aside>
    );
};

export default Sidebar;