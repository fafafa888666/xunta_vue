<template>
  <div>
    <van-form @submit="onSubmit">
      <van-image
        round
        width="10rem"
        height="10rem"
        :src="logo"
      />
      <!--QQ登录-->
      <div v-if="showQQLogin">
        <van-circle
          v-model="qqLoginStart"
          :rate="100"
          :color="qqLoginColor"
          text="QQ登录中……"
          size="150px"
          speed="50"
          style="margin: 20% 20%"
        />
      </div>
      <div v-else>
        <!--登录-->
        <div v-if="state === 'login'">
          <van-field
            clearable
            v-model="username"
            name="username"
            label="本站账号"
            placeholder="请输入账号"
            :rules="[{ pattern:accountRules , message: '账号至少6位' }]"
          />
          <van-field
            clearable
            v-model="password"
            type="password"
            name="password"
            label="本站密码"
            placeholder="请输入密码"
            :rules="[{ pattern:accountRules, message: '密码至少6位' }]"
          />
          <div></div>
        </div>
        <!--手机号登录-->
        <div v-else-if="state === 'phoneLogin'">
          <van-field
            clearable
            v-model="phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ pattern:phoneRules, message: '手机号格式不正确' }]"
          />
          <van-field
            center
            clearable
            v-model="phoneCaptcha"
            name="phoneCaptcha"
            label="验证码"
            placeholder="请输入短信验证码"
            :rules="[{ pattern:accountRules, message: '验证码至少6位' }]"
          >
            <template #button v-if="state === 'phoneLogin'">
              <van-button size="small" type="info" native-type="button" @click="getPhoneCaptcha">{{ phoneButton }}</van-button>
            </template>
          </van-field>
          <div></div>
        </div>
        <!--注册-->
        <div v-else-if="state === 'registry'">
          <van-field
            clearable
            v-model="username"
            name="username"
            label="本站账号"
            placeholder="请输入账号"
            :rules="[{ pattern:accountRules, message: '账号至少6位' }]"
          />
          <van-field
            clearable
            v-model="password"
            type="password"
            name="password"
            label="本站密码"
            placeholder="请输入密码"
            :rules="[{ pattern:accountRules, message: '密码至少6位' }]"
          />
          <van-field
            clearable
            v-model="repetition"
            type="password"
            name="repetition"
            label="确认密码"
            placeholder="请确认密码"
            :rules="[{ validator: checkPassword, message: '密码不一致' }]"
          />
          <div></div>
        </div>
        <!--提交按钮-->
        <div style="margin:16px 16px 0 16px;">
          <van-button round block type="info" native-type="submit">
            <span v-if="state === 'registry'">注册</span>
            <span v-else>登录</span>
          </van-button>
        </div>
      </div>
    </van-form>
    <!--除提交按钮外的其他按钮-->
    <div style="margin: 0 16px;" v-if="!showQQLogin">
      <van-button round plain block type="info" style="margin-top: 5px" @click="loginOrRegistry" v-if="state !== 'phoneLogin'">
        <span v-if="state === 'registry'">账号登录</span>
        <span v-else>账号注册</span>
      </van-button>
      <van-row style="margin-top: 5px">
        <van-col span="12"><van-button round plain hairline block type="info" @click="qqLogin">QQ登录</van-button></van-col>
        <van-col span="12"><van-button round plain hairline block type="info" @click="loginOrPhoneLogin">
          <span v-if="state === 'phoneLogin'">账号登录</span>
          <span v-else>手机快捷登录</span>
        </van-button></van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { Notify } from 'vant'
export default {
  name: 'Login',
  components: {
  },
  data () {
    return {
      accountRules: /.{6}/, // 账号密码正则（不能少于6卫生）
      phoneRules: /0?(13|14|15|18|17)[0-9]{9}/, // 手机号码正则
      state: 'login', // 页面状态
      username: '', // 账号
      password: '', // 密码
      repetition: '', // 重复密码
      phone: '', // 手机号码
      phoneCaptcha: '', // 验证码
      phoneButton: '发送验证码', // 验证码按钮
      showQQLogin: this.$route.query.type === 'qq', // 是否QQ登录状态
      qqLoginStart: 0, // QQ登录启动
      qqLoginColor: { // QQ登录进度条颜色
        '0%': '#3fecff',
        '100%': '#6149f6'
      },
      logo: '' // web.webLogo是登录页logo
    }
  },
  async mounted () {
    this.logo = (await this.$api.getWebInfo()).data.logo
    // 如果是QQ登录
    if (this.showQQLogin) {
      // title和页头设置为QQ登录
      document.title = this.$parent.$refs.header.title = 'QQ登录'
      let code = this.$route.query.code
      const data = await this.$api.qqLogin({ code: code })
      if (data.data) {
        // QQ登录
        await this.onLogin(data.data)
      } else {
        // QQ登录失败
        await Notify({ type: 'danger', message: 'QQ登录失败，请重试' })
        this.showQQLogin = false
      }
    }
  },
  methods: {
    async onSubmit (values) {
      switch (this.state) {
        case 'login':
          // 登录
          await this.onLogin((await this.$api.login(values)).data)
          break
        case 'registry':
          // 注册
          await this.$api.register(values)
          await Notify({ type: 'success', message: '注册成功，正在登录' })
          // 登录
          await this.onLogin((await this.$api.login(values)).data)
          break
        case 'phoneLogin':
          // 手机号登录
          await this.onLogin((await this.$api.phoneLogin(values)).data)
          break
      }
    },
    // 获取到登录数据后的操作
    async onLogin (data) {
      // 存token
      await localStorage.setItem('token', data.token)
      // 跳转主页
      await this.$router.push(data.user.domain)
    },
    // 获取手机验证码
    getPhoneCaptcha () {
      if (this.phoneButton !== '发送验证码') {
        return null
      }
      if (this.phone.length !== 11 || !this.phoneRules.test(this.phone)) {
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
        await this.$api.getPhoneCaptcha(this.phone)
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
    // 验证重复密码是不是相等
    checkPassword (val) {
      return this.password === val
    },
    // qq登录按钮点击事件
    async qqLogin () {
      window.location.href = (await this.$api.getQqLoginUrl('login')).data.url
    },
    // 第二个按钮点击事件
    loginOrRegistry () {
      if (this.state === 'login') {
        this.state = 'registry'
        document.title = this.$parent.$refs.header.title = '账号注册'
      } else {
        this.state = 'login'
        document.title = this.$parent.$refs.header.title = '账号登录'
      }
    },
    // 右下角按钮点击事件
    loginOrPhoneLogin () {
      if (this.state === 'phoneLogin') {
        this.state = 'login'
        document.title = this.$parent.$refs.header.title = '账号登录'
      } else {
        this.state = 'phoneLogin'
        document.title = this.$parent.$refs.header.title = '手机快捷登录'
      }
    }
  }
}
</script>
