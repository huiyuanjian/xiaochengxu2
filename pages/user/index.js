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
    // 收藏列表静态数据
    collectList: [
      {
        id: 1,
        cover:
          'https://img.yzcdn.cn/vant/cat.jpeg',
        title: '老婆自已腌的泡菜，不敢吃该怎么拒绝',
        author: '爱吃沙西瓜',
        tag: '美食日常',
        likeText: '5386',
      },
    ],
  },

  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    if (!key || key === this.data.activeTab) return
    this.setData({
      activeTab: key,
    })
  },
})

