---
alwaysApply: false
---

### 1. 数据表查询操作

```javascript
// 获取一行记录
const query = Bmob.Query('TableName');
query.get('objectId').then(res => {
    console.log('查询结果：', res);
});

// 查询所有数据
const query = Bmob.Query('TableName');
query.find().then(res => {
    console.log('查询结果：', res);
});

// 条件查询
const query = Bmob.Query('TableName');
query.equalTo("key", "==", "value");
query.find().then(res => {
    console.log('条件查询结果：', res);
});
```

### 2. 数据表新增操作

```javascript
// 新增一条数据
const query = Bmob.Query('TableName');
query.set("title", "我是标题");
query.set("content", "我是内容");
query.save().then(res => {
    console.log('创建成功：', res);
});

// 批量新增数据
const query = Bmob.Query('TableName');
query.addArray([
    {"title": "标题1", "content": "内容1"},
    {"title": "标题2", "content": "内容2"}
]);
query.saveAll().then(res => {
    console.log('批量创建成功：', res);
});
```

### 3. 数据表更新操作

```javascript
// 更新一行记录
 //方式一：
 const query = Bmob.Query('tableName');
 query.set('id', 'objectId') //需要修改的objectId
 query.set('nickName', 'Bmob后端云')
 query.save().then(res => {
 		console.log(res)
 }).catch(err => {
 		console.log(err)
 })

//方式二：
const query = Bmob.Query('tableName');
query.get('objectId').then(res => {
  console.log(res)
  res.set('cover','3333')
  res.save()
}).catch(err => {
  console.log(err)
})

// 批量更新记录
const query = Bmob.Query('TableName');
query.containedIn("title", ["标题1", "标题2"]);
query.find().then(res => {
    res.forEach(obj => {
        obj.set("status", "已更新");
    });
    query.saveAll().then(res => {
        console.log('批量更新成功：', res);
    });
});
```

### 4. 数据表删除操作

```javascript
// 删除一行记录
const query = Bmob.Query('TableName');
query.destroy('objectId').then(res => {
    console.log('删除成功：', res);
});

// 批量删除记录
const query = Bmob.Query('TableName');
query.containedIn("status", ["废弃", "过期"]);
query.find().then(res => {
    query.destroyAll().then(res => {
        console.log('批量删除成功：', res);
    });
});
```

### 5. 高级查询技巧

```javascript
// 分页查询
const query = Bmob.Query('TableName');
query.limit(10);  // 限制返回10条数据
query.skip(10);   // 跳过前10条数据
query.find().then(res => {
    console.log('分页查询结果：', res);
});

// 结果排序
const query = Bmob.Query('TableName');
query.order("-createdAt"); // 按创建时间降序
query.find().then(res => {
    console.log('排序查询结果：', res);
});

// 统计记录数量
const query = Bmob.Query('TableName');
query.count().then(res => {
    console.log('记录总数：', res);
});
```

## 二、一对多关系设计：Pointer实战

### 1. 业务场景：文章与评论

```javascript
// 1. 创建文章
const article = Bmob.Query('Article');
article.set("title", "如何使用Bmob打造小程序");
article.set("content", "详细内容...");
article.save().then(res => {
    console.log('文章创建成功：', res);
});

// 2. 创建关联评论
const comment = Bmob.Query('Comment');
comment.set("content", "这篇文章很实用！");
// 设置评论关联到文章，使用Pointer类型
let pointer = Bmob.Pointer('Article');
let pointerObject = pointer.set(articleId);  // articleId为文章的objectId
comment.set("article", pointerObject);
comment.save().then(res => {
    console.log('评论创建成功：', res);
});
```

### 2. 关联查询技巧

```javascript
// 1. 查询文章的所有评论
const query = Bmob.Query('Comment');
query.equalTo("article", "==", articleId);
query.find().then(res => {
    console.log('文章的所有评论：', res);
});

// 2. 查询评论同时获取关联的文章信息
const query = Bmob.Query('Comment');
query.include('article'); // 包含文章信息
query.find().then(res => {
    console.log('评论及其文章信息：', res);
    // res中将包含完整的文章信息
});

// 3. 统计文章评论数
const query = Bmob.Query('Comment');
query.equalTo("article", "==", articleId);
query.count().then(count => {
    console.log('评论总数：', count);
});
```

