import G6 from '@antv/g6';
import { nodeGlobalState } from './globalState/nodeGlobalState'
import { edgeGlobalState } from './globalState/edgeGlobalState'
// 插件注册
const SnapLine = new G6.SnapLine({
    line: {
        stroke: '#8D59F4',
        lineWidth: 1,
        // lineDash: [5, 5],

    },
    lineAppendWidth: 2,
    // itemAlignType: true, //类型
});
const toolbar = new G6.ToolBar({ // todo 后面重写
    position: {
        x: 70,
        y: 10,
    }
});
const Grid = new G6.Grid();
// conf
let w = 500;
let h = 500;
let createNode = () => {
    G6.registerNode(
        'valve',
        {
            drawShape(cfg, group) {
                const shape = group.addShape('polygon', {
                    padding: '2px',
                    attrs: {
                        x: 1,
                        y: 1,

                        points: [
                            [0, 0],
                            [0, 10],
                            [5, 5],
                            [10, 0],
                            [10, 10],
                            [5, 5],
                            [0, 0],
                        ],
                        stroke: '#000',
                        fill: 'green',
                        cursor: 'move'
                    },
                    linkPoints: {
                        top: true,
                        bottom: true,
                        left: true,
                        right: true,
                        size: 5,
                        fill: '#fff',
                    },
                    name: 'body',
                    draggable: true,
                });
                group.addShape('text', {
                    attrs: {
                        x: 5,
                        y: 15,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        text: cfg.label,
                        fill: '#000',
                        fontSize: 8,
                        cursor: 'move'
                    },
                    name: 'description',
                    draggable: true,
                });
                return shape;
            }
        },
        // 'single-node'  // 这里继承节点可能要重写一下，不然会跟原有的冲突
    )
}
export function init({ el, width, height, options }) {
    // 注册自定义节点
    createNode();
    return new G6.Graph({
        container: el,
        width: width ? width : w,
        height: height ? height : h,
        ...options,
        nodeStateStyles: nodeGlobalState,
        edgeStateStyles: edgeGlobalState,
        enabledStack: true, // 启用 redo undo
        // linkCenter: true, // 连线中心
        plugins: [SnapLine, toolbar, Grid],
    });

}