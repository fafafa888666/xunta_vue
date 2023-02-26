<template>
  <div>
    <!--轮播图-->
    <van-swipe style="height: 154px;background-color: white" autoplay="3000" vertical>
      <van-swipe-item v-for="(item,index) in slideshowList" :key="index">
        <van-image fit="contain" height="154px" :src="item.img">
          <template v-slot:error>加载失败</template>
        </van-image>
      </van-swipe-item>
    </van-swipe>
    <!--搜索框-->
    <van-search
      v-model="searchContent"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      left-icon=""
    >
      <!--选择搜索方式-->
      <template #label>
        <van-popover v-model="showSearchMode" :actions="searchModeList" @select="setSearchModeValue">
          <template #reference>
            <van-field
              v-model="searchModeValue"
              readonly
              clickable
              name="picker"
              placeholder="本站搜索"
              @click="showSearchMode = true"
              style="width: 90px"
              right-icon="arrow-down"
            />
          </template>
        </van-popover>
      </template>
      <template #action>
        <div @click="onSearch" style="margin: 0 10px">搜索</div>
      </template>
    </van-search>
    <!--父级分类-->
    <van-tree-select
      v-model="categoryActiveIndex"
      :main-active-index="categoryActiveIndex"
      :height="contentHeight"
      :items="categoryList"
      @click-nav="categoryOnChange"
    >
      <template #content>
        <!--如果父级分类为空-->
        <div style="margin: 0 20%;font-family: 宋体" v-if="categoryAndCollect === null">
          <b>您暂时没有收藏或记录的网址，点击下方”网址管理“添加收藏网址哦！需要从浏览器导入书签可以点击“我的设置”导入！</b>
        </div>
        <!--子级分类和收藏-->
        <category-and-collect :categoryAndCollect="categoryAndCollect" ref="categoryAndCollect" v-else/>
      </template>
    </van-tree-select>
    <!--版权信息-->
    <div style="background-color: #f7f8fa;color:gray;font-family:黑体;height: 16px;font-size: 12px">
      <b>Powered By <a href="https://gitee.com/amateur_gang/vant" target="_blank" style="color: dodgerblue"> Vant</a>
        Copyright © 2022 <a href="http://www.92qt.cn/" target="_blank" style="color: dodgerblue"> XunTa</a></b>
    </div>
    <!--首次进入需要设置用户首页
    <van-popup v-model="showDomain" round :close-on-click-overlay="false" close-icon="close" style="width:80%;">
      <div>
        <div style="margin: 2% auto;width: 60%;font-size: 15px">首次登陆需要设置个人主页（之后可在设置中更改）</div>
        <div>
          <van-field
            v-model="activeName"
            name=""
            :label="hostname+'/'"
            label-align="right"
            label-width="50%"
            placeholder="请填写个人主页"
            :rules="[{ required: true, message: '请填写个人主页' }]"
          />
          <div style="font-size: 13px;color: red">设置后您的个人主页为：{{hostname}}/{{activeName}}</div>
        </div>
        <van-button round block type="info" style="margin: 5% auto;width: 80%" @click="showDomain = false">确认</van-button>
      </div>
    </van-popup>-->
  </div>
</template>

<script>
import { Dialog } from 'vant'
import CategoryAndCollect from '@/components/home/CategoryAndCollect'

export default {
  name: 'Home',
  inject: ['reload'], // 刷新
  components: {
    CategoryAndCollect
  },
  data () {
    return {
      categoryActiveIndex: 0, // 选择父级分类，0为首页
      categoryList: [{ id: 0, text: '首页', sort: 0 }], // 父级分类初始
      contentHeight: document.documentElement.clientHeight - 320, // 定义分类高度，320为其他信息占的屏幕
      showSearchMode: false, // 显示搜索方式值
      searchModeValue: '本站搜索', // 搜索方式值
      searchModeList: [{ text: '本站搜索' }, { text: '百度搜索' }, { text: '谷歌搜索' }, { text: '必应搜索' }, { text: '神马搜索' }, { text: '360搜索' }, { text: '搜狗搜索' }], // 搜索方式列表
      searchContent: '', // 搜索内容
      categoryAndCollect: null, // 二级分类和收藏
      slideshowList: [] // 幻灯片
    }
  },
  async created () {
    await this.init()
  },
  methods: {
    async init () {
      // 设置当前页路径
      const path = this.$route.path
      // 获取轮播图
      this.slideshowList = (await this.$api.getSlideshow()).data
      // 通过域获取一级分类
      const data = (await this.$api.getCategoryParentListForDomain(path)).data
      // 当用户访问的不是自己的主页时接口会返回data=false
      if (data === false) {
        Dialog.confirm({
          title: '提示',
          message: '已登录本站的情况下访问Ta主页将会安全退出登录，确定咩？',
          cancelButtonText: '返回我的主页',
          confirmButtonText: '确定访问'
        })
          .then(() => {
            // 点击确定，清空登录信息，刷新
            localStorage.removeItem('token')
            location.reload()
          })
          .catch(() => {
            // 点击返回主页，返回自己主页
            this.$router.push(this.$parent.$refs.header.userDomain)
          })
        return false
      }
      // 将获取到的一级分类放入分类列表
      if (data !== null) {
        this.categoryList = this.categoryList.concat(data)
      }
      // 获取子级分类和收藏网址
      this.categoryAndCollect = (await this.$api.getCategorySonListAndCollectListForDomain(0, path)).data
    },
    // 点击一级分类时获取下级分类和收藏
    async categoryOnChange (index) {
      this.categoryActiveIndex = index
      // 获取子级分类和收藏网址
      this.categoryAndCollect = (await this.$api.getCategorySonListAndCollectListForDomain(this.categoryList[index].id, this.$route.path)).data
    },
    // 点击搜索按钮
    async onSearch () {
      switch (this.searchModeValue) {
        case '本站搜索':
          this.categoryActiveIndex = -1
          // 本站搜索
          this.categoryAndCollect = (await this.$api.getCategoryAndCollect(this.searchContent, this.$route.path)).data
          break
        case '百度搜索':
          window.open('https://www.baidu.com/s?wd=' + this.searchContent + '&cl=3&ie=utf-8')
          break
        case '谷歌搜索':
          window.open('https://www.google.com/search?q=' + this.searchContent)
          break
        case '必应搜索':
          window.open('https://www.bing.com/search?q=' + this.searchContent + '&ie=utf-8')
          break
        case '神马搜索':
          window.open('https://m.sm.cn/s?q=' + this.searchContent + '&ie=utf-8')
          break
        case '360搜索':
          window.open('https://www.so.com/s?q=' + this.searchContent + '&ie=utf-8')
          break
        case '搜狗搜索':
          window.open('https://www.sogou.com/web?query=' + this.searchContent + '&ie=utf-8')
          break
      }
    },
    // 点击搜索方式时
    setSearchModeValue (action) {
      this.searchModeValue = action.text
    }
  }
}
</script>
