<template>
  <div>
    <!-- 节点面板 -->
    <div class="node_panel">
      <div
        draggable="true"
        v-for="item in nodeList"
        :key="item"
        class="node_li"
        @dragend="addNode(item, $event)"
      >
        <div :class="['item_shape', item]"></div>
        <div class="item_name">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "node-panel",
  data() {
    return {
      nodeList: ["valve", "circle"],
    };
  },
  props: ["graph"],
  mounted() {},
  methods: {
    addNode(type, e) {
      if (e.dataTransfer.dropEffect === "none") return;
      const point = this.graph.getPointByClient(e.x, e.y);
      console.log(point);
      const model = {
        id: "node" + Math.random(),
        text: type + "1",
        // type: "rect-node",
        type: type,
        x: point.x,
        y: point.y,
        labelCfg: {
          // offset: , // Number，可选，文本距离节点的距离
          position: "bottom", // String，可选，文本标签的位置，可选值为：'left' | 'right' | 'top' | 'bottom' | 'center'
          style: {
            fill: "#000", // String，可选，文本的颜色
            fontSize: 8, // Number，可选，文本大小
            marginTop: 10,
          },
        },
      };
      this.$emit("addNode", {
        type,
        model,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.node_panel {
  position: absolute;
  left: 10px;
  top: 60px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  padding: 10px 5px;
  border-radius: 4px;
  z-index: 99;
  background-color: rgba(255, 255, 255, 0.9);
}

.node_li {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  user-select: none;
  cursor: move;

  .item_name {
    font-size: 12px;
    color: #666;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.item_shape {
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
}

.circle {
  border-radius: 50%;
}
</style>
