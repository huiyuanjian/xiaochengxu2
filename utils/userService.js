// 用户服务工具类
// 遵循Bmob后端云规范，提供用户相关数据操作
const Bmob = require('./Bmob-2.6.3.min.js')

class UserService {
  /**
   * 获取当前登录用户信息
   * @returns {Object|null} 当前用户对象
   */
  static getCurrentUser() {
    return Bmob.User.current()
  }

  /**
   * 根据用户ID获取详细信息
   * @param {string} userId - 用户objectId
   * @returns {Promise<Object>} 用户详细信息
   */
  static async getUserInfo(userId) {
    try {
      const query = Bmob.Query('_User')
      // 按照Bmob规范，使用get方法获取单条记录
      const user = await query.get(userId)
      return user
    } catch (error) {
      console.error('[UserService] 获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {Object} userInfo - 要更新的用户信息
   * @returns {Promise<Object>} 更新结果
   */
  static async updateUserInfo(userInfo) {
    try {
      const currentUser = Bmob.User.current()
      if (!currentUser) {
        throw new Error('用户未登录')
      }

      const query = Bmob.Query('_User')
      const user = await query.get(currentUser.objectId)
      
      // 根据database.md规范更新用户字段
      if (userInfo.nickname !== undefined) user.set('nickname', userInfo.nickname)
      if (userInfo.avatar !== undefined) user.set('avatar', userInfo.avatar)
      if (userInfo.intro !== undefined) user.set('signature', userInfo.intro) // 使用signature字段
      if (userInfo.gender !== undefined) user.set('gender', userInfo.gender)
      
      const result = await user.save()
      return result
    } catch (error) {
      console.error('[UserService] 更新用户信息失败:', error)
      throw error
    }
  }

  /**
   * 获取用户统计数据（关注、粉丝、获赞与收藏）
   * @param {string} userId - 用户objectId
   * @returns {Promise<Object>} 统计数据
   */
  static async getUserStats(userId) {
    try {
      // 方案1: 直接从用户表获取（如果字段存在）
      const userQuery = Bmob.Query('_User')
      const user = await userQuery.get(userId)
      
      if (user) {
        return {
          followCount: user.followCount || 0,
          fanCount: user.fansCount || 0,
          likeCount: user.likeCollectCount || 0
        }
      }
      
      // 方案2: 从专门的统计表查询（备用方案）
      const statsQuery = Bmob.Query('user_stats')
      statsQuery.equalTo('userId', userId)
      const result = await statsQuery.find()
      
      if (result && result.length > 0) {
        return {
          followCount: result[0].followCount || 0,
          fanCount: result[0].fanCount || 0,
          likeCount: result[0].likeCollectCount || 0
        }
      }
      
      // 默认值
      return {
        followCount: 0,
        fanCount: 0,
        likeCount: 0
      }
    } catch (error) {
      console.warn('[UserService] 获取用户统计失败，返回默认值:', error)
      return {
        followCount: 0,
        fanCount: 0,
        likeCount: 0
      }
    }
  }

  /**
   * 获取用户发布的笔记列表
   * @param {string} userId - 用户objectId
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise<Array>} 笔记列表
   */
  static async getUserNotes(userId, page = 1, limit = 10) {
    try {
      const query = Bmob.Query('note') // 使用规范的表名
      // 按照Bmob规范设置查询条件
      query.equalTo('author', '==', userId) // 使用Pointer关联查询
      query.equalTo('status', '==', 1) // 只查询已发布的笔记
      query.order('-createdAt') // 按创建时间降序
      query.limit(limit)
      query.skip((page - 1) * limit)
      
      const result = await query.find()
      
      // 按照规范格式化返回数据
      return result.map(note => ({
        id: note.objectId,
        cover: this._getFirstImage(note.images) || 'https://img.yzcdn.cn/vant/cat.jpeg',
        title: note.content ? note.content.substring(0, 50) : '',
        author: note.authorObj ? note.authorObj.nickname : '匿名用户',
        likeText: note.likeCount ? note.likeCount.toString() : '0',
        commentCount: note.commentCount || 0,
        createdAt: note.createdAt
      }))
    } catch (error) {
      console.error('[UserService] 获取用户笔记失败:', error)
      return []
    }
  }

  /**
   * 获取用户收藏的笔记
   * @param {string} userId - 用户objectId
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise<Array>} 收藏列表
   */
  static async getUserCollects(userId, page = 1, limit = 10) {
    try {
      const query = Bmob.Query('favorite')
      query.equalTo('user', '==', userId)
      query.equalTo('status', '==', 1) // 公开收藏
      query.include('note') // 关联查询笔记详情
      query.order('-createdAt')
      query.limit(limit)
      query.skip((page - 1) * limit)
      
      const result = await query.find()
      
      return result.map(favorite => {
        const note = favorite.note || {}
        return {
          id: favorite.objectId,
          cover: this._getFirstImage(note.images) || 'https://img.yzcdn.cn/vant/cat.jpeg',
          title: note.content ? note.content.substring(0, 50) : '',
          author: note.authorObj ? note.authorObj.nickname : '匿名用户',
          likeText: note.likeCount ? note.likeCount.toString() : '0',
          createdAt: favorite.createdAt
        }
      })
    } catch (error) {
      console.error('[UserService] 获取用户收藏失败:', error)
      return []
    }
  }

  /**
   * 获取用户点赞的笔记
   * @param {string} userId - 用户objectId
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise<Array>} 点赞列表
   */
  static async getUserLikes(userId, page = 1, limit = 10) {
    try {
      const query = Bmob.Query('like')
      query.equalTo('user', '==', userId)
      query.include('note') // 关联查询笔记详情
      query.order('-createdAt')
      query.limit(limit)
      query.skip((page - 1) * limit)
      
      const result = await query.find()
      
      return result.map(like => {
        const note = like.note || {}
        return {
          id: like.objectId,
          cover: this._getFirstImage(note.images) || 'https://img.yzcdn.cn/vant/cat.jpeg',
          title: note.content ? note.content.substring(0, 50) : '',
          author: note.authorObj ? note.authorObj.nickname : '匿名用户',
          likeText: note.likeCount ? note.likeCount.toString() : '0',
          createdAt: like.createdAt
        }
      })
    } catch (error) {
      console.error('[UserService] 获取用户点赞失败:', error)
      return []
    }
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} 登录状态
   */
  static isLogin() {
    return !!Bmob.User.current()
  }

  /**
   * 用户退出登录
   */
  static logout() {
    Bmob.User.logout()
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.userInfo = null
      app.globalData.mobileVerified = false
      app.globalData.mobilePhoneNumber = ''
    }
  }

  /**
   * 辅助方法：获取图片数组中的第一张图片
   * @param {Array} images - 图片数组
   * @returns {string|null} 第一张图片URL
   */
  static _getFirstImage(images) {
    if (Array.isArray(images) && images.length > 0) {
      return images[0]
    }
    return null
  }
}

module.exports = UserService
