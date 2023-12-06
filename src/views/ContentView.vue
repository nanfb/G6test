<template>
  <div id="contentView">
    <node-panel :graph="graph" v-if="graph" @addNode="addNode"></node-panel>
    <div id="mountNode"></div>
    <div class="control-panel">
      <ControlPanel :graph="graph" v-if="graph"></ControlPanel>
    </div>
  </div>
</template>
<script>
import NodePanel from "@/components/NodePanel.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import { init as createGrpah } from "./base/G6";
import registeredGraphEvent from "./base/registeredGraphEvent";

export default {
  name: "ContentView",
  components: {
    NodePanel,
    ControlPanel,
  },
  data() {
    return {
      graph: null, // 图实例
      container: null, // 容器
      sourceData: {
        nodes: [
          {
            id: "node1", // String，该节点存在则必须，节点的唯一标识
            label: "节点1", // String，可选，节点的文本标签
            labelCfg: {
              position: "center", // String，可选，文本标签的位置，可选值为：'left' | 'right' | 'top' | 'bottom' | 'center'
            },
            type: "rect", // String，可选，节点的形状
            size: [30, 30], // Number[]，可选，节点大小
            x: 0, // Number，可选，节点位置的 x 值
            y: 0, // Number，可选，节点位置的 y 值
          },
          {
            id: "node2", // String，该节点存在则必须，节点的唯一标识
            x: 300, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
          {
            id: "node3", // String，该节点存在则必须，节点的唯一标识
            x: 200, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
        ],
        // 边集
        edges: [
          {
            source: "node1", // String，必须，起始点 id
            target: "node2", // String，必须，目标点 id
          },
          {
            source: "node1", // String，必须，起始点 id
            target: "node3", // String，必须，目标点 id
          },
        ],
      },
    };
  },
  mounted() {
    this.container = document.getElementById("mountNode");
    if (!this.container) {
      return;
    }
    let width = this.container.offsetWidth || 500;
    let height = this.container.offsetHeight || 500;
    let conf = {
      el: this.container,
      width: width,
      height: height,
      options: {
        fitView: true, // 图自动适配画布大小
        fitViewPadding: [20, 20, 20, 70], // [number, number, number, number] 图适应画布留白
        modes: {
          // 这里可以定义两个模式，默认模式和编辑模式，编辑模式下可以拖拽节点 使用 graph.setMode();切换指定模式
          default: ["zoom-canvas", "drag-canvas", "drag-node"],
          edit: ["drag-node"],
        },
        autoPaint: true, // 更新视图后自动重绘 后续改成--》在批量操作节点的时候开启
        defaultNode: {
          // 节点默认配置，会被写入的 dataNode 覆盖
          size: 20,
        },
        defaultEdge: {
          // 边默认配置，会被写入到边的 model 中
          size: 1, // 线条粗细
          color: "#333", // 线条颜色
          type: "polyline", // 线条类型，直线：line，三次贝塞尔曲线：cubic，二次贝塞尔曲线：quadratic，圆弧：arc
          style: {
            offset: 15,
            endArrow: {
              path: "M 0,0 L 4,2 L 4,-2 Z",
              fill: "#ccc",
            },
            zIndex: 2,
            radius: 3,
          },
          // controlPoints: [
          //   // 指定三次贝塞尔曲线的 controlPoints 属性
          // ],
        },
      },
    };
    this.graph = createGrpah(conf); // 初始化图
    this.graph.data(this.sourceData); // 读取数据源到图上
    this.graph.render(); // 渲染图
    // 事件注册
    this.initGraphEvent();
    window.addEventListener("resize", () => {
      if (!this.graph || this.graph.get("destroyed")) return;
      if (!this.container) {
        return;
      }
      this.$nextTick(() => {
        let width = this.container.offsetWidth || 500;
        let height = this.container.offsetHeight || 500;
        this.graph.changeSize(width, height);
      });
    });
  },
  methods: {
    addNode({ type, model }) {
      this.graph.addItem("node", model);
    },
    // NDOE-EVENT
    nodeMouseEnter(e) {
      this.graph.setItemState(e.item, "hover", true);
    },
    nodeMouseLeave(e) {
      this.graph.setItemState(e.item, "hover", false);
    },
    // EDGE-EVENT
    edgeMouseEnter(e) {
      this.graph.setItemState(e.item, "hover", true);
    },
    edgeMouseLeave(e) {
      this.graph.setItemState(e.item, "hover", false);
    },
    edgeClick(e) {
      this.graph.setItemState(e.item, "selected", true);
    },
    // CANVAS-EVENT
    graphClick(e) {
      // 清除所有边的选中状态
      const edges = this.graph.findAllByState("edge", "selected");
      edges.forEach((edge) => {
        this.graph.setItemState(edge, "selected", false);
      });
    },

    // 事件注册
    initGraphEvent() {
      // node
      registeredGraphEvent.call(this, "node:mouseenter", this.nodeMouseEnter);
      registeredGraphEvent.call(this, "node:mouseleave", this.nodeMouseLeave);
      // edge
      registeredGraphEvent.call(this, "edge:mouseenter", this.edgeMouseEnter);
      registeredGraphEvent.call(this, "edge:mouseleave", this.edgeMouseLeave);
      registeredGraphEvent.call(this, "edge:click", this.edgeClick);
      // canvas
      registeredGraphEvent.call(this, "canvas:click", this.graphClick);
    },
  },
};
</script>
<style lang="less" scoped>
#contentView {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  overflow: hidden;
  #mountNode {
    // display: inline-block;
    width: calc(100% - 300px);
    flex: 1;
    height: 100vh;
    border: 1px solid #000;
    box-sizing: border-box;
  }
  .control-panel {
    width: 300px;
    height: 100%;
    position: relative;
    right: 0;
    top: 0;
    background-color: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    padding: 10px 5px;
    border-radius: 4px;
  }
}
</style>
