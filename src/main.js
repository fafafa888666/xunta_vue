import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { NavBar, Icon, Tabbar, TabbarItem, Swipe, SwipeItem, Sidebar, SidebarItem, TreeSelect, Image, Divider, Cell,
  ShareSheet, Popup, Field, Button, Row, Col, Search, Picker, Form, Tab, Tabs, Card, Switch, NoticeBar, Area, Uploader,
  Tag, Popover, Grid, GridItem, Collapse, CollapseItem, Circle, Notify, Badge, Checkbox, Cascader, Dialog } from 'vant' // Vant组件
import api from './api' // api统一编写
import VueClipboard from 'vue-clipboard2' // 复制信息组件

// 开发环境
Vue.config.productionTip = true // 打包改为 false
// 复制信息组件需要
VueClipboard.config.autoSetContainer = true
// Vant组件动态加载
Vue.use(VueClipboard).use(NavBar).use(Icon).use(Tabbar).use(TabbarItem).use(Swipe).use(SwipeItem).use(Sidebar).use(SidebarItem)
  .use(TreeSelect).use(Image).use(Divider).use(Cell).use(ShareSheet).use(Popup).use(Field).use(Button).use(Row)
  .use(Search).use(Picker).use(Form).use(Col).use(Tab).use(Tabs).use(Card).use(Switch).use(NoticeBar).use(Area)
  .use(Uploader).use(Tag).use(Popover).use(Grid).use(GridItem).use(Collapse).use(CollapseItem).use(Circle).use(Notify)
  .use(Badge).use(Checkbox).use(Cascader).use(Dialog)
// api统一调用
Vue.prototype.$api = api

/* 监听路由变化 */
router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title
  }
  // 判断是否需要登录
  if (to.matched.some(res => res.meta.isLogin)) {
    // 如果是登录状态
    if (localStorage['token']) {
      next()
    } else {
      // 如果不是登录状态，跳转登录
      next({
        path: '/index/login'
      })
    }
  } else {
    // 不需要登录
    next()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
