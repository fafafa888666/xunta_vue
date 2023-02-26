<template>
  <!--pchome iframe-->
  <div align="center" style="margin-top: 25px">
    <iframe :src="path"
            :height="contentHeight"
            width="400px"
            frameborder="1"
            scrolling="yes"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'PCHome',
  components: {
  },
  data () {
    return {
      // 屏幕宽度
      contentHeight: document.documentElement.clientHeight - 50 + 'px',
      // 真实路由
      path: this.$route.query.path ? this.$route.query.path : '/'
    }
  },
  async created () {
  },
  methods: {
  }
}
</script>
