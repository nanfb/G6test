import G6 from '@antv/g6';
import { nodeGlobalState } from './globalState/nodeGlobalState'
import { edgeGlobalState } from './globalState/edgeGlobalState'
// 注册自定义节点
import { RegisterCustomNode } from './customNodeConfiguration/utils/RegisterCustomNode'
// 自定义节点配置
import valve from './customNodeConfiguration/valve.js';
import rectlink from './customNodeConfiguration/rectLink.js';
rectlink.init()
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
// 注册自定义节点

export function init({ el, width, height, options }) {
    // 注册自定义节点
    RegisterCustomNode([valve], G6);
    return new G6.Graph({
        container: el,
        width: width ? width : w,
        height: height ? height : h,
        ...options,
        nodeStateStyles: nodeGlobalState,
        edgeStateStyles: edgeGlobalState,
        //
        enabledStack: true, // 启用 redo undo 栈
        // linkCenter: true, // 连线到节点中心
        plugins: [SnapLine, toolbar, Grid],
    });


}