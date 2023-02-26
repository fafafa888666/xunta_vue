<template>
  <div id="app" >
    <!--页头-->
    <app-header ref="header"/>
    <!--transition：路由切换效果-->
    <transition :name="transitionName">
      <!--isRouterAlive：动态刷新-->
      <router-view v-if="isRouterAlive" :style="'width: '+screenWidth"/>
    </transition>
    <!--页尾-->
    <app-footer ref="footer"/>
  </div>
</template>

<script>
import AppHeader from '@/components/Header'
import AppFooter from '@/components/Footer'
export default {
  provide () {
    return {
      reload: this.reload // 刷新
    }
  },
  components: {
    AppHeader,
    AppFooter
  },
  data () {
    return {
      isRouterAlive: true, // 刷新
      transitionName: '', // 路由切换效果
      screenWidth: document.body.clientWidth + 'px' // 设置屏幕宽度
    }
  },
  watch: { // 使用watch 监听$router的变化
    $route (to, from) {
      // 如果to索引大于from索引,判断为前进状态,反之则为后退状态
      if (to.meta.index > from.meta.index) {
        // 设置动画名称
        this.transitionName = 'slide-left'
      } else {
        // 设置动画名称
        this.transitionName = 'slide-right'
      }
      // 路由变化且渲染完成后执行取消上个路由的请求
      this.$nextTick(function () {
      })
    }
  },
  created () {
    // 判断当前访问是否是电脑端 电脑端：flag === null，手机端：flag !== null
    const flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
    // 如果是电脑端且屏幕宽度大于400px且当前路由不等于PCHome就跳转到PCHome页面
    if (flag === null && document.body.clientWidth > 400 && this.$route.name !== 'pcHome') {
      this.$router.push({ name: 'pcHome', query: { path: this.$route.path } })
    } else if (flag !== null) {
      // 如果是手机端访问且是pcHome页面则跳转实际路由页面
      if (this.$route.name === 'pcHome') {
        this.$router.push({ path: this.$route.query.path ? this.$route.query.path : '/' })
      }
    }
  },
  methods: {
    // 刷新
    reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="scss">
// 路由切换动画
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  will-change: transition;
  transition: all 500ms;
  position: absolute;
}
.slide-right-enter {
  opacity: 0;
  transform: translate3d(0, -100%, 0);
}
.slide-right-leave-active {
  opacity: 0;
  transform: translate3d(0, 100%, 0);
}
.slide-left-enter {
  opacity: 0;
  transform: translate3d(0, 100%, 0);
}
.slide-left-leave-active {
  opacity: 0;
  transform: translate3d(0, -100%, 0);
}
// vue初始化样式
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
