<template>
  <div>
    <div v-for="(item,index) in categoryTreeList" :key="index">
      <!--有子级的分类列表-->
      <van-collapse
        accordion
        v-model="activeCategory"
        v-if="item.categoryList !== null">
        <van-collapse-item center :name="index">
          <template #icon>
            {{ item.name }}
          </template>
          <template #value>
            <div style="" align="right">
              <!--按钮-->
              <van-button plain size="mini" icon="ascending" type="primary" @click="forward(index)"/>
              &nbsp;|&nbsp;
              <van-button plain size="mini" icon="descending" type="primary" @click="backwards(index)"/>
              &nbsp;|&nbsp;
              <van-button plain size="mini" icon="edit" type="primary" color="#1989fa" @click="categoryEdit(item)"/>
              &nbsp;|&nbsp;
              <van-button plain size="mini" icon="delete-o" type="primary" color="red" @click="remove(item)"/>
            </div>
          </template>
          <!--无限下级树-->
          <category-item :categoryTreeList="item.categoryList" />
        </van-collapse-item>
      </van-collapse>
      <!--没有子级的分类列表-->
      <van-cell
        center
        :value="item.name"
        v-if="item.categoryList === null">
        <template #right-icon>
          <!--按钮-->
          <van-button plain size="mini" icon="ascending" type="primary" @click="forward(index)"/>
          &nbsp;|&nbsp;
          <van-button plain size="mini" icon="descending" type="primary" @click="backwards(index)"/>
          &nbsp;|&nbsp;
          <van-button plain size="mini" icon="edit" type="primary" color="#1989fa" @click="categoryEdit(item)"/>
          &nbsp;|&nbsp;
          <van-button plain size="mini" icon="delete-o" type="primary" color="red" @click="remove(item)"/>
        </template>
      </van-cell>
      <div v-if="item.categoryList === null"></div>
    </div>

  </div>
</template>

<script>
import CategoryItem from '@/components/category/CategoryItem'
import { Notify } from 'vant'
export default {
  name: 'CategoryItem',
  props: ['categoryTreeList'], // 父级分类
  inject: ['categoryEdit', 'remove'], // 编辑和删除
  components: {
    CategoryItem
  },
  data () {
    return {
      activeCategory: null // 选中分类下标
    }
  },
  async created () {
  },
  methods: {
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
      if (index === this.categoryTreeList.length - 1) {
        Notify({ type: 'warning', message: '排序已经到最后啦' })
        return null
      }
      await this.sort(index, index + 1)
    },
    // 交换数据位置
    async sort (index1, index2) {
      // 设置提交数据(将排序置换 { ...} 赋值为值传递)
      let category1 = { ...this.categoryTreeList[index1] }
      let category2 = { ...this.categoryTreeList[index2] }
      category1.sort = category2.sort
      category2.sort = this.categoryTreeList[index1].sort
      const sortData = [
        { id: category1.id, sort: category1.sort },
        { id: category2.id, sort: category2.sort }
      ]
      // 发起请求
      await this.$api.sortCategory(sortData)
      // 替换数据内容
      this.$set(this.categoryTreeList, index1, category2)
      this.$set(this.categoryTreeList, index2, category1)
    }
  }
}
</script>

<style scoped>
.aaaaa{
  width: 1000px;
}
</style>
