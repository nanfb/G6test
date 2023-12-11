// 这个函数对于重复路径target和source相同的情况下，会将这些路径的target和source的x和y坐标进行微调，使得这些路径不会重叠
export const processParallelEdgesOnAnchorPoint = (
    edges,
    offsetDiff = 15,
    multiEdgeType = "quadratic",
    singleEdgeType = undefined,
    loopEdgeType = undefined
) => {
    const len = edges.length;
    const cod = offsetDiff * 2;
    const loopPosition = [
        "top",
        "top-right",
        "right",
        "bottom-right",
        "bottom",
        "bottom-left",
        "left",
        "top-left",
    ];
    const edgeMap = {};
    const tags = [];
    const reverses = {};
    for (let i = 0; i < len; i++) {
        const edge = edges[i];
        const { source, target, sourceAnchor, targetAnchor } = edge;
        const sourceTarget = `${source}|${sourceAnchor}-${target}|${targetAnchor}`;

        if (tags[i]) continue;
        if (!edgeMap[sourceTarget]) {
            edgeMap[sourceTarget] = [];
        }
        tags[i] = true;
        edgeMap[sourceTarget].push(edge);
        for (let j = 0; j < len; j++) {
            if (i === j) continue;
            const sedge = edges[j];
            const {
                source: src,
                target: dst,
                sourceAnchor: srcAnchor,
                targetAnchor: dstAnchor,
            } = sedge;

            // 两个节点之间共同的边
            // 第一条的source = 第二条的target
            // 第一条的target = 第二条的source
            if (!tags[j]) {
                if (
                    source === dst &&
                    sourceAnchor === dstAnchor &&
                    target === src &&
                    targetAnchor === srcAnchor
                ) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                    reverses[
                        `${src}|${srcAnchor}|${dst}|${dstAnchor}|${edgeMap[sourceTarget].length - 1
                        }`
                    ] = true;
                } else if (
                    source === src &&
                    sourceAnchor === srcAnchor &&
                    target === dst &&
                    targetAnchor === dstAnchor
                ) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                }
            }
        }
    }

    for (const key in edgeMap) {
        const arcEdges = edgeMap[key];
        const { length } = arcEdges;
        for (let k = 0; k < length; k++) {
            const current = arcEdges[k];
            if (current.source === current.target) {
                if (loopEdgeType) current.type = loopEdgeType;
                // 超过8条自环边，则需要重新处理
                current.loopCfg = {
                    position: loopPosition[k % 8],
                    dist: Math.floor(k / 8) * 20 + 50,
                };
                continue;
            }
            if (
                length === 1 &&
                singleEdgeType &&
                (current.source !== current.target ||
                    current.sourceAnchor !== current.targetAnchor)
            ) {
                current.type = singleEdgeType;
                continue;
            }
            current.type = multiEdgeType;
            const sign =
                (k % 2 === 0 ? 1 : -1) *
                (reverses[
                    `${current.source}|${current.sourceAnchor}|${current.target}|${current.targetAnchor}|${k}`
                ]
                    ? -1
                    : 1);
            if (length % 2 === 1) {
                current.curveOffset = sign * Math.ceil(k / 2) * cod;
            } else {
                current.curveOffset = sign * (Math.floor(k / 2) * cod + offsetDiff);
            }
        }
    }
    return edges;
};
