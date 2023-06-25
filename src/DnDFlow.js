import React, {useState, useRef, useCallback, useMemo} from 'react';
import ReactFlow, {
    useReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import JointNode from './JointNode';
import CustomEdge from "./CustomEdge";
import PerformanceNode from "./PerformanceNode";
import PracticeNode from "./PracticeNode";
import ResourceNode from "./ResourceNode";
import FeedbackNode from "./FeedbackNode";

import Sidebar from './Sidebar';

import './index.css';

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
    const nodeTypes = useMemo(() => ({
        JointNode: JointNode,
        PerformanceNode: PerformanceNode,
        PracticeNode: PracticeNode,
        ResourceNode: ResourceNode,
        FeedbackNode: FeedbackNode,
    }), []);
    // Follow 2 lines used for restoring state when uploaded
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const { setViewport } = useReactFlow();
    const [ nodeCount, setNodeCount ] = useState({});
    const [deletedNodes, setDeletedNodes] = useState({});

    const onSave = () => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            // localStorage.setItem(flowKey, JSON.stringify(flow));
        }
    };



    const onNodesDelete = useCallback(
        (deleted) => {
            console.log(deleted);
            deleted.forEach((node) => {
                console.log("node");
                console.log(node);
                const nodeNum = node.data.nodeNumber;
                // const nodeType = node.type;
                const nodeName = node.data.name;
                console.log(nodeNum);
                console.log(nodeName);
                setDeletedNodes((prev) => {
                    if(prev[nodeName] === undefined) {
                        const res = { ...prev, [nodeName]: [nodeNum]};
                        console.log('onNodesDelete new obj undefined:')
                        console.log(res);
                        return res
                    } else {
                        // sorting is not the fastest O(log(n)n)
                        const res = { ...prev, [nodeName]: [...prev[nodeName], nodeNum].sort((a, b) => a - b)}
                        console.log('onNodesDelete new obj:')
                        console.log(res);
                        return res
                    }
                })
            })
        },
        [nodes, edges]
    );

    const onConnect = useCallback((params) => {
        const { source, target } = params;
        const sourceNode = getNode(source);
        const targetNode = getNode(target);
        let type = 'default';
        if (sourceNode.type === 'JointNode' || sourceNode.type === 'FeedbackNode' || targetNode.type === 'JointNode' || targetNode.type === 'FeedbackNode') {
            type = 'smoothstep';
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
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // In onDrop
    const createNodeHelper = (type, position, name, nodeNumber) => {
        const id = `${name}_${nodeNumber}`;

        const newNode = {
            // sourcePosition: 'right',
            // targetPosition: 'left',
            id: id,
            type,
            position,
            data: {
                name: name,
                nodeNumber,
                textData: "",
            },
            // data: { label: `${name}` },
        };
        setNodes((nds) => nds.concat(newNode));
    }

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const jsonString = event.dataTransfer.getData('application/reactflow');
            const data = JSON.parse(jsonString);
            console.log(data);
            const {type, name} = data;
            // const {type, name} = event.dataTransfer.getData('application/reactflow');


            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            console.log('deletedNodes in onDrop')
            console.log(deletedNodes)
            console.log('deletedNodes[name]')
            console.log(deletedNodes[name])
            console.log('name')
            console.log(name)
            if(deletedNodes[name] !== undefined && deletedNodes[name].length > 0) {
                // The queue is O(n) right now. might change later
                //     const newList = [...(deletedNodes[name])]
                //     const newVal = newList.shift();
                setDeletedNodes((prev) => {
                    const newList = [...(prev[name])]
                    const nodeNumber = newList.shift();
                    const res = {...prev, [name]: newList};
                    console.log('recreate obj');
                    console.log(res);

                    createNodeHelper(type, position, name, nodeNumber);

                    // const newNode = {
                    //     // sourcePosition: 'right',
                    //     // targetPosition: 'left',
                    //     data: {
                    //         name: name,
                    //         textData: "",
                    //         nodeNumber,
                    //     },
                    //     id: id,
                    //     type,
                    //     position,
                    //     // data: { label: `${name}` },
                    // };
                    //
                    // setNodes((nds) => nds.concat(newNode));
                    return res;
                })
            } else {
                setNodeCount((prev)=> {
                    const nodeNumber = isNaN(prev[name]+1)? 1: prev[name]+1;
                    const res = { ...prev, [name]: nodeNumber };
                    console.log('nodeNumber:');
                    console.log(nodeNumber)
                    console.log('new obj created');
                    console.log(res);
                    createNodeHelper(type, position, name, nodeNumber);
                    // const id = `${name}_${nodeNumber}`;
                    // const newNode = {
                    //     // sourcePosition: 'right',
                    //     // targetPosition: 'left',
                    //     data: {
                    //         name: name,
                    //         textData: "",
                    //         nodeNumber,
                    //     },
                    //     id: id,
                    //     type,
                    //     position,
                    //     // data: { label: `${name}` },
                    // };
                    //
                    // setNodes((nds) => nds.concat(newNode));
                    return res;
                })
            }


            // if(deletedNodes[type] !== undefined && deletedNodes[type].length > 0) {
            //     // The queue is O(n) right now. might change later
            //     const newList = [...(deletedNodes[type])]
            //     const newVal = newList.shift();
            //     // setDeletedNodes((prev) => ({ ...prev, [type]: newList}))
            //     setDeletedNodes((prev) => {
            //         const res = {...prev, [type]: newList};
            //         console.log('recreate obj');
            //         console.log(res);
            //         return res;
            //     })
            //     return { id:`${type}_${newVal}`, nodeNumber:newVal};
            // }
            // let newVal;
            // setNodeCount((prev)=> {
            //     console.log('newVal:');
            //     console.log(newVal)
            //     newVal = isNaN(prev[type]+1)? 1: prev[type]+1;
            //     const res = { ...prev, [type]: newVal };
            //     console.log('newVal:');
            //     console.log(newVal)
            //     console.log('new obj created');
            //     console.log(res);
            //     return res;
            // })
            // return { id:`${type}_${newVal}`, nodeNumber:newVal};




            // const {id, nodeNumber} = getIdAndNumber(type);
            // const {id, nodeNumber} = getIdAndNumber(name);
            // const newNode = {
            //     // sourcePosition: 'right',
            //     // targetPosition: 'left',
            //     data: {
            //         name: name,
            //         textData: "",
            //         nodeCount,
            //         nodeNumber,
            //     },
            //     id: id,
            //     type,
            //     position,
            //     // data: { label: `${name}` },
            // };
            //
            // setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, deletedNodes, nodeCount]
    );

    return (
        <div className="dndflow">
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
                <Sidebar />
            {/*</ReactFlowProvider>*/}
        </div>
    );
};

export default DnDFlow;
