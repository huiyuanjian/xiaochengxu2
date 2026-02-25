const Bmob = require('../../utils/Bmob-2.6.3.min.js')

Page({
  data: {
    // 国家区号，目前写死为中国 +86
    countryCode: '+86',
    // 手机号
    phone: '',
    // 短信验证码
    smsCode: '',
    // 是否同意协议
    isAgree: false,
    // 是否正在发送验证码
    sendingCode: false,
    // 验证码倒计时，单位：秒，为 0 表示可以重新发送
    countdown: 0,
    // 是否正在登录中
    loggingIn: false,
  },

  onUnload() {
    // 页面销毁时清理倒计时定时器
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
      this._countdownTimer = null
    }
  },

  // 处理手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value.trim()
    this.setData({ phone })
  },

  // 处理验证码输入
  onCodeInput(e) {
    const smsCode = e.detail.value.trim()
    this.setData({ smsCode })
  },

  // 勾选/取消勾选协议
  onToggleAgree() {
    this.setData({
      isAgree: !this.data.isAgree,
    })
  },

  // 获取短信验证码按钮点击
  onGetCodeTap() {
    const { phone, sendingCode, countdown } = this.data

    // 基础防抖：正在发送或倒计时中时不重复请求
    if (sendingCode || countdown > 0) {
      return
    }

    if (!this._isValidPhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }

    this.setData({ sendingCode: true })

    // 调用 Bmob 短信获取验证码接口
    Bmob.requestSmsCode({
      mobilePhoneNumber: phone,
    })
      .then(() => {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success',
        })
        // 启动 60 秒倒计时
        this._startCountdown(60)
      })
      .catch((err) => {
        console.log('获取验证码失败', err)
        wx.showToast({
          title: '获取验证码失败，请稍后重试',
          icon: 'none',
        })
      })
      .finally(() => {
        this.setData({ sendingCode: false })
      })
  },

  // 登录按钮点击
  onLoginTap() {
    const { phone, smsCode, isAgree, loggingIn } = this.data

    if (loggingIn) return

    if (!this._isValidPhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }

    if (!smsCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
      })
      return
    }

    if (!isAgree) {
      wx.showToast({
        title: '请先勾选同意协议',
        icon: 'none',
      })
      return
    }

    this.setData({ loggingIn: true })

    // 先调用 Bmob 验证码校验接口，通过后再走一键登录
    Bmob.verifySmsCode(smsCode, {
      mobilePhoneNumber: phone,
    })
      .then((res) => {
        console.log('验证码校验成功', res)

        // 验证通过后，调用一键登录接口，自动关联微信用户
        return Bmob.User.auth()
      })
      .then((user) => {
        console.log('一键登录成功', user)

        // 再根据 objectId 拉取最新用户数据（包含自定义字段），并刷新本地缓存
        return Bmob.User.updateStorage(user.objectId)
      })
      .then((fullUser) => {
        console.log('更新后的完整用户信息', fullUser)

        // 再从本地缓存读取一次，确认当前用户信息
        const current = Bmob.User.current()
        console.log('Bmob.User.current() 用户信息', current)

        const app = getApp()
        if (app && app.globalData) {
          // 记录用户对象和手机号，方便项目其他页面使用
          app.globalData.userInfo = fullUser
          app.globalData.mobileVerified = true
          app.globalData.mobilePhoneNumber = this.data.phone
        }

        wx.showToast({
          title: '登录成功',
          icon: 'success',
        })

        // 登录成功后跳转到首页
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }, 500)
      })
      .catch((err) => {
        console.log('登录失败', err)
        wx.showToast({
          title: '验证码错误或已失效',
          icon: 'none',
        })
      })
      .finally(() => {
        this.setData({ loggingIn: false })
      })
  },

  // 启动倒计时
  _startCountdown(seconds) {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
    }

    let remain = seconds
    this.setData({ countdown: remain })

    this._countdownTimer = setInterval(() => {
      remain -= 1
      if (remain <= 0) {
        clearInterval(this._countdownTimer)
        this._countdownTimer = null
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: remain })
      }
    }, 1000)
  },

  // 校验手机号是否为国内 11 位手机号
  _isValidPhone(phone) {
    return /^1\d{10}$/.test(phone)
  },
})

