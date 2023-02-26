import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import PCHome from './views/PCHome.vue'
import Login from '@/views/Login'
import Collect from '@/views/collect/Index'
import CollectEdit from '@/views/collect/Edit'
import Category from '@/views/Category'
import Setting from '@/views/Setting'

// 有时候路由跳转会报错，加了这个就不会报错了
const routerPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return routerPush.call(this, location).catch(error => error)
}

Vue.use(Router)

/**
 * path:路由路径
 * name:路由名称
 * component:路由组件
 * meta:路由信息
 * title:页面标题title
 * index:页面顺序（路由跳转时需要）
 * isLogin:页面是否需要登录
 *
 */
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/index/pc',
      name: 'pcHome',
      component: PCHome,
      meta: {
        title: '寻它网址导航'
      }
    },
    {
      path: '/',
      name: 'index',
      component: Home,
      meta: {
        title: '首页',
        index: 1
      }
    },
    {
      path: '/index/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录',
        index: 3
      }
    },
    {
      path: '/index/collect',
      name: 'collect',
      component: Collect,
      meta: {
        title: '网址管理',
        isLogin: true,
        index: 4
      }
    },
    {
      path: '/index/collect/edit',
      name: 'collect',
      component: CollectEdit,
      meta: {
        title: '编辑网址',
        isLogin: true,
        index: 7
      }
    },
    {
      path: '/index/category',
      name: 'category',
      component: Category,
      meta: {
        title: '分类管理',
        isLogin: true,
        index: 5
      }
    },
    {
      path: '/index/setting',
      name: 'setting',
      component: Setting,
      meta: {
        title: '个人中心',
        isLogin: true,
        index: 6
      }
    },
    {
      path: '/index/test',
      name: 'test',
      // 路由级别的代码拆分
      // 为该路由生成一个单独的chunk (about.[hash].js)
      // 当访问路由时，它是惰性加载的。
      component: () => import(/* webpackChunkName: "about" */ './views/Test.vue'),
      meta: {
        title: '测试',
        isLogin: true
      }
    },
    {
      path: '/**',
      name: 'home',
      component: Home,
      meta: {
        title: '个人主页',
        index: 2
      }
    }
  ]
})
