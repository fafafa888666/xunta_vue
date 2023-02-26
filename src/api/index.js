import request from './config'

const api = {
  // 获取网站基本信息（标题和logo）
  getWebInfo () {
    return request.get('/setting/info')
  },
  // 获取用户个人主页网站标题
  getUserTitle (domain) {
    return request.get('/user/title?domain=' + domain)
  },
  // 获取首页轮播图
  getSlideshow () {
    return request.get('/slideshow/list')
  },
  // 通过域获取一级分类列表
  getCategoryParentListForDomain (domain) {
    return request.get('/category/parent_list/domain?domain=' + domain)
  },
  // 通过父级分类id和域获取子级分类列表和收藏列表
  getCategorySonListAndCollectListForDomain (categoryId, domain) {
    return request.get('/category/son_collect_list/domain?categoryId=' + categoryId + '&domain=' + domain)
  },
  // 增加收藏的访问量
  addVisit (collectId) {
    return request.post('/collect/' + collectId + '/visit')
  },
  // 通过关键词和域获取二级分类和收藏列表
  getCategoryAndCollect (keyword, domain) {
    return request.get('/category/search?keyword=' + keyword + '&domain=' + domain)
  },
  // 登录
  login (data) {
    return request.post('/user/login', data)
  },
  // 注册
  register (data) {
    return request.post('/user/registry', data)
  },
  // 获取时间验证码
  getPhoneCaptcha (phone) {
    return request.post('/captcha/send_sms', { phone: phone })
  },
  // 手机号登录
  phoneLogin (data) {
    return request.post('/user/phone_login', data)
  },
  // 获取QQ登录地址
  getQqLoginUrl (type) {
    return request.get('/user/' + type + '/qq_login_url')
  },
  // QQ登录
  qqLogin (data) {
    return request.post('/user/qq_login', data)
  },
  /**
   * 以下都需要登录才可以操作
   */
  // 获取收藏的账号密码
  getAccountForCollectId (collectId) {
    return request.get('/account/' + collectId + '/info')
  },
  // 获取一级分类列表（通过Token信息获得）
  getParentList () {
    return request.get('/category/parent_list')
  },
  // 通过分类id获取子级分类和收藏信息
  getCategorySonListAndCollectList (categoryId) {
    return request.get('/category/son_collect_list?categoryId=' + categoryId)
  },
  // 修改是否首页
  updateCollectHome (collectId, home) {
    return request.post('/collect/' + collectId + '/' + home + '/home')
  },
  // 修改账号信息
  updateAccount (data) {
    return request.put('/account/update', data)
  },
  // 删除收藏信息
  removeCollect (collectId) {
    return request.delete('/collect/' + collectId + '/remove')
  },
  // 通过收藏id获取收藏信息
  getCollect (collectId) {
    return request.get('/collect/' + collectId + '/info')
  },
  // 获取修改|增加收藏时分类树信息
  getCategoryDropDownList (categoryId) {
    return request.get('/category/drop_down_list?categoryId=' + categoryId)
  },
  // 修改收藏信息
  updateCollect (data) {
    return request.post('/collect/update', data)
  },
  // 增加收藏信息
  insertCollect (data) {
    return request.post('/collect/add', data)
  },
  // 收藏信息排序
  sortCollect (data) {
    return request.put('/collect/sort', data)
  },
  // 获取树形分类列表
  getCategoryTreeList () {
    return request.get('/category/tree_list')
  },
  // 修改分类
  updateCategory (data) {
    return request.post('/category/update', data)
  },
  // 增加分类
  insertCategory (data) {
    return request.post('/category/add', data)
  },
  // 删除分类
  deleteCategory (categoryId, deCollectFlag) {
    return request.delete('/category/' + categoryId + '/' + deCollectFlag + '/delete')
  },
  // 分类排序
  sortCategory (data) {
    return request.put('/category/sort', data)
  },
  // 获取用户基本信息
  getUserInfo () {
    return request.get('/user/info')
  },
  // 修改用户手机
  updateUserPhone (data) {
    return request.put('/user/binding_phone', data)
  },
  // 修改用户信息
  updateUserInfo (data) {
    return request.put('/user/update', data)
  },
  // QQ绑定
  qqBinding (data) {
    return request.post('/user/qq_binding', data)
  },
  // 解除绑定
  relieveQqBinding () {
    return request.delete('/user/qq_binding')
  },
  // 修改用户个人主页访问权限
  updateDomainRole (domainRole) {
    return request.put('/user/domain_role/' + domainRole)
  },
  // 爬取网站ico,title,description信息
  getUrlInfo (data) {
    return request.post('/collect/url_info', data)
  },
  // 注销账号
  deleteUser (password) {
    return request.delete('/user/info?password=' + password)
  },
  // 上传收藏LOGO
  uploadCollectLogo (data) {
    return request.post('/collect/upload_logo', data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
}

export default api
