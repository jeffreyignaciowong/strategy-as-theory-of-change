import {useCallback, useState} from 'react';
import { Handle, Position } from 'reactflow';
import './ResourceNode.css';

function ResourceNode({ data }) {
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    const [textareaHeight, setTextareaHeight] = useState('auto');

    // I don't remember why I tried this
    const handleTextareaChange = (event) => {
        data.textData = event.target.value;
        console.log(event.target.value);
        setTextareaHeight(`${event.target.scrollHeight}px`);
        console.log(event.target.scrollHeight)
    };

    return (
        <div className='resource-node'>
            <Handle type="target" position={Position.Left} />
            <div>
                <label htmlFor="text">{data.name} {data.nodeNumber}</label>
                <textarea className="nodrag text-area" onChange={handleTextareaChange}>

                </textarea>
            </div>
            <Handle type="source" position={Position.Right} id="a" />
        </div>
    );
}

export default ResourceNode;