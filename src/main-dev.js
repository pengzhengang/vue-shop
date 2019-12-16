import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './utils/config'
// import './utils/element'
import './utils/filter'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
