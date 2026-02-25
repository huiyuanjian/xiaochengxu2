Page({
  data: {
    // 头像、昵称等展示数据，先使用静态占位
    avatarUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
    nickname: '小红薯677762ED',
    userId: '小红书号 3475738901',
    intro: '还没有简介',
    stats: [
      { label: '关注', value: 0 },
      { label: '粉丝', value: 0 },
      { label: '获赞与收藏', value: 0 },
    ],
    tabs: [
      { key: 'notes', label: '笔记' },
      { key: 'collect', label: '收藏' },
      { key: 'like', label: '赞过' },
    ],
    activeTab: 'collect',
    // 笔记/收藏/赞过列表静态数据（先不接接口）
    notesList: [
      {
        id: 101,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '今天的日常碎片记录一下，天气很好',
        author: '爱吃沙西瓜',
        likeText: '126',
      },
      {
        id: 102,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '分享一个超简单的早餐做法，三分钟搞定',
        author: '小红薯A1B2',
        likeText: '986',
      },
      {
        id: 103,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '城市散步路线推荐，人少景美',
        author: '晚风',
        likeText: '2580',
      },
      {
        id: 104,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '新买的杯子太好用了，颜值也很高',
        author: '小红薯77',
        likeText: '66',
      },
    ],
    collectList: [
      {
        id: 1,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '老婆自已腌的泡菜，不敢吃该怎么拒绝',
        author: '爱吃沙西瓜',
        likeText: '5386',
      },
      {
        id: 2,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '租房改造小技巧，几十块让房间焕然一新',
        author: '小红薯C3D4',
        likeText: '1320',
      },
      {
        id: 3,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '通勤穿搭分享，显高又不费力',
        author: 'Kiki',
        likeText: '889',
      },
      {
        id: 4,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '我愿称它为性价比之王，真的太香了',
        author: '小红薯E5F6',
        likeText: '265',
      },
    ],
    likeList: [
      {
        id: 201,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '周末不想出门就做这个，一锅端满足',
        author: '小红薯G7H8',
        likeText: '310',
      },
      {
        id: 202,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '护肤新思路：精简护肤也能稳住状态',
        author: '小夏',
        likeText: '2199',
      },
      {
        id: 203,
        cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '拍照姿势合集，随手拍都出片',
        author: '豆豆',
        likeText: '5306',
      },
    ],

    // 瀑布流数据（左右两列）
    waterfallMap: {
      notes: { left: [], right: [] },
      collect: { left: [], right: [] },
      like: { left: [], right: [] },
    },
    wfLeft: [],
    wfRight: [],
  },

  onLoad() {
    this._rebuildAllWaterfalls()
    this._applyActiveWaterfall(this.data.activeTab)
  },

  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    if (!key || key === this.data.activeTab) return

    this.setData({ activeTab: key })
    this._applyActiveWaterfall(key)
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

