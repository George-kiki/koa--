const http = require('http');
function compose (middlewareList) {  // 组合中间件函数
  return (ctx) => {  // 返回ctx函数
    function dispatch (i) { // next 执行函数
      const fn = middlewareList[i] // 执行第几个中间
      try {
        return Promise.resolve( // 保持async await 这种语法模式 所以返回的都是Promise函数
          fn(ctx,dispatch.bind(null, i + 1)) // 执行完第一个中间件后开始就是第一个中间+1的顺序往后执行 所以这里的 参数变成了 i+1
        )
      }catch (e) {
        return Promise.reject(e)
      }
    }
    return dispatch(0)  // 初始化开始执行第一个中间件
  }
}

class KoaLike {
  constructor () { // 初始化注册中间件数组
    this.middlewareList = []
  }
  use (fn) { // 注册中间件 fn就是被注册的中间件
    this.middlewareList.push(fn)
    return this // 返回this是为链式调用 比如 app.use(xxx).use(aaa)
  }
  static createContent (req, res ) { //合并req,res 并返回ctx
    const ctx = {
      req,
      res
    }
    ctx.query = req.query
    return ctx
  }
  static handleReq(ctx, fn) {
    return fn(ctx)
  }
  callback () {
    const fn = compose(this.middlewareList) // 拿到第一个执行的中间件
    return (req,res) => {
      const ctx = KoaLike.createContent(req,res) // 拿到合并的ctx
      return  KoaLike.handleReq(ctx,fn) // 返回当前执行的中间件
    }
  }
  listen (...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

module.exports = KoaLike
