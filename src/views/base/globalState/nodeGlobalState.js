// 节点全局状态 通过修改节点状态达到修改节点样式的目的
export const nodeGlobalState = {
    hover: {
        stroke: '#000',
        fill: '#ccc',
        cursor: 'move',
    },
    selected: {
        stroke: '#7622FF',
        lineDash: [4, 4],
        lineWidth: 1,
        cursor: 'move',
    },
}