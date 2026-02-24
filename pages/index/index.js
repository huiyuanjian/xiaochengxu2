// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  onLoad(options) {
    console.log('index 页面生命周期执行：1 onLoad', options)
  },
  onShow() {
    console.log('index 页面生命周期执行：2 onShow')
  },
  onReady() {
    console.log('index 页面生命周期执行：3 onReady')
  },
  onHide() {
    console.log('index 页面生命周期执行：4 onHide')
  },
  onUnload() {
    console.log('index 页面生命周期执行：5 onUnload')
  },
  onPullDownRefresh() {
    console.log('index 页面生命周期执行：6 onPullDownRefresh')
  },
  onReachBottom() {
    console.log('index 页面生命周期执行：7 onReachBottom')
  },
  onShareAppMessage() {
    console.log('index 页面生命周期执行：8 onShareAppMessage')
    return {}
  },
  onPageScroll(e) {
    console.log('index 页面生命周期执行：9 onPageScroll', e)
  },
  onResize(e) {
    console.log('index 页面生命周期执行：10 onResize', e)
  },
  onTabItemTap(item) {
    console.log('index 页面生命周期执行：11 onTabItemTap', item)
  },
  // 跳转到 detail 页面，携带参数 name=慕课
  goDetail() {
    wx.navigateTo({
      url: '/pages/detail/index?name=慕课',
    })
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
})
