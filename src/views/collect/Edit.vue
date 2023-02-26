<template>
  <div>
    <van-form @submit="onSubmit">
      <!--分类选择-->
      <van-field
        readonly
        clickable
        v-model="categoryName"
        name="categoryId"
        label="所属分类"
        placeholder="选择分类"
        @click="showCategory = true"
      />
      <!--分类选择弹出框-->
      <van-popup v-model="showCategory" position="bottom">
        <van-picker show-toolbar title="选择分类" :columns="categoryList" @cancel="showCategory = false" @confirm="setCategory" />
      </van-popup>
      <!--网站地址-->
      <van-field
        required
        center
        label="网站地址"
      >
        <!--协议选择和网址地址-->
        <template #input>
          <!--协议选择-->
          <van-popover v-model="showProtocol" :actions="protocolList" @select="setProtocol">
            <template #reference>
              <van-field
                center
                clearable
                v-model="collect.url"
                name="url"
                placeholder="请输入网站地址"
                :rules="[{ required: true , message: '请填写网站地址' }]"
                @click-left-icon="showProtocol = true"
                @blur="checkUrl"
                style="margin-left: -15px;width: 110%"
              >
                <template #left-icon>
                  <div>{{ protocolValue }}</div>
                </template>
              </van-field>
            </template>
          </van-popover>
        </template>
      </van-field>
      <!--爬取信息-->
      <van-cell>
        <van-button plain round block size="small" type="primary" native-type="button" @click="getUrlInfo">点我爬取信息以下信息（可能爬不到）</van-button>
      </van-cell>
      <!--网址标题-->
      <van-field
        center
        clearable
        v-model="collect.title"
        name="title"
        label="网站标题"
        placeholder="请输入网站标题"
      />
      <!--网站logo-->
      <van-cell value="内容">
        网站LOGO：<van-uploader v-model="fileList" :after-read="afterRead" max-count="1" style="float: right" />
      </van-cell>
      <!--网站介绍-->
      <van-field
        autosize
        clearable
        v-model="collect.introduce"
        rows="2"
        name="introduce"
        label="网站介绍"
        type="textarea"
        maxlength="300"
        placeholder="请输入网站介绍"
        show-word-limit
      />
      <!--是否首页显示-->
      <van-cell center value="是否首页显示">
        <template #right-icon>
          <van-switch v-model="collect.home" size="24"/>
        </template>
      </van-cell>
      <!--操作按钮-->
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">确定提交</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { Notify } from 'vant'

export default {
  name: 'Edit',
  components: {
  },
  data () {
    return {
      collect: {}, // 收藏信息
      showCategory: false, // 显示选择分类
      categoryName: '', // 分类名
      categoryList: [{ values: [{ id: 0, text: '首页' }], defaultIndex: 0 }], // 分类列表，第一个为首页
      fileList: [],
      showProtocol: false, // 显示协议
      protocolValue: 'https://', // 协议值
      protocolList: [{ text: 'http://' }, { text: 'https://' }] // 协议列表
    }
  },
  async created () {
    await this.init()
  },
  methods: {
    // 初始化
    async init () {
      // 获取当前修改ID
      const collectId = this.$route.query.id
      // 有id是编辑，没有id是新增
      if (typeof (collectId) !== 'undefined') {
        // 有收藏ID是修改
        this.collect = (await this.$api.getCollect(collectId)).data
        // url提取协议
        this.checkUrl()
        // logo为空则不显示
        if (this.collect.logo !== null && this.collect.logo !== '') {
          this.fileList = [{ url: this.collect.logo, isImage: true }]
        }
        // home=0为首页不显示
        this.collect.home = this.collect.home !== 0
      } else {
        // 没收藏ID是增加
        // 设置基础信息
        this.collect = { categoryId: 0, home: true, introduce: '', logo: '', title: '', url: '' }
        // 修改title和页头标题
        this.$parent.$refs.header.title = document.title = '新增网址'
      }
      // 获取分类列表
      const categoryData = (await this.$api.getCategoryDropDownList(this.collect.categoryId)).data
      // 设置分类列表格式
      this.categoryList[0].values = this.categoryList[0].values.concat(categoryData.list)
      // 设置当前选中分类
      this.categoryList[0].defaultIndex = categoryData.defaultIndex
      // 设置选中分类名
      this.categoryName = this.categoryList[0].values[categoryData.defaultIndex].text
    },
    // 点击协议时
    setProtocol (action) {
      // 设置协议值
      this.protocolValue = action.text
    },
    // 点击确定选中分类时
    setCategory (value) {
      // 隐藏分类选择列表
      this.showCategory = false
      // 设置选中分类名
      this.categoryName = value[0].text
      // 设置选中分类id
      this.collect.categoryId = value[0].id
    },
    // 当url框失焦时提取url中的协议
    checkUrl () {
      // 如果是http://
      if (this.collect.url.split('http://').length > 1) {
        this.protocolValue = 'http://'
        // 如果第一个数组不为空代表不是最前面
        if (this.collect.url.split(this.protocolValue)[0] === '') {
          this.collect.url = this.collect.url.split(this.protocolValue)[1]
        }
      } else if (this.collect.url.split('https://').length > 1) { // 如果是https://
        this.protocolValue = 'https://'
        // 如果第一个数组不为空代表不是最前面
        if (this.collect.url.split(this.protocolValue)[0] === '') {
          this.collect.url = this.collect.url.split(this.protocolValue)[1]
        }
      }
    },
    // 点击提交按钮
    async onSubmit (value) {
      // 设置url为协议+url
      this.collect.url = this.protocolValue + this.collect.url
      // 设置home
      this.collect.home = this.collect.home ? 1 : 0
      // 如果未选择分类，则必须在首页显示
      if (this.collect.categoryId === 0) {
        this.collect.home = 1
      }
      // 如果有collectId是修改
      if (typeof (this.collect.id) !== 'undefined') {
        // 修改
        await this.$api.updateCollect(this.collect)
        await Notify({ type: 'success', message: '编辑成功' })
        await this.$router.go(-1)
      } else { // 如果没有collectId是增加
        // 增加
        await this.$api.insertCollect(this.collect)
        Notify({ type: 'success', message: '新增成功' })
        await this.$router.go(-1)
      }
    },
    // 点击爬取网站信息时
    async getUrlInfo () {
      // 合成完整url
      const url = this.protocolValue + this.collect.url
      // 爬取网站logo，title和关键词
      const data = (await this.$api.getUrlInfo({ url: url })).data
      this.collect.logo = data.logo
      // 网站logo放入文件列表显示
      this.fileList = [{ url: this.collect.logo, isImage: true }]
      this.collect.title = data.title
      this.collect.introduce = data.description
    },
    // 上传图片时
    async afterRead (file) {
      file.status = 'uploading'
      file.message = '上传中...'
      let formData = new FormData()
      formData.append('fileList', file.file)
      const data = (await this.$api.uploadCollectLogo(formData)).data
      if (data.failList.length > 0) {
        file.status = 'failed'
        file.message = '上传失败'
        return null
      }
      this.collect.logo = data.successList[0].url
      // 网站logo放入文件列表显示
      this.fileList = [{ url: this.collect.logo, isImage: true }]
    }
  }
}
</script>
