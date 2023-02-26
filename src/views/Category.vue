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
          @click="categoryEdit({categoryId:0,name:''})"
        >
          新增分类
        </van-button>
      </template>
    </van-notice-bar>
    <!--分类主体-->
    <category-item :categoryTreeList="categoryTreeList" />
    <!--编辑分类弹出框-->
    <van-popup round closeable v-model="showCategoryEdit" position="top" :style="{ height: '35%' }">
      <div class="van-ellipsis" style="margin: 5% auto;width: 60%">
        {{ category.name }}
      </div>
      <div style="margin: 5% auto;width: 90%">
        <van-form @submit="onSubmit">
          <!--分类选择-->
          <van-field
            readonly
            clickable
            v-model="categoryName"
            name="area"
            label="所属分类"
            placeholder="点击选择（为空默认首页显示）"
            @click="showCategory = true"
          />
          <!--分类选择弹出框-->
          <van-popup v-model="showCategory" position="bottom">
            <van-picker show-toolbar title="选择分类" :columns="categoryList" @cancel="showCategory=false" @confirm="setCategory" />
          </van-popup>
          <!--分类名称-->
          <van-field
            center
            clearable
            v-model="category.name"
            label="分类名称"
            placeholder="请输入分类名称"
            :rules="[{ required: true , message: '请填写分类名称' }]"
          />
          <!--按钮-->
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit">
              确定<span v-if="typeof (this.category.id) !== 'undefined'">编辑</span><span v-else>新增</span>
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script>
import CategoryItem from '@/components/category/CategoryItem'
import { Dialog, Notify } from 'vant'

export default {
  name: 'Category',
  provide () {
    return {
      categoryEdit: this.categoryEdit, // 编辑分类（方法）
      remove: this.remove // 删除分类（方法）
    }
  },
  components: {
    CategoryItem
  },
  data () {
    return {
      showCategoryEdit: false, // 显示编辑分类
      showCategory: false, // 显示选择分类列表
      categoryTreeList: null, // 分类树形列表
      category: {}, // 选中分类（用于操作分类）
      categoryList: [{ values: [{ id: 0, text: '首页' }], defaultIndex: 0 }], // 选择分类列表，第一个为首页
      categoryName: '' // 选中分类名称
    }
  },
  async created () {
    this.categoryTreeList = (await this.$api.getCategoryTreeList()).data // 获取到树形分类列表
  },
  methods: {
    // 点击编辑分类时
    async categoryEdit (category) {
      this.showCategoryEdit = true
      // 赋值当前选中分类
      this.category = category
      this.categoryList = [{ values: [{ id: 0, text: '首页' }], defaultIndex: 0 }]
      // 获取分类列表（如果是一级分类选中分类为首页即0）
      const categoryData = (await this.$api.getCategoryDropDownList(category.rank === 'parent' ? 0 : category.categoryId)).data
      // 设置分类列表格式
      this.categoryList[0].values = this.categoryList[0].values.concat(categoryData.list)
      // 设置当前选中分类
      this.categoryList[0].defaultIndex = categoryData.defaultIndex
      // 设置选中分类名
      this.categoryName = this.categoryList[0].values[categoryData.defaultIndex].text
    },
    // 点击确定选中分类时
    setCategory (value) {
      // 隐藏分类选择列表
      this.showCategory = false
      // 设置选中分类名
      this.categoryName = value[0].text
      // 设置选中分类id
      this.category.categoryId = value[0].id
    },
    // 点击确认修改/增加分类时
    async onSubmit () {
      // 如果设置首页那将ID清0方便后端判断
      if (this.categoryName === '首页') {
        this.category.categoryId = 0
      }
      // 如果有id是修改
      if (typeof (this.category.id) !== 'undefined') {
        // 修改
        await this.$api.updateCategory(this.category)
        await Notify({ type: 'success', message: '编辑成功' })
      } else { // 如果没有id是增加
        // 增加
        await this.$api.insertCategory(this.category)
        Notify({ type: 'success', message: '新增成功' })
      }
      // 刷新分类
      this.categoryTreeList = (await this.$api.getCategoryTreeList()).data
      this.showCategoryEdit = false
    },
    // 点击删除分类时
    async remove (category) {
      // 删除，先提示确定吗再删除。
      await Dialog.confirm({
        message: '确定删除[' + category.name + ']分类与其下所有子级分类吗？'
      })
        .then(async () => {
          await Dialog.confirm({
            message: '其下所有收藏网址是删除还是移至首页？',
            confirmButtonText: '删除网址',
            cancelButtonText: '移至首页'
          })
            .then(async () => {
              // 删除分类，所有收藏删除
              await this.removeApi(category.id, true)
            })
            .catch(async () => {
              // 删除分类，所有收藏移动到首页
              await this.removeApi(category.id, false)
            })
        })
        .catch(() => {
          // on cancel
        })
    },
    // 删除时的选择
    async removeApi (categoryId, flag) {
      // false=其下收藏放入首页，反之全部删除
      await this.$api.deleteCategory(categoryId, flag)
      Notify({ type: 'success', message: '删除成功' })
      this.categoryTreeList = (await this.$api.getCategoryTreeList()).data
    }
  }
}
</script>
