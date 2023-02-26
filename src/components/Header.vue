<template>
  <div v-if="this.$route.path !== '/index/pc'">
    <!--页头-->
    <van-nav-bar fixed placeholder :title="title">
      <template #left>
        <van-icon name="arrow-left" size="20" color="black" v-if="showBack" @click="$router.go(-1)"/>
        <a href="javascript:" @click="share" style="color: black" v-else>分享</a>
        <van-share-sheet v-model="showShare" :options="shareOptions" @select="onShare"/>
      </template>
      <template #right>
        <van-icon name="wap-home" size="20" color="black" @click="$router.push({ path:'/'})" v-if="showHome"/>
        <van-icon name="manager" size="20" color="black" @click="$router.push({ path: userDomain || '/index/login'})" v-else/>
      </template>
    </van-nav-bar>
  </div>
</template>
<script>
import { Notify } from 'vant'

export default {
  name: 'Header',
  inject: ['reload'],
  watch: { // 使用watch 监听$router的变化
    $route (to, from) {
      // 如果是从系统首页跳转个人主页或者个人主页跳转系统首页需要刷新
      if ((from.name === 'index' || from.name === 'home') && (to.name === 'home' || to.name === 'index')) {
        this.reload()
      }
      // 路由变化时设置页头title
      this.title = to.meta.title
      this.init()
    }
  },
  data () {
    return {
      title: document.title, // 页面标题
      showShare: false, // 分享界面
      showBack: false, // 返回按钮
      showHome: false, // home按钮
      // 分享信息
      shareOptions: [
        [
          { name: '微信（暂未开放）', icon: 'wechat' },
          { name: '微博（暂未开放）', icon: 'weibo' },
          { name: 'QQ（暂未开放）', icon: 'qq' }
        ],
        [
          { name: '复制链接', icon: 'link' },
          { name: '二维码（暂未开放）', icon: 'qrcode' }
        ]
      ],
      userDomain: null // 用户域
    }
  },
  async mounted () {
    await this.init()
  },
  methods: {
    // 弹出分享框
    share () {
      this.showShare = true
    },
    // 确定分享
    onShare (option, number) {
      switch (option.name) {
        case '复制链接':
          const url = window.location.href
          let container = this.$refs.container
          this.$copyText(url, container)
          Notify({ type: 'success', message: '复制' + url + '成功，去分享吧' })
          break
      }
    },
    // 设置页头
    async init () {
      // 如果有用户信息就赋值用户
      if (localStorage['token'] && this.userDomain === null) {
        // 赋值页头和页脚的Domain
        this.$parent.$refs.footer.userDomain = this.userDomain = '/' + (await this.$api.getUserInfo()).data.domain
      } else if (!localStorage['token']) { // 没登录清空userDomain
        this.$parent.$refs.footer.userDomain = this.userDomain = null
      }
      if (this.$route.path === '/') {
        // 如果是首页
        this.showBack = false
        this.showHome = false
        document.title = this.title = (await this.$api.getWebInfo()).data.title
      } else if (this.$route.path.split('/').length === 2) {
        // 如果是个人主页
        this.showBack = false
        this.showHome = true
        // 获取个人主页标题
        document.title = this.title = (await this.$api.getUserTitle(this.$route.path)).data
      } else {
        // 其他页面
        this.showBack = true
        this.showHome = true
      }
    }
  }
}
</script>

<style scoped>
</style>
