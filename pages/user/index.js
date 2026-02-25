// 个人中心页面
// 遵循微信小程序开发规范和Bmob后端云最佳实践
const UserService = require('../../utils/userService.js')

Page({
  /**
   * 页面数据
   */
  data: {
    // 用户基本信息
    avatarUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
    nickname: '未登录',
    userId: '',
    intro: '还没有简介',
    
    // 用户统计数据
    stats: [
      { label: '关注', value: 0 },
      { label: '粉丝', value: 0 },
      { label: '获赞与收藏', value: 0 },
    ],
    
    // 标签页配置
    tabs: [
      { key: 'notes', label: '笔记' },
      { key: 'collect', label: '收藏' },
      { key: 'like', label: '赞过' },
    ],
    activeTab: 'notes',
    
    // 加载状态管理
    isLoading: false,
    hasMoreData: true,
    currentPage: 1,
    pageSize: 10,
    
    // 动态数据列表
    notesList: [],
    collectList: [],
    likeList: [],

    // 瀑布流布局数据
    waterfallMap: {
      notes: { left: [], right: [] },
      collect: { left: [], right: [] },
      like: { left: [], right: [] },
    },
    wfLeft: [],
    wfRight: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this._checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this._refreshUserData()
  },

  /**
   * 检查用户登录状态
   * @private
   */
  _checkLoginStatus() {
    if (!UserService.isLogin()) {
      wx.showModal({
        title: '提示',
        content: '您还未登录，请先登录',
        showCancel: false,
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }
    
    this._loadUserData()
  },

  /**
   * 刷新用户数据
   * @private
   */
  _refreshUserData() {
    if (UserService.isLogin()) {
      this._loadUserData()
    }
  },

  /**
   * 加载用户完整数据
   * @private
   */
  async _loadUserData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const currentUser = UserService.getCurrentUser()
      if (!currentUser) {
        throw new Error('获取用户信息失败')
      }
      
      // 并行加载用户基本信息和统计数据
      const [userInfo, userStats] = await Promise.all([
        UserService.getUserInfo(currentUser.objectId),
        UserService.getUserStats(currentUser.objectId)
      ])
      
      // 更新用户基本信息
      this.setData({
        avatarUrl: userInfo.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg',
        nickname: userInfo.nickname || userInfo.username || '用户' + currentUser.objectId.slice(-6),
        userId: '小红书号 ' + (currentUser.objectId || '').slice(-10),
        intro: userInfo.signature || '还没有简介'
      })
      
      // 更新统计数据
      this._updateUserStats(userStats)
      
      // 加载当前标签页内容
      await this._loadDataByTab(this.data.activeTab)
      
    } catch (error) {
      console.error('[UserPage] 加载用户数据失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 更新用户统计数据展示
   * @param {Object} stats - 统计数据
   * @private
   */
  _updateUserStats(stats) {
    this.setData({
      stats: [
        { label: '关注', value: stats.followCount || 0 },
        { label: '粉丝', value: stats.fanCount || 0 },
        { label: '获赞与收藏', value: stats.likeCount || 0 },
      ]
    })
  },

  /**
   * 根据标签页加载对应数据
   * @param {string} tabKey - 标签页key
   * @private
   */
  async _loadDataByTab(tabKey) {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    try {
      const currentUser = UserService.getCurrentUser()
      if (!currentUser) return
      
      let list = []
      const page = this.data.currentPage
      const limit = this.data.pageSize
      
      // 根据标签页类型调用对应服务
      switch (tabKey) {
        case 'notes':
          list = await UserService.getUserNotes(currentUser.objectId, page, limit)
          break
        case 'collect':
          list = await UserService.getUserCollects(currentUser.objectId, page, limit)
          break
        case 'like':
          list = await UserService.getUserLikes(currentUser.objectId, page, limit)
          break
        default:
          console.warn('[UserPage] 未知的标签页类型:', tabKey)
          return
      }
      
      // 更新列表数据
      this._updateListData(tabKey, list, page)
      
      // 重建瀑布流布局
      this._rebuildAllWaterfalls()
      this._applyActiveWaterfall(tabKey)
      
    } catch (error) {
      console.error('[UserPage] 加载标签页数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 标签页切换处理
   * @param {Object} e - 事件对象
   */
  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    if (!key || key === this.data.activeTab) return

    this.setData({ 
      activeTab: key,
      currentPage: 1  // 切换标签时重置页码
    })
    
    // 加载新标签页数据
    this._loadDataByTab(key)
  },

  /**
   * 下拉刷新处理
   */
  onPullDownRefresh() {
    this.setData({
      currentPage: 1
    })
    this._loadUserData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉触底加载更多
   */
  onReachBottom() {
    if (!this.data.hasMoreData || this.data.isLoading) return
    
    this.setData({
      currentPage: this.data.currentPage + 1
    })
    
    this._loadDataByTab(this.data.activeTab)
  },

  /**
   * 退出登录处理
   */
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          UserService.logout()
          wx.redirectTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  },

  /**
   * 更新列表数据
   * @param {string} tabKey - 标签页key
   * @param {Array} newList - 新数据列表
   * @param {number} page - 当前页码
   * @private
   */
  _updateListData(tabKey, newList, page) {
    const listKey = tabKey + 'List'
    const currentList = this.data[listKey] || []
    
    let updatedList
    if (page === 1) {
      // 刷新模式：替换数据
      updatedList = newList
      this.setData({
        hasMoreData: newList.length >= this.data.pageSize
      })
    } else {
      // 加载更多模式：追加数据
      updatedList = [...currentList, ...newList]
      this.setData({
        hasMoreData: newList.length >= this.data.pageSize
      })
    }
    
    this.setData({
      [listKey]: updatedList
    })
  },

  _applyActiveWaterfall(tabKey) {
    const map = this.data.waterfallMap || {}
    const cur = map[tabKey] || { left: [], right: [] }
    this.setData({
      wfLeft: cur.left || [],
      wfRight: cur.right || [],
    })
  },

  _rebuildAllWaterfalls() {
    const map = {
      notes: this._buildWaterfall(this.data.notesList || []),
      collect: this._buildWaterfall(this.data.collectList || []),
      like: this._buildWaterfall(this.data.likeList || []),
    }
    this.setData({
      waterfallMap: map,
    })
  },

  // 简易瀑布流：按“估算高度”把数据分配到左右两列，保证两列尽量均衡
  _buildWaterfall(list) {
    const left = []
    const right = []
    let leftScore = 0
    let rightScore = 0

    for (let i = 0; i < list.length; i += 1) {
      const item = list[i]
      const score = this._calcItemScore(item)
      if (leftScore <= rightScore) {
        left.push(item)
        leftScore += score
      } else {
        right.push(item)
        rightScore += score
      }
    }

    return { left, right }
  },

  _calcItemScore(item) {
    // cover 采用 widthFix，自适应高度，这里用标题长度粗略估算卡片高度差异
    const title = (item && item.title) || ''
    const base = 100
    const extra = Math.min(title.length, 60) * 1.6
    return base + extra
  },
})

