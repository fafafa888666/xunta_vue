<template>
  <div>
    <!--子集分类-->
    <van-collapse
      accordion
      v-model="activeName"
      v-for="(item,index) in categoryAndCollect.categoryList"
      :key="index"
      @change="switchPanel"
    >
      <van-collapse-item :border="false" :title="item.name" :name="item.id">
        <category-and-collect :categoryAndCollect="sonCategoryAndCollect" ref="categoryAndCollect"/>
      </van-collapse-item>
    </van-collapse>
    <!--网址-->
    <van-cell
      center
      v-for="(item,index) in categoryAndCollect.collectList"
      :key="index"
      @click="collectOptions(index)"
    >
      <template #icon>
        <van-badge color="#1989fa" :content="item.visit" max="99">
        <van-image
          round
          width="1.5rem"
          height="1.5rem"
          error-icon="photo-fail"
          fit="contain"
          :src="item.logo"
        />
        </van-badge>
      </template>
      <template>
        <div style="float: left;width: 60%;margin-left: 5%">
          <div class="van-multi-ellipsis--l2" style="font-size: 13px;line-height: 15px;">
            {{ item.title }}
          </div>
          <div class="van-multi-ellipsis--l3" style="font-size: 10px;line-height: 14px;margin-top: 5px;color: gray">
            {{ item.introduce }}
          </div>
        </div>
        <div style="float: right;width: 30%;">
          <!-- 最多显示两行 -->
          <div class="van-multi-ellipsis--l2" style="font-size: 12px;line-height: 12px;margin: 10% 0">
            {{ item.url }}
          </div>
        </div>
      </template>
    </van-cell>
    <!--点击网址后的提示框-->
    <van-popup v-model="showCollectInfo" round closeable close-icon="close" style="width:70%;">
      <div>
        <div class="van-ellipsis" style="margin: 6% auto;width: 60%">{{ collectOptionsValue.title }}</div>
        <div v-if="isLogin && this.$route.path !== '/'">
          <van-field
            readonly
            v-model="account.username"
            label="账号"
            label-width="20%"
            placeholder="未填写"
            right-icon="description"
            @click-right-icon="onCopy(account.username)"/>
          <van-field
            readonly
            :type="showPassword ? 'text' : 'password'"
            v-model="account.password"
            label="密码"
            label-width="20%"
            placeholder="未填写"
            :right-icon="showPassword ? 'description' : 'browsing-history-o'"
            @click-right-icon="showPassword ? onCopy(account.password) : showPassword = !showPassword"/>
          <div></div>
        </div>
        <van-button round plain  type="default" style="margin: 10px 5px;" @click="onCopy(collectOptionsValue.url)">复制网址</van-button>
        <van-button round plain  type="info" style="margin: 10px 5px;" @click="openUrl">进入网站</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import CategoryAndCollect from '@/components/home/CategoryAndCollect'
import { Notify } from 'vant'
export default {
  name: 'CategoryAndCollect',
  props: ['categoryAndCollect'], // 分类和收藏数据
  components: {
    CategoryAndCollect
  },
  data () {
    return {
      activeName: '', // 默认打开哪个分类
      showCollectInfo: false, // 网址详情
      collectOptionsValue: {}, // 选中的收藏的信息
      sonCategoryAndCollect: {}, // 打开分类时的子级分类和收藏信息
      isLogin: localStorage['token'], // 是否登录
      account: {}, // 收藏的账号信息
      showPassword: false // 密码显示和隐藏
    }
  },
  methods: {
    // 点击时网址
    async collectOptions (index) {
      // 选中收藏先清空再赋值
      this.collectOptionsValue = null
      this.collectOptionsValue = this.categoryAndCollect.collectList[index]
      this.showCollectInfo = true
      this.showPassword = false
      if (this.isLogin && this.$route.path !== '/') {
        // 获取账号信息
        this.account = (await this.$api.getAccountForCollectId(this.collectOptionsValue.id)).data
      }
    },
    // 点击子分类时
    async switchPanel (activeNames) {
      if (activeNames !== '') {
        // 获取子类的子类和收藏信息
        const data = (await this.$api.getCategorySonListAndCollectListForDomain(activeNames, this.$route.path)).data
        this.sonCategoryAndCollect = data !== null ? data : []
      }
    },
    // 复制按钮
    onCopy (value) {
      let container = this.$refs.container
      this.$copyText(value, container)
      Notify({ type: 'success', message: '复制成功', duration: 2000 })
    },
    // 打开网址按钮
    openUrl () {
      // 增加一次访问量
      this.$api.addVisit(this.collectOptionsValue.id)
      ++this.collectOptionsValue.visit
      window.open(this.collectOptionsValue.url)
    }
  }
}
</script>

<style scoped>

</style>
