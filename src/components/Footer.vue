<template>
  <div v-if="this.$route.path !== '/index/pc'">
    <van-tabbar placeholder v-model="active" v-if="showUserFooter">
      <!--页脚-->
      <van-tabbar-item name="home" icon="home-o" :to="userDomain">个人主页</van-tabbar-item>
      <van-tabbar-item name="collect" icon="label-o" to="/index/collect">网址管理</van-tabbar-item>
      <van-tabbar-item name="category" icon="cluster-o" to="/index/category">分类管理</van-tabbar-item>
      <van-tabbar-item name="setting" icon="setting-o" to="/index/setting">我的设置</van-tabbar-item>
    </van-tabbar>
    <van-tabbar placeholder v-else>
      <!--页脚-->
      <van-tabbar-item name="slideShow" icon="fire-o" @click="hint">首页轮播图(广告)投放</van-tabbar-item>
      <van-tabbar-item name="flow" icon="chart-trending-o" @click="hint">查看本站流量详情</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { Notify } from 'vant'

export default {
  name: 'Footer',
  watch: {
    $route (to, from) {
      this.init()
    }
  },
  data () {
    return {
      active: '1', // 默认选中
      showUserFooter: false, // 是否显示首页页脚
      userDomain: '' // 用户域（由页头赋值）
    }
  },
  async created () {
    await this.init()
  },
  methods: {
    // 设置页尾
    async init () {
      // 如果登录并且不在首页则显示已登录的页脚
      this.showUserFooter = localStorage['token'] && this.$route.path !== '/'
      // 选中 = 路由的name
      this.active = this.$route.name
    },
    hint () {
      Notify({ type: 'warning', message: '抱歉，此功能下个版本上线' })
    }
  }
}
</script>

<style scoped>

</style>
