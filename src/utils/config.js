import Vue from 'vue'
import '../assets/css/global.css'
import '../assets/fonts/iconfont.css'
import axios from 'axios'
import TrreTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
//富文本编辑器样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

//导入NProgress包对应的JS和css
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
/* 配置请求的根路径 */
axios.defaults.baseURL = 'http://192.168.14.42:8888/api/private/v1/'
//在request拦截器中,展示进度条  NProgress.start()
axios.interceptors.request.use(config=>{
    NProgress.start()
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
//在response拦截器中,隐藏进度条 NProgress.done()
axios.interceptors.response.use(config=>{
    NProgress.done()
    return config
})
Vue.prototype.axios = axios
Vue.use(VueQuillEditor)
Vue.component('tree-table',TrreTable)
export default Vue