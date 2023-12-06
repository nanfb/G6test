import Vue from 'vue'
import App from './App.vue'

// restCss
import "../src/assets/css/rest.css"

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
