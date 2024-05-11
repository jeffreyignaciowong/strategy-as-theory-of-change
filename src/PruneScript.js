let checkedNodes = [];

const toggleCheckbox = (isChecked, nodeId) => {
  if (!isChecked) {
    checkedNodes.push(nodeId);
  } else {
    checkedNodes = checkedNodes.filter((id) => id !== nodeId);
  }

  return checkedNodes;
};

const getPrunedForward = (specific, edges, visited) => {
  if (visited.has(specific)) {
    return [];
  }

  visited.add(specific);

  const forEdges = edges.filter((edge) => edge.source === specific);
  const forNodes = [];
  for (let i = 0; i < forEdges.length; i++) {
    forNodes.push(forEdges[i].target);
    let extendedEdges = getPrunedForward(forEdges[i].target, edges, visited);
    let filteredEdges = extendedEdges.filter((element) => element !== "");
    for (let j = 0; j < filteredEdges.length; j++) {
      forNodes.push(filteredEdges[j]);
    }
  }
  return forNodes;
};

const getPrunedBackward = (specific, edges, visited) => {
  if (visited.has(specific)) {
    return [];
  }

  visited.add(specific);

  const forEdges = edges.filter((edge) => edge.target === specific);
  const forNodes = [];
  for (let i = 0; i < forEdges.length; i++) {
    forNodes.push(forEdges[i].source);
    let extendedEdges = getPrunedBackward(forEdges[i].source, edges, visited);
    let filteredEdges = extendedEdges.filter((element) => element !== "");
    for (let j = 0; j < filteredEdges.length; j++) {
      forNodes.push(filteredEdges[j]);
    }
  }
  return forNodes;
};

const getPrunedForwardNoFeed = (specific, edges) => {
  const forEdges = edges.filter((edge) => edge.source === specific);
  const forNodes = [];
  for (let i = 0; i < forEdges.length; i++) {
    console.log(forEdges[i].target);
    if (forEdges[i].target.charAt(0) !== "F") {
      forNodes.push(forEdges[i].target);
      let extendedEdges = getPrunedForwardNoFeed(forEdges[i].target, edges);
      let filteredEdges = extendedEdges.filter((element) => element !== "");
      for (let j = 0; j < filteredEdges.length; j++) {
        forNodes.push(filteredEdges[j]);
      }
    }
  }
  return forNodes;
};

const getPrunedBackwardNoFeed = (specific, edges) => {
  const forEdges = edges.filter((edge) => edge.target === specific);
  const forNodes = [];
  for (let i = 0; i < forEdges.length; i++) {
    console.log(forEdges[i].source);
    if (forEdges[i].source.charAt(0) !== "F") {
      forNodes.push(forEdges[i].source);
      let extendedEdges = getPrunedBackwardNoFeed(forEdges[i].source, edges);
      let filteredEdges = extendedEdges.filter((element) => element !== "");
      for (let j = 0; j < filteredEdges.length; j++) {
        forNodes.push(filteredEdges[j]);
      }
    }
  }
  return forNodes;
};

export const getPrunedElements = (edges, feedback) => {
  let Fvisited = new Set();
  let Bvisited = new Set();
  let prunedNodes = [];
  console.log(feedback);

  if (feedback === true) {
    for (let i = 0; i < checkedNodes.length; i++) {
      if (!prunedNodes.includes(checkedNodes[i])) {
        prunedNodes.push(checkedNodes[i]);
      }
      let forwardNodes = getPrunedForward(checkedNodes[i], edges, Fvisited);
      for (let j = 0; j < forwardNodes.length; j++) {
        if (!prunedNodes.includes(forwardNodes[j])) {
          prunedNodes.push(forwardNodes[j]);
        }
      }
      let backwardNodes = getPrunedBackward(checkedNodes[i], edges, Bvisited);
      for (let j = 0; j < backwardNodes.length; j++) {
        if (!prunedNodes.includes(backwardNodes[j])) {
          prunedNodes.push(backwardNodes[j]);
        }
      }
    }
  } else {
    for (let i = 0; i < checkedNodes.length; i++) {
      if (!prunedNodes.includes(checkedNodes[i])) {
        prunedNodes.push(checkedNodes[i]);
      }
      let forwardNodes = getPrunedForwardNoFeed(checkedNodes[i], edges);
      for (let j = 0; j < forwardNodes.length; j++) {
        if (!prunedNodes.includes(forwardNodes[j])) {
          prunedNodes.push(forwardNodes[j]);
        }
      }
      let backwardNodes = getPrunedBackwardNoFeed(checkedNodes[i], edges);
      for (let j = 0; j < backwardNodes.length; j++) {
        if (!prunedNodes.includes(backwardNodes[j])) {
          prunedNodes.push(backwardNodes[j]);
        }
      }
    }
  }
  console.log(prunedNodes);
  return prunedNodes;
};

export default toggleCheckbox;
export const getCheckedNodes = () => checkedNodes;
