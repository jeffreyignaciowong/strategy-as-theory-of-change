class GraphCalculations {
    adjList;
    matrixMap;
    getNode;
    performanceCount;
    // list of the values that are performances in the matrixMap to calculate falsifiability
    performanceMapList;
    resourcePracticeMapOfLists;
    practiceCount;
    resourceCount;
    constructor(nodes, edges, getNode) {
        this.adjList = new Map();
        const feedbackList = [];
        this.performanceCount = 0;
        this.getNode = getNode;
        this.performanceMapList = [];
        this.resourcePracticeMapOfLists = new Map();
        this.practiceCount = 0;
        this.resourceCount = 0;
        for (const node of nodes) {
            // console.log(node)
            this.adjList.set(node.id, []);
            if (node.type === 'FeedbackNode') {
                feedbackList.push(node.id);
                this.adjList.set(`${node.id}_backwards`, []);
            }
            if (node.type === 'PerformanceNode') {
                this.performanceCount++;
            }
            if (node.type === 'PracticeNode') {
                this.practiceCount++;
            }
            if (node.type === 'ResourceNode') {
                this.resourceCount++;
                this.resourcePracticeMapOfLists.set(node.id, []);
            }
        }

        for (const edge of edges) {
            const node = this.getNode(edge.target);
            if (node !== undefined && node.type === 'FeedbackNode') {
                this.adjList.get(`${edge.target}_backwards`).push(edge.source);
            } else {
                this.adjList.get(edge.source).push(edge.target);
            }
            // console.log(edge)
        }
        // console.log(this.adjList);
        // console.log(feedbackList);
        for (const feedbackNode of feedbackList) {
            const targetList = this.adjList.get(feedbackNode);
            this.adjList.delete(feedbackNode);
            const sourceList = this.adjList.get(`${feedbackNode}_backwards`);
            this.adjList.delete(`${feedbackNode}_backwards`);
            for (const source of sourceList) {
                for (const target of targetList) {
                    const updateList = this.adjList.get(source);
                    if (!updateList.includes(target)) {
                        updateList.push(target);
                    }
                }
            }
        }
        // console.log(this.adjList);
    }
    calculateGeodesics () {
        this.matrixMap = new Map();
        for (const [startNode] of this.adjList) {
            const queue = [];
            queue.push(startNode);
            let distance = 0;
            const visited = new Map();
            while (queue.length > 0) {
                const qLen = queue.length;
                for (let i = 0; i < qLen; i++) {
                    const node = queue.shift();
                    for (const neighbourNode of this.adjList.get(node)) {
                        const neighbourVisited = visited.get(neighbourNode);
                        if (neighbourVisited !== undefined && neighbourVisited === distance) {
                            const matrixKey = `${startNode}_${neighbourNode}`
                            this.matrixMap.set(matrixKey, this.matrixMap.get(matrixKey) + 1);
                        } else if (neighbourVisited === undefined) {
                            const neighbourType = this.getNode(neighbourNode).type;
                            const startNodeType = this.getNode(startNode).type;
                            const matrixKey = `${startNode}_${neighbourNode}`
                            this.matrixMap.set(matrixKey, 1);
                            queue.push(neighbourNode);
                            visited.set(neighbourNode, distance);
                            if (neighbourType === 'PerformanceNode') {
                                this.performanceMapList.push(matrixKey);
                            }
                            if (startNodeType === 'ResourceNode' && neighbourType === 'PracticeNode') {
                                this.resourcePracticeMapOfLists.get(startNode).push({matrixKey, practiceNode:neighbourNode});
                            }
                        }
                    }
                }
                distance += 1;
            }
        }
        // console.log(this.matrixMap)
    }
    calculateValues () {
        const complexity = this.calculateComplexity();
        const falsifiability = this.calculateFalsifiability();
        const replicability = this.calculateReplicability();
        return {
            complexity: isNaN(complexity)? 'Not applicable for current theory': complexity.toFixed(2),
            falsifiability: isNaN(falsifiability)? 'Not applicable for current theory': falsifiability.toFixed(2),
            replicability: isNaN(replicability)? 'Not applicable for current theory': replicability.toFixed(2),
        }
    }
    calculateComplexity () {
        let sum = 0;
        for (const [, value] of this.matrixMap) {
            sum += value;
        }
        return sum/3;
    }

    calculateFalsifiability () {
        let sum = 0;
        // console.log(`performanceCount: ${this.performanceCount}`);
        for (const node of this.performanceMapList) {
            // console.log(`node: ${node} matrixMap: ${this.matrixMap.get(node)}`);
            sum += this.matrixMap.get(node)
        }
        return sum/(2*this.performanceCount);
    }

    calculateReplicability () {
        let sum = 0;
        const addedPracticeSet = new Set();
        for (const [, valueList] of this.resourcePracticeMapOfLists) {
            // console.log(`valueList ${valueList}`);
            for (let i = 0; i < valueList.length; i++) {
                for (let j = i+1; j < valueList.length; j++) {
                    if(this.matrixMap.get(valueList[i].matrixKey) > 0 && this.matrixMap.get(valueList[j].matrixKey) > 0) {
                        const node1 = valueList[i].practiceNode;
                        const node2 = valueList[j].practiceNode;
                        const practiceSetKey = (node1 < node2)? (node1 + node2): (node2 + node1);
                        if (!addedPracticeSet.has(practiceSetKey)) {
                            sum +=1;
                            addedPracticeSet.add(practiceSetKey)
                        }
                    }
                }
            }
        }
        // (Np(np-1))/2
        const summation = (this.practiceCount*(this.practiceCount-1))/2;
        const alpha = sum/summation;

        // console.log(`summation ${summation} alpha: ${alpha} sum: ${sum} resourceCount: ${this.resourceCount} practiceCount: ${this.practiceCount}`);

        // 1 + alpha*Nr*Np
        return 1 + (alpha*this.resourceCount*this.practiceCount);
    }
}

export default GraphCalculations;