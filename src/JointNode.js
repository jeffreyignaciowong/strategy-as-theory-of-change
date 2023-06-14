import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import './JointNode.css'

function JointNode({ data }) {
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className='joint-node'>
            <Handle type="target" position={Position.Right} />
            {/*<div>*/}
            {/*    <label htmlFor="text">Text:</label>*/}
            {/*    <input id="text" name="text" onChange={onChange} className="nodrag" />*/}
            {/*</div>*/}
            <Handle type="source" position={Position.Left} id="a" />
        </div>
    );
}

export default JointNode;