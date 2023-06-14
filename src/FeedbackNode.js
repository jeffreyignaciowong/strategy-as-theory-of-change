import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import './FeedbackNode.css'

function FeedbackNode({ data }) {
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className='feedback-node'>
            <Handle type="target" position={Position.Right} />
                <label htmlFor="text">Feedback</label>
            <Handle type="source" position={Position.Left} id="a" />
        </div>
    );
}

export default FeedbackNode;