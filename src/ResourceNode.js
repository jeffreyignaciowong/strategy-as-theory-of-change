import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import "./ResourceNode.css";
import SetNodesContext from "./SetNodesContext";
import toggleCheckbox from "./PruneScript";

function ResourceNode({ data, id, prune = false }) {
  const setNodes = useContext(SetNodesContext);
  const [textAreaValue, setTextAreaValue] = useState(
    data.textAreaValue.toString()
  );
  const [textAreaHeight, setTextAreaHeight] = useState(() => {
    return typeof data.textAreaHeight === "number" ? data.textAreaHeight : 35;
  });
  const [textAreaWidth, setTextAreaWidth] = useState(() => {
    return typeof data.textAreaWidth === "number" ? data.textAreaWidth : 180;
  });

  // const onChange = useCallback((evt) => {
  //     console.log(evt.target.value);
  // }, []);

  const handleTextareaChange = (event) => {
    setTextAreaValue(event.target.value);
    // console.log(event.target.value);
  };

  useEffect(() => {
    setTextAreaValue(data.textAreaValue.toString());
    if (typeof data.textAreaHeight === "number")
      setTextAreaHeight(data.textAreaHeight);

    if (typeof data.textAreaWidth === "number")
      setTextAreaWidth(data.textAreaWidth);
  }, [data]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // console.log('useEffect text area update')
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            textAreaValue: textAreaValue,
            textAreaHeight: textAreaHeight,
            textAreaWidth: textAreaWidth,
          };
        }
        return node;
      })
    );
  }, [textAreaValue, textAreaHeight, textAreaWidth]);

  const onClickResize = (event) => {
    // Update textarea height and width based on content
    // Weird increase by 4 bug. Changes when I don't change. -4 is neutral
    const newHeight = event.target.scrollHeight - 4;
    const newWidth = event.target.scrollWidth - 4;
    setTextAreaHeight(newHeight);
    setTextAreaWidth(newWidth);
    // console.log(newHeight);
    // console.log(newWidth);
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    const checkedNodes = toggleCheckbox(isChecked, id);
    //console.log("Checked nodes:", checkedNodes);
  };

  return (
    <div
      className={`resource-node ${isChecked ? "checked" : ""} ${
        prune ? "pruned-background" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <div>
        <div className="content-wrapper">
          <input
            type="checkbox"
            className="toggle-btn"
            onChange={handleCheckboxChange}
          />
          <label htmlFor="text">
            {data.name} {data.nodeNumber}
          </label>
        </div>
        <textarea
          onMouseUp={onClickResize}
          value={textAreaValue}
          style={{
            height: textAreaHeight,
            width: textAreaWidth,
            minHeight: 25,
            minWidth: 65,
          }}
          className="nodrag text-area"
          onChange={handleTextareaChange}
        ></textarea>
      </div>
      <Handle type="source" position={Position.Right} id="a" />
    </div>
  );
}

export default ResourceNode;
