// pages/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 从首页传入的 name 参数
    message: "慕课网欢迎你",
    userInfo: {
      name: "老莫",
      title: "全栈讲师"
    },
    name: '',
    // 点击事件计数
    clickCount: 0,
    // 输入框当前内容
    inputValue: '',
    // 表单提交结果
    formResult: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 接收首页传递的 name 参数
    const { name } = options || {}
    this.setData({
      name: name || '未传入名称',
    })
  },

  /**
   * 点击事件示例
   */
  handleTap() {
    const { clickCount } = this.data
    this.setData({
      clickCount: clickCount + 1
    })
  },

  /**
   * 输入事件示例
   * @param {Object} e 输入事件对象
   */
  handleInput(e) {
    const { value } = e.detail || {}
    this.setData({
      inputValue: value || ''
    })
  },

  /**
   * 表单提交事件示例
   * @param {Object} e 表单提交事件对象
   */
  handleFormSubmit(e) {
    const { value } = e.detail || {}
    // 这里简单将表单数据转成字符串进行展示
    this.setData({
      formResult: JSON.stringify(value || {})
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})