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

// Used in on delete hook and in getIdAndNumber since the numbers from a deleted node should be reused
// This is a queue list
let deletedNodes = {};
let nodeCount = {};
// const getId = () => `dndnode_${id++}`;
// TODO: Move getId before object creation. So it can return node number and id.
const getIdAndNumber = (type) => {
    if(deletedNodes[type] !== undefined && deletedNodes[type].length > 0) {
        // The queue is O(n) right now. might change later
        const newVal = deletedNodes[type].shift();
        return { id:`${type}_${newVal}`, nodeNumber:newVal};
    }
    console.log(nodeCount);
    const newVal = nodeCount[type] + 1;
    nodeCount[type] = isNaN(newVal) ? 1 : newVal;
    // nodeCount[type] = nodeCount[type] + 1 || 1;
    console.log(nodeCount);
    return { id:`${type}_${nodeCount[type]}`, nodeNumber:nodeCount[type]};
    // if(type === 'ResourceNode') {
    //     nodeCount[type] = nodeCount[type] + 1 ?? 0
    // } else if(type === 'PracticeNode') {
    //
    // } else if(type === 'PerformanceNode') {
    //
    // } else if(type === 'FeedbackNode') {
    //
    // } else {
    //
    // }
 }

const DnDFlow = () => {
    const { getNode } = useReactFlow();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
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
    const [rfInstance, setRfInstance] = useState(null);
    const { setViewport } = useReactFlow();

    const onNodesDelete = useCallback(
        (deleted) => {
            console.log(deleted);
            deleted.forEach((node) => {
                console.log("node");
                console.log(node);
                const nodeNum = node.data.nodeNumber;
                // const nodeType = node.type;
                const nodeType = node.data.name;
                console.log(nodeNum);
                console.log(nodeType);
                console.log(deletedNodes[nodeType]);
                if(deletedNodes[nodeType] === undefined) {
                    deletedNodes[nodeType] = []
                }
                deletedNodes[nodeType].push(nodeNum);
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
            // const {id, nodeNumber} = getIdAndNumber(type);
            const {id, nodeNumber} = getIdAndNumber(name);
            const newNode = {
                // sourcePosition: 'right',
                // targetPosition: 'left',
                data: {
                    name: name,
                    textData: "",
                    nodeCount,
                    nodeNumber,
                },
                id: id,
                type,
                position,
                // data: { label: `${name}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
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
