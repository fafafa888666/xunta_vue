<template>
  <div>
    <!--用户名-->
    <van-cell title="" is-link :value="user.username" @click="editUserInfo('username')">
      <template #icon>
        用户名
      </template>
    </van-cell>
    <!--用户密码-->
    <van-cell title="" is-link value="******" @click="editUserInfo('password')">
      <template #icon>
        用户密码
      </template>
    </van-cell>
    <!--用户手机-->
    <van-cell title="" is-link :value="user.phone || '未绑定'" @click="editUserInfo('phone')">
      <template #icon>
        用户手机
      </template>
    </van-cell>
    <!--QQ绑定-->
    <van-cell center title="">
      <template #icon>
        QQ绑定
      </template>
      <template #right-icon>
        <van-button plain size="small" color="#f7b733" v-if="user.qqUid" @click="relieveQqBinding">解除绑定</van-button>
        <van-button plain size="small" color="blue" v-else @click="bindingQq">绑定QQ</van-button>
      </template>
    </van-cell>
    <!--用户主页-->
    <van-cell title="" is-link :value="hostname+'/'+user.domain" @click="editUserInfo('domain')">
      <template #icon>
        个人主页
      </template>
    </van-cell>
    <!--用户主页标题-->
    <van-cell title="" is-link :value="user.title" @click="editUserInfo('title')">
      <template #icon>
        主页标题
      </template>
    </van-cell>
    <!--开放用户主页-->
    <van-cell center value="开放主页">
      <template #right-icon>
        <van-switch v-model="user.domainRole === 1 ? true : false" size="24" @click="updateDomainRole" />
      </template>
      <template #icon>
        <van-icon name="question-o" size="20" @click="showDomainOpenMessage = !showDomainOpenMessage" />&nbsp;
        <van-popover v-model="showDomainOpenMessage" placement="top" :offset="[30, 20]">
          <div style="margin: 10px 10px;width: 100px;height: 100px;font-size: 14px">
            开放主页后，访问您的用户主页时无需登陆（未登录时不显示网站账号密码）。
          </div>
        </van-popover>
      </template>
    </van-cell>
    <!--导入书签-->
    <van-cell center title="">
      <template #icon>
        导入浏览器书签
      </template>
      <template #right-icon>
        <van-button size="small" color="linear-gradient(to right, #ee9ca7, #ffdde1)" @click="hint">火狐</van-button>&nbsp;|&nbsp;
        <van-button size="small" color="linear-gradient(to right, #f7797d, #FBD786)" @click="hint">谷歌</van-button>&nbsp;|&nbsp;
        <van-button size="small" color="linear-gradient(to right, #f7b733, #fc4a1a)" @click="hint">QQ</van-button>&nbsp;|&nbsp;
        <van-button size="small" color="linear-gradient(to right, #f5af19, #f12711)" @click="hint">360</van-button>
      </template>
    </van-cell>
    <!--注销账号-->
    <van-cell center title="">
      <template #icon>
        注销账号
      </template>
      <template #right-icon>
        <van-button plain size="small" color="red" @click="showLogout = true">注销本站账号并删除所有信息</van-button>
      </template>
    </van-cell>
    <van-cell>
      <van-button plain round hairline block color="green" text="安全退出登录" style="margin: 2% auto;width: 90%" @click="exit"/>
    </van-cell>
    <div></div>
    <!--修改隐私信息时弹出框-->
    <van-popup round closeable v-model="showVerification" close-icon="close" style="width:80%;" @close="closeVerification">
      <div>
        <div style="margin: 2% auto;width: 60%">{{ verificationTitle }}</div>
        <!--修改用户名弹出框-->
        <div v-if="field === 'username'">
          <van-field
            clearable
            v-model="user.username"
            label="新用户名"
            placeholder="请输入新用户名"
          />
          <div></div>
        </div>
        <!--修改密码弹出框-->
        <div v-else-if="field === 'password'">
          <van-field
            clearable
            v-model="oldPassword"
            label="原密码"
            placeholder="未设置可留空"
          />
          <van-field
            clearable
            v-model="newPassword"
            label="新密码"
            placeholder="请输入新密码"
          />
          <van-field
            clearable
            v-model="repPassword"
            label="重复密码"
            placeholder="请确认新密码"
          />
          <div></div>
        </div>
        <!--修改手机号弹出框-->
        <div v-else-if="field === 'phone'">
          <van-field
            clearable
            v-model="user.phone"
            label="新手机号"
            placeholder="请输入新手机号"
          />
          <van-field
            center
            clearable
            v-model="phoneCaptcha"
            label="验证码"
            placeholder="请输入验证码"
          >
            <template #button>
              <van-button size="small" type="info" v-if="field === 'phone'" @click="getPhoneCaptcha">{{phoneButton}}</van-button>
            </template>
          </van-field>
          <div></div>
        </div>
        <!--修改个人主页弹出框-->
        <div v-else-if="field === 'domain'">
          <van-field
            clearable
            v-model="user.domain"
            :label="hostname+'/'"
            label-align="right"
            label-width="50%"
            placeholder="请填写个人主页"
          />
          <div style="font-size: 13px;color: red">修改后您的个人主页为：{{hostname}}/{{user.domain}}</div>
        </div>
        <div v-else-if="field === 'title'">
          <van-field
            clearable
            v-model="user.title"
            label="新主页标题"
            placeholder="请输入新主页标题"
          />
          <div></div>
        </div>
        <!--提交按钮-->
        <van-button round block type="info" style="margin: 5% auto;width: 80%" @click="submitVerification">确认</van-button>
      </div>
    </van-popup>
    <!--注销弹窗-->
    <van-dialog v-model="showLogout" title="注销警告" show-cancel-button @confirm="logout">
      <van-cell>
        注销账号会删除您在本站的所有信息（可重新注册），仍需注销请输入账号密码确认身份！
      </van-cell>
      <van-cell>
        <van-field v-model="user.password" label="登录密码" placeholder="请输入登录密码" />
      </van-cell>
    </van-dialog>
  </div>