> 💡 小贴士：在使用Pointer类型时，要注意以下几点：
>
> 1. Pointer适合处理一对多的关系，如一篇文章对应多条评论
> 2. 使用include可以在一次查询中获取关联数据，减少请求次数

## 三、Bmob高级功能深度剖析

### 1. 云函数数据库操作

```javascript
// 1. 查询单条数据
function onRequest(request, response, modules) {
    var db = modules.oData;
    db.findOne({
        "table": "GameScore",
        "objectId": "d746635d0b"
    }, function(err, data) {
        if(err) {
            response.send("查询失败: " + err.error);
        } else {
            response.send("查询成功: " + JSON.stringify(data));
        }
    });
}

// 2. 条件查询多条数据
function onRequest(request, response, modules) {
    var db = modules.oData;
    db.find({
        "table": "GameScore",
        "where": {
            "score": {
                "$gt": 80   // 查询分数大于80的数据
            }
        },
        "limit": 10,        // 限制返回10条
        "order": "-score"   // 按分数降序
    }, function(err, data) {
        if(err) {
            response.send("查询失败: " + err.error);
        } else {
            response.send("查询成功: " + JSON.stringify(data));
        }
    });
}

// 3. 复杂查询示例
function onRequest(request, response, modules) {
    var db = modules.oData;
    db.find({
        "table": "GameScore",
        "where": {
            "$or": [        // 或查询
                {"score": {"$gt": 90}},
                {"level": {"$gte": 5}}
            ],
            "isActive": true
        },
        "include": "user",  // 关联查询用户信息
        "keys": "score,level,user", // 只返回指定字段
        "skip": 20         // 跳过前20条
    }, function(err, data) {
        if(err) {
            response.send("查询失败: " + err.error);
        } else {
            response.send("查询成功: " + JSON.stringify(data));
        }
    });
}

// 4. 统计记录数量
function onRequest(request, response, modules) {
    var db = modules.oData;
    db.count({
        "table": "GameScore",
        "where": {
            "level": {"$gt": 5}
        }
    }, function(err, data) {
        if(err) {
            response.send("统计失败: " + err.error);
        } else {
            response.send("总记录数: " + data);
        }
    });
}
```

> 💡 小贴士：在云函数中操作数据库时，要注意以下几点：
>
> 1. 使用modules.oData获取数据库操作对象
> 2. 查询条件支持多种运算符：$gt(大于)、$gte(大于等于)、$lt(小于)、$lte(小于等于)、$ne(不等于)等
> 3. 可以使用include实现关联查询，提高查询效率
> 4. 合理使用limit和skip实现分页查询

### 2. WebSocket实时数据

```javascript
// 1. 初始化WebSocket连接
let BmobSocketIo = new Bmob.Socket("你的Application ID");

// 2. 订阅表更新事件
BmobSocketIo.updateTable("GameScore");  // 订阅整个表的更新
BmobSocketIo.updateRow("GameScore", "3342e40e4f");  // 订阅特定行的更新
BmobSocketIo.deleteRow("GameScore", "1256e40e4f");  // 订阅行删除事件

// 3. 监听表更新事件
BmobSocketIo.onUpdateTable = function(tablename, data) {
    console.log('表更新：', tablename);
    console.log('更新数据：', data);
    // 处理表更新业务逻辑
};

// 4. 监听行更新事件
BmobSocketIo.onUpdateRow = function(tablename, objectId, data) {
    console.log('表名：', tablename);
    console.log('行ID：', objectId);
    console.log('更新数据：', data);
    // 处理行更新业务逻辑
};

// 5. 监听行删除事件
BmobSocketIo.onDeleteRow = function(tablename, objectId, data) {
    console.log('表名：', tablename);
    console.log('行ID：', objectId);
    console.log('删除数据：', data);
    // 处理行删除业务逻辑
};

// 6. 取消订阅示例
BmobSocketIo.unsubUpdateTable("GameScore");  // 取消表更新订阅
BmobSocketIo.unsubUpdateRow("GameScore", "3342e40e4f");  // 取消行更新订阅
BmobSocketIo.unsubDeleteRow("GameScore", "1256e40e4f");  // 取消行删除订阅
```

