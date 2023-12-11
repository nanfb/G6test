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
// 这个函数是为了修改多边的布局状态
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
          { id: "node1", type: "rect-node", x: 1, y: 10 },
          { id: "node2", type: "rect-node", x: 10, y: 150 },
        ],
        // 边集
        edges: [],
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
            {
              type: "drag-node",
              shouldBegin: (e) => {
                // 这里对节点的的图元 name 进行过滤
                if (e.target.get("name") === "anchor-point") return false;
                return true;
              },
            },
            {
              type: "create-edge",
              trigger: "drag",
              shouldBegin: (e) => {
                if (e.target && e.target.get("name") !== "anchor-point")
                  return false;
                this.sourceAnchorIdx = e.target.get("anchorPointIdx");
                e.target.set("links", e.target.get("links") + 1);
                return true;
              },
              shouldEnd: (e) => {
                if (e.target && e.target.get("name") !== "anchor-point")
                  return false;
                if (e.target) {
                  this.targetAnchorIdx = e.target.get("anchorPointIdx");
                  e.target.set("links", e.target.get("links") + 1);
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
          color: "blue", // 线条颜色
          type: "polyline", // 线条类型，直线：line，三次贝塞尔曲线：cubic，二次贝塞尔曲线：quadratic，圆弧：arc
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
    this.initGraphEvent(this.graph);
    window.addEventListener("resize", () => {
      if (!this.graph || this.graph.get("destroyed")) return;
      if (!this.container) return;
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

    // 事件注册
    initGraphEvent(graph) {
      graph.on("aftercreateedge", (e) => {
        graph.updateItem(e.edge, {
          // 更新索引
          sourceAnchor: this.sourceAnchorIdx,
          targetAnchor: this.targetAnchorIdx,
        });

        // update the curveOffset for parallel edges
        const edges = graph.save().edges;
        processParallelEdgesOnAnchorPoint(edges);
        graph.getEdges().forEach((edge, i) => {
          graph.updateItem(edge, {
            type: "polyline",
            curveOffset: edges[i].curveOffset,
            curvePosition: edges[i].curvePosition,
          });
        });
      });

      // after drag from the first node, the edge is created, update the sourceAnchor
      graph.on("afteradditem", (e) => {
        if (e.item && e.item.getType() === "edge") {
          graph.updateItem(e.item, {
            sourceAnchor: this.sourceAnchorIdx,
          });
        }
      });
      // if create-edge is canceled before ending, update the 'links' on the anchor-point circles
      graph.on("afterremoveitem", (e) => {
        if (e.item && e.item.source && e.item.target) {
          const sourceNode = graph.findById(e.item.source);
          const targetNode = graph.findById(e.item.target);
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
      // 连接桩的显示隐藏
      graph.on("node:mouseenter", (e) => {
        graph.setItemState(e.item, "showAnchors", true);
      });
      graph.on("node:mouseleave", (e) => {
        graph.setItemState(e.item, "showAnchors", false);
      });
      graph.on("node:dragenter", (e) => {
        graph.setItemState(e.item, "showAnchors", true);
      });
      graph.on("node:dragleave", (e) => {
        graph.setItemState(e.item, "showAnchors", false);
      });
      graph.on("node:dragstart", (e) => {
        graph.setItemState(e.item, "showAnchors", true);
      });
      graph.on("node:dragout", (e) => {
        graph.setItemState(e.item, "showAnchors", false);
      });
      graph.on("edge:click", (e) => {
        graph.setItemState(e.item, "selected", true);
      });
      graph.on("edge:mouseenter", (e) => {
        graph.setItemState(e.item, "hover", true);
      });
      graph.on("edge:mouseleave", (e) => {
        graph.setItemState(e.item, "hover", false);
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