</template>

<script>

import { Dialog, Notify } from 'vant'

export default {
  name: 'Setting',
  inject: ['reload'],
  components: {
  },
  data () {
    return {
      user: {}, // 用户信息
      showVerification: false, // 显示修改用户信息框
      showDomainOpenMessage: false, // 显示域权限的提示信息
      hostname: document.location.hostname, // 域名
      field: '', // 修改字段
      value: '', // 修改字段值
      verificationTitle: '', // 修改用户信息标题
      phoneCaptcha: '', // 手机验证码
      phoneButton: '发送验证码', // 手机验证码按钮
      oldPassword: '', // 旧密码
      newPassword: '', // 新密码
      repPassword: '', // 重复新密码
      showLogout: false // 显示注销确定框
    }
  },
  async created () {
    // 赋值用户
    this.user = (await this.$api.getUserInfo()).data
    // 如果是QQ绑定
    if (this.$route.query.code) {
      let code = this.$route.query.code
      // 先把路由回设置
      await this.$router.push('/index/setting')
      // 绑定QQ
      await this.$api.qqBinding({ code: code })
      // 刷新用户
      this.user = (await this.$api.getUserInfo()).data
    }
  },
  methods: {
    // 编辑用户信息
    editUserInfo (field) {
      // 显示修改用户弹窗
      this.showVerification = true
      // 赋值字段
      this.field = field
      // 根据字段判断当前修改
      switch (field) {
        case 'username':
          this.verificationTitle = '修改账号'
          break
        case 'password':
          this.verificationTitle = '修改密码'
          break
        case 'phone':
          this.verificationTitle = '修改手机'
          break
        case 'domain':
          this.verificationTitle = '修改个人主页'
          break
        case 'title':
          this.verificationTitle = '修改主页标题'
          break
      }
    },
    // 获取手机验证码
    getPhoneCaptcha () {
      if (this.phoneButton !== '发送验证码') {
        return null
      }
      if (this.user.phone.length !== 11 || !/0?(13|14|15|18|17)[0-9]{9}/.test(this.user.phone)) {
        Notify({ type: 'warning', message: '手机号不正确' })
        return null
      }
      // 手机验证码定时器
      this.captchaTimer()
    },
    // 验证码间隔时间定时器
    async captchaTimer () {
      if (this.phoneButton === '发送验证码') {
        this.phoneButton = 60
        // 设置定时器
        this.timer = setInterval(() => {
          this.captchaTimer()
        }, 1000)
        // 发起请求
        await this.$api.getPhoneCaptcha(this.user.phone)
        await Notify({ type: 'success', message: '验证码发送成功' })
      } else {
        this.phoneButton = this.phoneButton - 1
        if (this.phoneButton === 0) {
          this.phoneButton = '发送验证码'
          // 清理定时器
          clearTimeout(this.timer)
        }
      }
    },
    // 点击确定修改信息
    async submitVerification () {
      switch (this.field) {
        case 'username':
          if (this.user.username.length < 6) {
            Notify({ type: 'warning', message: '用户名最低六位数' })
            return null
          }
          await this.$api.updateUserInfo({ field: this.field, value: this.user.username })
          await Notify({ type: 'success', message: '修改成功' })
          this.showVerification = false
          break
        case 'password':
          if (this.newPassword.length < 6) {
            Notify({ type: 'warning', message: '新密码最低六位数' })
            return null
          }
          if (this.newPassword !== this.repPassword) {
            Notify({ type: 'warning', message: '两次新密码不一致' })
            return null
          }
          await this.$api.updateUserInfo({ field: this.field, oldValue: this.oldPassword, value: this.newPassword })
          await Notify({ type: 'success', message: '修改成功，请重新登录' })
          // 修改密码后退出登录
          await this.exit()
          break
        case 'phone':
          if (this.user.phone.length !== 11 || !/0?(13|14|15|18|17)[0-9]{9}/.test(this.user.phone)) {
            Notify({ type: 'warning', message: '手机号不正确' })
            return null
          }
          if (this.phoneCaptcha === '') {
            Notify({ type: 'warning', message: '验证码不正确' })
            return null
          }
          await this.$api.updateUserPhone({ phone: this.user.phone, phoneCaptcha: this.phoneCaptcha })
          await Notify({ type: 'success', message: '修改成功' })
          this.showVerification = false
          break
        case 'domain':
          if (this.user.domain === '') {
            Notify({ type: 'warning', message: '个人主页不正确' })
            return null
          }
          if (this.user.domain.split('/').length > 1) {
            Notify({ type: 'warning', message: '不能包含特殊符号' })
            return null
          }
          await this.$api.updateUserInfo({ field: this.field, value: this.user.domain })
          await Notify({ type: 'success', message: '修改成功' })
          location.reload()
          break
        case 'title':
          if (this.user.title === '') {
            Notify({ type: 'warning', message: '主页标题不正确' })
            return null
          }
          await this.$api.updateUserInfo({ field: this.field, value: this.user.title })
          await Notify({ type: 'success', message: '修改成功' })
          this.showVerification = false
          break
      }
    },
    // 修改用户信息弹窗关闭时刷新用户数据
    async closeVerification () {
      this.user = (await this.$api.getUserInfo()).data
    },
    // 点击QQ绑定时
    async bindingQq () {
      window.location.href = (await this.$api.getQqLoginUrl('binding')).data.url
    },
    // 点击解绑QQ时（如果没绑定手机则提示绑定）
    async relieveQqBinding () {
      if (!this.user.phone) {
        await Dialog.confirm({
          message: '您没有绑定手机，解绑QQ后只能通过账号密码登录，如果忘记账号或密码会导致无法登录，依然解绑吗？'
        })
          .then(async () => {
            // 解除绑定请求
            await this.$api.relieveQqBinding()
            Notify({ type: 'success', message: '解除绑定成功' })
            this.user = (await this.$api.getUserInfo()).data
          })
          .catch(() => {
            // on cancel
          })
      }
    },
    // 修改用户个人主页权限
    async updateDomainRole () {
      await this.$api.updateDomainRole(this.user.domainRole === 1 ? 0 : 1)
      Notify({ type: 'success', message: '修改成功' })
      this.user = (await this.$api.getUserInfo()).data
    },
    // 注销账号
    async logout () {
      if (this.user.password === '') {
        Notify({ type: 'warning', message: '密码不能为空' })
        return null
      }
      await this.$api.deleteUser(this.user.password)
      // 注销请求
      Notify({ type: 'success', message: '注销成功，期待再见！' })
      // 清空登录信息
      await localStorage.removeItem('token')
      // 跳转主页
      await this.$router.push('/')
    },
    // 退出登录
    async exit () {
      // 清空登录信息
      await localStorage.removeItem('token')
      // 跳转主页
      await this.$router.push('/')
    },
    hint () {
      Notify({ type: 'warning', message: '抱歉，此功能下个版本上线' })
    }
  }
}
</script>
