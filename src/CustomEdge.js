import React from 'react';
import { getBezierPath,  Handle } from 'reactflow';

import './index.css';

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
                draggable
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <Handle>
                <div>
                    {/*<button className="edgebutton" onClick={(event) => onEdgeClick(event, id)}>*/}
                        × test
                    {/*</button>*/}
                </div>
                </Handle>
            </foreignObject>
        </>
    );
}


// import React, { useState } from 'react';
// import { Handle, Position, EdgeText } from 'reactflow';
//
// const CustomEdge = ({
//                         id,
//                         sourceX,
//                         sourceY,
//                         targetX,
//                         targetY,
//                         style = {},
//                         data = {},
//                         arrowHeadType,
//                         markerEndId,
//                         onEdgeClick,
//                         onEdgeDoubleClick,
//                         onEdgeMouseEnter,
//                         onEdgeMouseMove,
//                         onEdgeMouseLeave,
//                         onLoad,
//                         sourcePosition = Position.Right,
//                         targetPosition = Position.Left,
//                         elementsSelectable = true,
//                         isSelected,
//                     }) => {
//     const [x, setX] = useState((sourceX + targetX) / 2);
//     const [y, setY] = useState((sourceY + targetY) / 2);
//
//     const handleDrag = (event, position) => {
//         const { x, y } = position;
//         setX(x);
//         setY(y);
//     };
//
//     return (
//         <>
//             <Handle
//                 type="source"
//                 position={sourcePosition}
//                 style={{ ...style, background: 'none' }}
//                 onConnect={(params) => console.log('handle onConnect', params)}
//                 onEdgeClick={onEdgeClick}
//                 onEdgeDoubleClick={onEdgeDoubleClick}
//                 onEdgeMouseEnter={onEdgeMouseEnter}
//                 onEdgeMouseMove={onEdgeMouseMove}
//                 onEdgeMouseLeave={onEdgeMouseLeave}
//                 isSelected={isSelected}
//             />
//             <EdgeText
//                 x={(sourceX + targetX) / 2}
//                 y={(sourceY + targetY) / 2}
//                 label={data.text || ''}
//                 style={{
//                     fill: '#333',
//                     fontSize: '0.75rem',
//                     fontWeight: 600,
//                     pointerEvents: 'none',
//                 }}
//             />
//             <g>
//                 <line
//                     x1={sourceX}
//                     y1={sourceY}
//                     x2={x}
//                     y2={y}
//                     style={style}
//                     markerEnd={markerEndId}
//                 />
//                 <circle cx={x} cy={y} r={5} fill="white" stroke="#222" />
//                 <circle
//                     cx={x}
//                     cy={y}
//                     r={10}
//                     fill="transparent"
//                     stroke="transparent"
//                     onMouseDown={(event) => event.stopPropagation()}
//                     onMouseUp={(event) => event.stopPropagation()}
//                     onMouseMove={(event) => event.stopPropagation()}
//                     onDoubleClick={(event) => event.stopPropagation()}
//                 />
//                 <Handle
//                     type="target"
//                     position={targetPosition}
//                     style={{ ...style, background: 'none' }}
//                     onConnect={(params) => console.log('handle onConnect', params)}
//                     onEdgeClick={onEdgeClick}
//                     onEdgeDoubleClick={onEdgeDoubleClick}
//                     onEdgeMouseEnter={onEdgeMouseEnter}
//                     onEdgeMouseMove={onEdgeMouseMove}
//                     onEdgeMouseLeave={onEdgeMouseLeave}
//                     isSelected={isSelected}
//                 />
//             </g>
//         </>
//     );
// };
//
// export default CustomEdge;