> 💡 小贴士：使用WebSocket实时数据功能时，需要注意：
>
> 1. 此功能需要单独付费，每月99元
> 2. 适用于需要实时数据同步的场景，如聊天室、订单状态监控等
> 3. 可以同时监听多个表或多行数据的变化
> 4. 建议在不需要时及时取消订阅，避免资源浪费

### 3. 批量数据操作

```javascript
// 批量更新示例
const query = Bmob.Query('tableName');
query.find().then(todos => {
  todos.set('aab', "Bmob后端云");
  todos.set('bb', 'Bmob后端云');
  todos.saveAll().then(res => {
    // 成功批量修改
    console.log(res,'ok')
  }).catch(err => {
    console.log(err)
  });
})
```

### 3. 短信发送

```javascript
let params = {
    mobilePhoneNumber: 'mobilePhoneNumber' //string
}
Bmob.requestSmsCode(params).then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});
```

## 三、企业级数据模型设计

### 1. 关系型数据模型

- 一对一关系处理
- 一对多关系设计
- 多对多关系优化

### 2. 非关系型数据存储

- JSON数据结构设计
- 文档型数据管理
- 键值对存储策略

### 3. 混合存储方案

- 冷热数据分离
- 分库分表策略
- 数据同步机制

## 四、高级查询技巧

### 1. 复杂查询优化

```javascript
// 多条件组合查询
const query = Bmob.Query('Order');
query.equalTo('status', 'pending');
query.containedIn('tags', ['vip', 'promotion']);
query.include('user', 'product');
query.find().then(orders => {
  console.log('查询结果：', orders);
});
```

### 2. 聚合查询应用

```javascript
// 分组统计查询
const query = Bmob.Query('Sales');
query.statTo("groupby", "createdAt");
query.statTo("sum", "price");
query.statTo("avg", "price");
query.find().then(results => {
  console.log('统计结果：', results);
});
```

## 五、安全机制深度解析

### 1. 数据访问控制

- 角色权限管理
- 字段级别权限
- API访问限制

### 2. 身份认证体系

- OAuth2.0集成
- 自定义登录认证
- Token管理机制

### 3. 防护措施

- SQL注入防御
- XSS攻击防护
- CSRF防护策略

## 六、性能优化实战

### 1. 查询性能优化

- 索引优化策略
- 查询计划分析
- 缓存命中率提升

### 2. 并发处理优化

- 连接池管理
- 任务队列设计
- 限流措施实现

### 3. 监控告警体系

- 性能指标监控
- 错误日志分析
- 告警机制配置

## 七、最佳实践案例

### 1. 云函数调用实战

```javascript
// 1. 客户端调用云函数 - 基础示例
let params = {
    funcName: 'getGameScores',
    data: {
        score: 80,
        level: 5
    }
};
Bmob.functions(params.funcName, params.data).then(function(response) {
    console.log('查询结果：', response);
}).catch(function(error) {
    console.log('查询失败：', error);
});

// 2. 客户端调用云函数 - 分页查询示例
let orderParams = {
    funcName: 'getUserOrders',
    data: {
        userId: 'user123',
        status: 'pending',
        page: 1,
        limit: 10
    }
};
Bmob.functions(orderParams.funcName, orderParams.data).then(function(response) {
    console.log('订单列表：', response);
}).catch(function(error) {
    console.log('获取失败：', error);
});

// 3. 云函数端处理查询请求示例
function onRequest(request, response, modules) {
    // 获取客户端传递的参数
    const params = request.body;
    const db = modules.oData;
    
    // 根据参数构建查询条件
    db.find({
        "table": "GameScore",
        "where": {
            "score": {"$gt": params.score},
            "level": {"$gte": params.level}
        },
        "limit": 10,
        "order": "-score"
    }, function(err, data) {
        if(err) {
            // 返回错误信息
            response.send({
                "code": 500,
                "error": err.error
            });
        } else {
            // 返回查询结果
            response.send({
                "code": 200,
                "data": data
            });
        }
    });
}
```

> 💡 小贴士：在使用云函数进行数据查询时，要注意以下几点：
>
> 1. 使用Bmob.functions()方法调用云函数，需要指定funcName和data参数
> 2. 云函数中要对客户端传入的参数进行验证和处理
> 3. 建议统一返回数据格式，包含状态码和数据/错误信息
> 4. 可以在云函数中进行更复杂的业务逻辑处理