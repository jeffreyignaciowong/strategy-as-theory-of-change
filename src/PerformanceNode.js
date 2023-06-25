import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import './ResourceNode.css';

function PerformanceNode({ data }) {
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className='resource-node'>
            <Handle type="target" position={Position.Left} />
            <div>
                <label htmlFor="text">{data.name} {data.nodeNumber}</label>
                <textarea className="nodrag text-area" >

                </textarea>
            </div>
            <Handle type="source" position={Position.Right} id="a" />
        </div>
    );
}

export default PerformanceNode;