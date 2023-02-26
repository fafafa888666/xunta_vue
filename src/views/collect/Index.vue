<template>
  <div>
    <!--顶部提示和新增-->
    <van-notice-bar mode="closeable" left-icon="info-o" color="#1989fa" background="#ecf9ff">
      暂无
      <template #right-icon>
        <van-button
          style="position: relative;left: 15px;"
          icon="plus"
          size="small"
          color="linear-gradient(to right, #ABDCFF, #0396FF)"
          to="/index/collect/edit"
        >
          新增收藏网址
        </van-button>
      </template>
    </van-notice-bar>
    <!--一级分类-->
    <van-tabs swipeable animated v-model="activeCategory" @click="categoryOnChange">
      <van-tab v-for="(item,index) in categoryList" :key="index" :title="item.name">
        <!--如果一级分类为空-->
        <div style="margin: 0 20%;font-family: 宋体" v-if="categoryAndCollect === null">
          <b>您暂时没有收藏或记录的网址，请点击上方添加收藏网址哦！</b>
        </div>
        <!--子级分类和收藏-->
        <category-and-collect :categoryAndCollect="categoryAndCollect" ref="categoryAndCollect" v-else/>
      </van-tab>
    </van-tabs>
    <!--账号密码弹出框-->
    <van-popup round closeable v-model="showAccountInfo" position="bottom" :style="{ height: '80%' }">
      <div class="van-ellipsis" style="margin: 5% auto;width: 60%">
        {{ collectOptionsValue.title }}
      </div>
      <div style="margin: auto 15%;font-size: 13px;color: red">
        声明：该网站账号密码由用户自由填写（可只填写账号或只填写密码），<b>账号密码保存后仅作为首页查看网站时显示（如下图）。</b>
        <div style="margin:0px auto;width:68%;">
          <van-image src="http://file.junengw.com/junengw-xunta/20210214/account.jpg"/>
        </div>
        账号密码加密保存后，任何人无法通过任何方式获取！<b>但贵重账号密码仍不建议完全填写，若出现账号密码泄露本站不负任何责任！</b>
      </div>
      <div style="margin: 5% auto;width: 80%">
        <van-field clearable v-model="account.username" label="账号" label-width="20%" placeholder="请填写账号">
        </van-field>
        <van-field
          clearable
          v-model="account.password"
          label="密码"
          label-width="20%"
          placeholder="请填写密码"
          :type="showPassword ? 'text' : 'password'"
          :right-icon="showPassword ? 'eye-o' : 'browsing-history-o'"
          @click-right-icon="showPassword = !showPassword"
        >
        </van-field>
        <div></div>
        <!--账号密码保存按钮-->
        <van-cell>
          <van-button block size="small" color="linear-gradient(to right, #90F7EC, #32CCBC)" @click="updateAccount">加密保存</van-button>
        </van-cell>
      </div>
    </van-popup>
  </div>
</template>

<script>
import CategoryAndCollect from '@/components/collect/CategoryAndCollect'
import { Notify } from 'vant'
export default {
  name: 'Index',
  provide () {
    return {
      accountOptions: this.accountOptions // 账号密码弹出框提供给子主键使用
    }
  },
  components: {
    CategoryAndCollect
  },
  data () {
    return {
      activeCategory: 0, // 选择一级分类值
      categoryList: [{ id: 0, name: '首页', sort: 1 }], // 初始一级分类列表
      categoryAndCollect: null, // 子级分类和收藏列表
      showAccountInfo: false, // 显示账号信息
      account: {}, // 收藏的账号信息
      collectOptionsValue: {}, // 查看账号信息时选中的收藏
      showPassword: false // 显示密码
    }
  },
  async created () {
    await this.init()
  },
  methods: {
    // 初始化
    async init () {
      // 获取一级分类列表
      const categories = (await this.$api.getParentList()).data
      // 不为空则赋值
      if (categories !== null) {
        this.categoryList = await this.categoryList.concat(categories)
      }
      // 如果路由有当前选中一级分类信息就赋值
      if (typeof (this.$route.query.activeParentCategoryId) !== 'undefined') {
        this.activeCategory = await Number(this.$route.query.activeParentCategoryId)
      }
      // 获取子级分类和收藏网址
      await this.categoryOnChange()
    },
    // 点击一级分类时获取下级分类和收藏
    async categoryOnChange () {
      // 点击一级分类时设置路由方便定位收藏信息
      await this.$router.push({ path: '', query: { activeParentCategoryId: this.activeCategory, activeSonCategoryId: this.$route.query.activeSonCategoryId } })
      // 获取子级分类和收藏网址
      this.categoryAndCollect = (await this.$api.getCategorySonListAndCollectList(this.categoryList[this.activeCategory].id)).data
    },
    // 点击账号密码
    async accountOptions (collect) {
      // 选中收藏赋值
      this.collectOptionsValue = collect
      // 显示账号密码弹出框
      this.showAccountInfo = true
      // 隐藏密码
      this.showPassword = false
      // 获取账号信息
      this.account = (await this.$api.getAccountForCollectId(this.collectOptionsValue.id)).data
    },
    // 修改账号信息
    async updateAccount () {
      // 修改
      await this.$api.updateAccount(this.account)
      Notify({ type: 'success', message: '安全保存成功' })
      this.showAccountInfo = false
    }
  }
}
</script>
