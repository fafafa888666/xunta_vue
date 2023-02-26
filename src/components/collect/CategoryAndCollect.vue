<template>
  <div>
    <!--分类信息-->
    <van-collapse
      accordion
      v-model="activeSonCategoryId"
      v-for="(item,index) in categoryAndCollect.categoryList"
      :key="index"
      @change="switchPanel"
    >
      <!--子级分类和收藏信息-->
      <van-collapse-item :title="item.name" :name="item.id">
        <category-and-collect :categoryAndCollect="sonCategoryAndCollect" ref="categoryAndCollect"/>
      </van-collapse-item>
    </van-collapse>
    <!--收藏网址信息-->
    <van-cell center v-for="(item,index) in categoryAndCollect.collectList" :key="index">
      <!--logo-->
      <template #icon>
        <van-image
          round
          width="2rem"
          height="2rem"
          :src="item.logo"
        />
      </template>
      <!--信息-->
      <template>
        <div style="float: left;width: 57%;margin: 5% 3% 0 5%;">
          <div class="van-multi-ellipsis--l2" style="font-size: 13px;line-height: 15px;">
            {{ item.title }}
          </div>
          <div class="van-multi-ellipsis--l3" style="font-size: 10px;line-height: 14px;margin-top: 5px;color: gray">
            {{ item.introduce }}
          </div>
          <div class="van-multi-ellipsis--l2" style="font-size: 12px;line-height: 12px;margin-top: 5px;color: cornflowerblue">
            {{ item.url }}
          </div>
          <van-cell center title="是否首页显示">
            <template #right-icon>
              <van-switch v-model="item.home !== 0" size="18" @click="updateCollectHome(index)" />
            </template>
          </van-cell>
        </div>
        <!--操作按钮-->
        <div style="float: right;width: 35%;">
          <div style="float: right">
            <div align="center" style="width: 105px">
              <van-icon name="ascending" size="25" style="margin-right: 15px" @click="forward(index)"/>
              <van-icon name="descending" size="25" style="margin-right: 15px" @click="backwards(index)" />
              <van-icon name="delete-o" class="delete" size="25" @click="remove(index)" />
            </div>
          </div>
          <br/><br/>
          <div>
            <van-button type="danger" block round plain size="small" icon="edit" :to="'/index/collect/edit?id=' + item.id">编辑信息</van-button>
            <van-button
              type="primary"
              block
              round
              plain
              size="small"
              icon="points"
              style="margin-top: 10%"
              @click="accountOptions(item)">
              账号密码
            </van-button>
          </div>
          <br/>
        </div>
      </template>
    </van-cell>
  </div>
</template>

<script>
import CategoryAndCollect from '@/components/collect/CategoryAndCollect'
import { Dialog, Notify } from 'vant'
export default {
  name: 'CategoryAndCollect',
  props: ['categoryAndCollect'], // 第一次调用时的分类和收藏数据
  inject: ['accountOptions'], // 账号信息弹窗操作信息
  components: {
    CategoryAndCollect // 无限子级
  },
  data () {
    return {
      activeSonCategoryId: 0, // 选中子级折叠面板
      sonCategoryAndCollect: {} // 调用本身时的分类和收藏数据
    }
  },
  async created () {
    // 如果路由里面有选中子级折叠面板则查出响应数据（只能查一层子级）
    if (typeof (this.$route.query.activeSonCategoryId) !== 'undefined') {
      // 赋值
      this.activeSonCategoryId = await Number(this.$route.query.activeSonCategoryId)
      // 查出子级的子级和收藏信息
      this.sonCategoryAndCollect = (await this.$api.getCategorySonListAndCollectList(this.activeSonCategoryId)).data
    }
  },
  methods: {
    // 点击子级分类时
    async switchPanel (activeSonCategoryId) {
      // 清空原来的子级信息
      this.sonCategoryAndCollect = {}
      // 设置路由方便后续跳转
      await this.$router.push({ path: '', query: { activeParentCategoryId: this.$route.query.activeParentCategoryId, activeSonCategoryId: activeSonCategoryId } })
      // activeSonCategoryId为选中的分类ID
      if (activeSonCategoryId !== '') {
        // 获取子类的子类和收藏信息
        const data = (await this.$api.getCategorySonListAndCollectList(activeSonCategoryId)).data
        // 如果子级内没数据则不赋值
        this.sonCategoryAndCollect = data !== null ? data : []
      }
    },
    // 点击是否在首页显示
    async updateCollectHome (index) {
      // 获取到home当前值
      let home = this.categoryAndCollect.collectList[index].home
      // 更改状态 home=0不显示，home=1显示（这里是取相反值的意思）
      home = home === 0 ? 1 : 0
      // 发起请求
      await this.$api.updateCollectHome(this.categoryAndCollect.collectList[index].id, home)
      // 更改页面状态
      this.categoryAndCollect.collectList[index].home = home
      // 如果当前一级分类在首页的话，home=0时不显示该收藏
      if (home === 0 && this.$route.query.activeParentCategoryId === '0') {
        // 页面内删除收藏信息
        this.categoryAndCollect.collectList.splice(index, 1)
      }
    },
    // 点击删除收藏按钮时
    async remove (index) {
      const that = this
      // 删除，先提示确定吗再删除。
      await Dialog.confirm({
        message: '确定删除[' + this.categoryAndCollect.collectList[index].url + ']所有相关信息吗？'
      })
        .then(async () => {
          await that.$api.removeCollect(this.categoryAndCollect.collectList[index].id)
          this.categoryAndCollect.collectList.splice(index, 1)
        })
        .catch(() => {
          // on cancel
        })
    },
    // 向上排序
    async forward (index) {
      // 如果是第一个，无法向上排序
      if (index === 0) {
        Notify({ type: 'warning', message: '排序已经是第一啦' })
        return null
      }
      await this.sort(index, index - 1)
    },
    // 向下排序
    async backwards (index) {
      // 如果是最后一个，无法向下排序
      if (index === this.categoryAndCollect.collectList.length - 1) {
        Notify({ type: 'warning', message: '排序已经到最后啦' })
        return null
      }
      await this.sort(index, index + 1)
    },
    // 交换数据位置
    async sort (index1, index2) {
      // 设置提交数据(将排序置换 { ...} 赋值为值传递)
      let collect1 = { ...this.categoryAndCollect.collectList[index1] }
      let collect2 = { ...this.categoryAndCollect.collectList[index2] }
      collect1.sort = collect2.sort
      collect2.sort = this.categoryAndCollect.collectList[index1].sort
      const sortData = [
        { id: collect1.id, sort: collect1.sort },
        { id: collect2.id, sort: collect2.sort }
      ]
      // 发起请求
      await this.$api.sortCollect(sortData)
      // 替换数据内容
      // 替换数据内容
      this.$set(this.categoryAndCollect.collectList, index1, collect2)
      this.$set(this.categoryAndCollect.collectList, index2, collect1)
    }
  }
}
</script>

<style scoped>

</style>
