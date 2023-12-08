<template>
  <div id="app">
    <ContentView></ContentView>
  </div>
</template>

<script>
import ContentView from "./views/ContentView2.vue";
export default {
  name: "App",
  components: {
    ContentView,
  },
};
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
