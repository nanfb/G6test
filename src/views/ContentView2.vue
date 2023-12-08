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
const processParallelEdgesOnAnchorPoint = (
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
            `${src}|${srcAnchor}|${dst}|${dstAnchor}|${
              edgeMap[sourceTarget].length - 1
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
            type: "rect", // String，可选，节点的形状
            size: [30, 30], // Number[]，可选，节点大小
            x: 0, // Number，可选，节点位置的 x 值
            y: 0, // Number，可选，节点位置的 y 值
            anchorPoints: [
              [0.5, 1],
              [0.5, 0],
              [1, 0.5],
              [0, 0.5],
            ],
          },
          {
            id: "node2", // String，该节点存在则必须，节点的唯一标识
            x: 300, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
            anchorPoints: [
              [0.5, 1],
              [0.5, 0],
              [1, 0.5],
              [0, 0.5],
            ],
          },
          {
            x: 10,
            y: 120,
            text: "阀门",
            color: "red",
            id: "valve1",
            type: "valve",
            anchorPoints: [
              [0.5, 1],
              [0.5, 0],
              [1, 0.5],
              [0, 0.5],
            ],
          },
          {
            x: -30,
            y: 30,
            color: "red",
            id: "testcbsianl",
            type: "rect-node",
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
            target: "valve1", // String，必须，目标点 id
          },
          {
            source: "valve1", // String，必须，起始点 id
            target: "node2", // String，必须，目标点 id
          },
        ],
      },
      sourceAnchorIdx: undefined, // 起始锚点索引
      targetAnchorIdx: undefined, // 目标锚点索引
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
          // 这里可以定义两个模式，默认模式(default)和编辑模式(edit)，编辑模式下可以拖拽节点 使用 graph.setMode();切换指定模式
          default: [
            "zoom-canvas",
            "drag-canvas",
            "drag-node",
            {
              type: "create-edge",
              trigger: "drag", // set the trigger to be drag to make the create-edge triggered by drag
              shouldBegin: (e) => {
                // avoid beginning at other shapes on the node
                if (e.target && e.target.get("name") !== "anchor-point")
                  return false;
                this.sourceAnchorIdx = e.target.get("anchorPointIdx");
                e.target.set("links", e.target.get("links") + 1); // cache the number of edge connected to this anchor-point circle
                return true;
              },
              shouldEnd: (e) => {
                // avoid ending at other shapes on the node
                if (e.target && e.target.get("name") !== "anchor-point")
                  return false;
                if (e.target) {
                  this.targetAnchorIdx = e.target.get("anchorPointIdx");
                  e.target.set("links", e.target.get("links") + 1); // cache the number of edge connected to this anchor-point circle
                  return true;
                }
                this.targetAnchorIdx = undefined;
                return true;
              },
            },
            {
              type: "brush-select",
              trigger: "ctrl",
              selectedState: "selected",
              includeEdges: true,
              brushStyle: {
                stroke: "#1890FF",
                lineWidth: 1,
                fill: "#A7FFCE",
                fillOpacity: 0.3,
              },
            },
          ],
          edit: ["drag-node"],
        },
        autoPaint: true, // 更新视图后自动重绘 后续改成--》在批量操作节点的时候开启
        defaultNode: {
          // 节点默认配置，会被写入的 dataNode 覆盖
          size: 20,
          linkPoints: {
            top: true,
            bottom: true,
            left: true,
            right: true,
            size: 5,
            fill: "#fff",
          },
          labelCfg: {
            position: "center", // String，可选，文本标签的位置，可选值为：'left' | 'right' | 'top' | 'bottom' | 'center'
            style: {
              fill: "#000", // String，可选，文本的颜色
              fontSize: 8, // Number，可选，文本大小
            },
          },
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
              fill: "#333",
            },
            zIndex: 2,
            radius: 1,
          },
          // controlPoints: [
          //   // 指定三次贝塞尔曲线的 controlPoints 属性
          // ],
        },
      },
    };
    this.graph = createGrpah(conf); // 初始化图
    this.graph.get("canvas").set("localRefresh", false); // 关闭局部刷新，判定不准确，拖拽有残影
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
      // 测试
      // for (let i = 0; i < 1000; i++) {
      //   console.log(model.x, model.y);
      //   this.graph.addItem("node", {
      //     ...model,
      //     id: "node" + Math.random(),
      //     type: type,
      //     x: 1213 * Math.random(),
      //     y: 1021 * Math.random(),
      //   });
      // }
    },
    // NDOE-EVENT
    nodeMouseEnter(e) {
      this.graph.setItemState(e.item, "hover", true);
    },
    nodeMouseLeave(e) {
      this.graph.setItemState(e.item, "hover", false);
    },
    nodeClick(e) {
      console.log(e);
      this.graph.setItemState(e.item, "selected", true);
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
      const nodes = this.graph.findAllByState("node", "selected");
      edges.forEach((edge) => {
        this.graph.setItemState(edge, "selected", false);
      });
      nodes.forEach((node) => {
        this.graph.setItemState(node, "selected", false);
      });
    },

    // 事件注册
    initGraphEvent() {
      // node
      registeredGraphEvent.call(this, "node:mouseenter", this.nodeMouseEnter);
      registeredGraphEvent.call(this, "node:mouseleave", this.nodeMouseLeave);
      registeredGraphEvent.call(this, "node:click", this.nodeClick);
      // edge
      registeredGraphEvent.call(this, "edge:mouseenter", this.edgeMouseEnter);
      registeredGraphEvent.call(this, "edge:mouseleave", this.edgeMouseLeave);
      registeredGraphEvent.call(this, "edge:click", this.edgeClick);
      // canvas
      registeredGraphEvent.call(this, "canvas:click", this.graphClick);

      // vbnm,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      this.graph.on("aftercreateedge", (e) => {
        // update the sourceAnchor and targetAnchor for the newly added edge
        this.graph.updateItem(e.edge, {
          sourceAnchor: this.sourceAnchorIdx,
          targetAnchor: this.targetAnchorIdx,
        });

        // update the curveOffset for parallel edges
        const edges = this.graph.save().edges;
        processParallelEdgesOnAnchorPoint(edges);
        this.graph.getEdges().forEach((edge, i) => {
          this.graph.updateItem(edge, {
            curveOffset: edges[i].curveOffset,
            curvePosition: edges[i].curvePosition,
          });
        });
      });

      // after drag from the first node, the edge is created, update the sourceAnchor
      this.graph.on("afteradditem", (e) => {
        if (e.item && e.item.getType() === "edge") {
          this.graph.updateItem(e.item, {
            sourceAnchor: this.sourceAnchorIdx,
          });
        }
      });

      // if create-edge is canceled before ending, update the 'links' on the anchor-point circles
      this.graph.on("afterremoveitem", (e) => {
        if (e.item && e.item.source && e.item.target) {
          const sourceNode = this.graph.findById(e.item.source);
          const targetNode = this.graph.findById(e.item.target);
          const { sourceAnchor, targetAnchor } = e.item;
          if (sourceNode && !isNaN(sourceAnchor)) {
            const sourceAnchorShape = sourceNode
              .getContainer()
              .find(
                (ele) =>
                  ele.get("name") === "anchor-point" &&
                  ele.get("anchorPointIdx") === sourceAnchor
              );
            sourceAnchorShape.set("links", sourceAnchorShape.get("links") - 1);
          }
          if (targetNode && !isNaN(targetAnchor)) {
            const targetAnchorShape = targetNode
              .getContainer()
              .find(
                (ele) =>
                  ele.get("name") === "anchor-point" &&
                  ele.get("anchorPointIdx") === targetAnchor
              );
            targetAnchorShape.set("links", targetAnchorShape.get("links") - 1);
          }
        }
      });
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
