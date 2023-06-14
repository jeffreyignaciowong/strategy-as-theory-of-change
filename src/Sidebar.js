import React from 'react';
import {useGetPointerPosition, useReactFlow} from 'reactflow';

export default () => {

    const { getEdges, getNodes } = useReactFlow();
    const onClickEdges = (e) => {
        console.log(getEdges());
    }

    const onClickNodes = (e) => {
        console.log(getNodes());
    }
    const onClickCustomNode = (e) => {
        let test = prompt("Please enter your node name", 'None');
        console.log(test)
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
            <button onClick={onClickEdges}>Get Edges</button>
            <button onClick={onClickNodes}>Get Nodes</button>
            <button onClick={onClickCustomNode}>Add Custom Node</button>
        </aside>
    );
};
