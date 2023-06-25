import React, {useState} from 'react';
import {useGetPointerPosition, useReactFlow} from 'reactflow';
import {useDisclosure, useInputState} from '@mantine/hooks';
import {MantineProvider, Modal, Group, Button, TextInput, Select, Space, Flex} from '@mantine/core';

export default () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [fieldCustomNode, setFieldCustomNode] = useInputState('');
    const [fieldCustomNodeType, setFieldCustomNodeType] = useInputState('');
    const [customNode, setCustomNode] = useState([]);
    const [uploadFileData, setUploadFileData] = useState({});

    const { getEdges, getNodes } = useReactFlow();
    const onClickEdges = (e) => {
        console.log(getEdges());
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get the uploaded file
        const reader = new FileReader(); // Create a file reader object

        // Set up the onload event handler to read the file contents
        reader.onload = (e) => {
            const fileContent = e.target.result; // Get the file contents

            // Process the JSON data here (e.g., parse JSON or perform any desired operations)
            setUploadFileData(JSON.parse(fileContent));

            // Use the jsonData or trigger any necessary actions with the parsed JSON data
            console.log(uploadFileData);
        };

        reader.readAsText(file); // Read the file as text
    }

    const onClickNodes = (e) => {
        console.log(getNodes());
    }
    const onClickCustomNodeSubmit = (e) => {
        console.log(fieldCustomNode)
        console.log(fieldCustomNodeType)
        setCustomNode((prevState) => {
            prevState.push({
                customNodeName: fieldCustomNode,
                customNodeType: fieldCustomNodeType,
                });
            return prevState;
        });
        console.log(customNode);
        setFieldCustomNode('');
        setFieldCustomNodeType('');
        // let test = prompt("Please enter your node name", 'None');
        // console.log(test)
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
            <div className="dndnode" onDragStart={(event) => onDragStart(event, {type:'JointNode', name: 'JointNode'})} draggable>
                Joint Node
            </div>
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
            <Button onClick={onClickEdges}>Get Edges</Button>
            <Space h="sm" />
            <Button onClick={onClickNodes}>Get Nodes</Button>
            <Space h="sm" />
            <Button onClick={open}>Add Custom Node</Button>
            <Space h="sm" />
            <input type="file" onChange={handleFileChange} multiple={false} />
        </aside>
    );
};