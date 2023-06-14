
import React from 'react';
import { getBezierPath,  Handle } from 'reactflow';

import './index.css';
// import { useDrag } from 'react-dnd';
//
// const DraggableItem = () => {
//     const [{ isDragging }, drag] = useDrag({
//         item: { type: 'item' },
//         collect: (monitor) => ({
//             isDragging: monitor.isDragging(),
//         }),
//     });
//
//     return (
//         <div
//             ref={drag}
//             style={{
//                 opacity: isDragging ? 0.5 : 1,
//                 cursor: 'move',
//                 width: '50px',
//                 height: '50px',
//                 backgroundColor: 'red',
//             }}
//         />
//     );
// };


const foreignObjectSize = 40;

const onEdgeClick = (evt, id) => {
    evt.stopPropagation();
    alert(`remove ${id}`);
};

export default function CustomEdge({
                                       id,
                                       sourceX,
                                       sourceY,
                                       targetX,
                                       targetY,
                                       sourcePosition,
                                       targetPosition,
                                       style = {},
                                       markerEnd,
                                   }) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const onDragStart = (event, nodeValues) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeValues));
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain", "some data");
    };

    const handleDrag = (event) => {
        console.log("Dragging...");
    };

    const handleDragEnd = (event) => {
        console.log("Drag ended.");
    };


    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={labelX - foreignObjectSize / 2}
                y={labelY - foreignObjectSize / 2}
                className="edgebutton-foreignobject"
                requiredExtensions="http://www.w3.org/1999/xhtml"

                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                {/*<DraggableItem>*/}
                    <div>
                        {/*<button className="edgebutton" onClick={(event) => onEdgeClick(event, id)}>*/}
                        × test
                        {/*</button>*/}
                    </div>
                {/*</DraggableItem>*/}
            </foreignObject>
        </>
    );
}


// import React, { useCallback } from 'react';
// import { EdgeText } from 'reactflow';
// import { getBezierPath } from 'reactflow';
// // import { getBezierPath, getEdgeCenter } from 'reactflow';
//
// const Joint = ({ id, position }) => {
//     const handleDrag = useCallback((event, delta) => {
//         event.stopPropagation();
//         event.preventDefault();
//         const newPosition = {
//             x: position.x + delta.x,
//             y: position.y + delta.y,
//         };
//         // call an `onJointDrag` prop to update the joint position
//     }, [position]);
//
//     return (
//         <div
//             id={id}
//             style={{
//                 position: 'absolute',
//                 top: position.y - 4,
//                 left: position.x - 4,
//                 width: 8,
//                 height: 8,
//                 borderRadius: '50%',
//                 backgroundColor: 'white',
//                 border: '1px solid #888',
//                 cursor: 'move',
//             }}
//             draggable
//             onDrag={(event) => handleDrag(event, { x: event.movementX, y: event.movementY })}
//         />
//     );
// };
//
// const JointedEdge = ({
//                          id,
//                          sourceX,
//                          sourceY,
//                          targetX,
//                          targetY,
//                          sourcePosition,
//                          targetPosition,
//                          data,
//                          arrowHeadType,
//                          markerEndId,
//                      }) => {
//     const edgePath = getBezierPath({
//         sourceX,
//         sourceY,
//         sourcePosition,
//         targetX,
//         targetY,
//         targetPosition,
//     });
//     // const center = getEdgeCenter({ sourceX, sourceY, targetX, targetY });
//     const center = {x: (sourceX+targetX)/2, y: (sourceY+targetY)/2}
//     const { joints = [] } = data || {};
//
//     return (
//         <>
//             <path id={id} d={edgePath} style={{ fill: 'none', stroke: '#555', strokeWidth: 2 }} markerEnd={`url(#${markerEndId})`} />
//             {joints.map((joint) => (
//                 <Joint key={joint.id} id={joint.id} position={joint.position} />
//             ))}
//             <EdgeText
//                 x={center.x}
//                 y={center.y}
//                 label={data.label}
//                 labelStyle={{ fontSize: '12px', fill: '#555' }}
//                 style={{ pointerEvents: 'none' }}
//             />
//         </>
//     );
// };
// export default JointedEdge;