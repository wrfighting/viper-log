# viper-log

viper-log是一个基于log4js的日志工具，能够打印出符合标准规范的日志，并且也可以自定义某些日志格式
````
[INFO][2021-11-03T00:16:27.952+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:10:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||msg=haha
[INFO][2021-11-03T00:16:27.960+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:11:8)] hahahaha||traceid=||spanid=||pid=34187||localIp=||remote_addr=||iu||agent_url=111||agent_method=post||agent_data={"name":"hehe"}||agent_res={"name":"xixixixi"}||agent_ttl=11ms||agent_code=200||msg=haha
[WARN][2021-11-03T00:16:27.961+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:24:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||msg=haha
[WARN][2021-11-03T00:16:27.962+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:25:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||iu||agent_url=111||agent_method=post||agent_data={"name":"hehe"}||agent_res={"name":"xixixixi"}||agent_ttl=11ms||agent_code=200||msg=haha
[ERROR][2021-11-03T00:16:27.962+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:38:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||msg=haha
[ERROR][2021-11-03T00:16:27.963+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:39:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||iu||agent_url=111||agent_method=post||agent_data={"name":"hehe"}||agent_res={"na...||agent_ttl=11ms||agent_code=200||msg=haha
[FATAL][2021-11-03T00:16:27.964+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:53:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||msg=haha
[FATAL][2021-11-03T00:16:27.965+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:54:8)] _undef||traceid=||spanid=||pid=34187||localIp=||remote_addr=||iu||agent_url=111||agent_method=post||agent_data={"name":"hehe"}||agent_res={"name":"xixixixi"}||agent_ttl=11ms||agent_code=200||msg=haha

````

## 安装 ##

````
npm install --save viper-log
````
## 说明 ##
1. 所有等级的日志都打到一个日志文件all.log(可以自定义文件路径和文件名)，默认按天切割all.log.yyyy-MM-dd。都放all.log是因为服务端日志一般会配合实时日志采集（kafka -> es），提取日志会更加方便，输出的日志符合规范，提取字段也会简单很多
2. 提供public.log(可以自定义文件路径和文件名)，默认按小时切割publiclog.log.yyyyMMddhh，publiclog是业务埋点日志，一般用于离线采集（以小时为单位）到hive表中，进行离线分析

## 基本使用

```javascript
const Koa = require('koa')
const logger = require('viper-log')
const path = require('path')

const app = new Koa()

logger.setOptions({
    env: process.env.NODE_ENV,
    logToConsole: false, //日志内容是否输出到控制台，不输出到文件，默认false
    pm2: false, // 如果采用pm2启动建议开启true，默认false
    compress: false, //是否压缩 默认false
    applog: {
        fileName: path.join(__dirname, '../log/all.log'),
        daysToKeep: 3, //默认3
    },
    publiclog: {
        fileName: path.join(__dirname, '../log/publiclog/publiclog.log'),
        daysToKeep: 48, //默认60
    },
    extraOptions: undefined, //支持覆盖所有默认配置，格式为log4js的配置格式，不建议使用，默认undefined
})

app.use(
    logger.initLogKoa({
        skipUrl: ['/api/abc'], //支持配置某些url不打印日志
        skipMethod: ['OPTIONS'], //支持配置某些method不打印日志
        traceidKey: 'xxx', //支持配置请求header里的traceid字段，默认traceid
        spanidKey: 'xxx', //支持配置请求header里的spanid字段，默认spanid
        userNameKey: 'xxx', //支持配置ctx/ctx.session/ctx.headers的userName字段，默认username
    })
)
// express使用以下方法
app.use(
    logger.initLogExpress({
        skipUrl: ['/api/abc'], //支持配置某些url不打印日志
        skipMethod: ['OPTIONS'], //支持配置某些method不打印日志
        traceidKey: 'xxx', //支持配置请求header里的traceid字段，默认traceid
        spanidKey: 'xxx', //支持配置请求header里的spanid字段，默认spanid
        userNameKey: 'xxx', //支持配置ctx/ctx.session/ctx.headers的userName字段，默认username
    })
)

//可以直接调用logger的静态方法
logger.log('haha')
//第二个参数agent用于打印请求下游接口的信息，这样日志内容方便排查请求链路问题
//日志内容如下
//[INFO][2021-11-03T00:16:27.960+08:00][default:at Object.<anonymous> (/Users/haha/project/viper-log/test.js:11:8)] hahahaha||traceid=||spanid=||pid=34187||localIp=||remote_addr=||iu||agent_url=111||agent_method=post||agent_data={"name":"hehe"}||agent_res={"name":"xixixixi"}||agent_ttl=11ms||agent_code=200||msg=haha
logger.log('haha')
logger.log(
    'haha',
    {
        agent_url: '111',
        agent_method: 'post',
        agent_data: { name: 'hehe' },
        agent_res: ss,
        agent_ttl: '11ms',
        agent_code: 200,
    },
    { extraStr: 'iu', logPrefix: 'hahahaha' }
)

logger.warn('haha')
logger.warn(
    'haha',
    {
        agent_url: '111',
        agent_method: 'post',
        agent_data: { name: 'hehe' },
        agent_res: ss,
        agent_ttl: '11ms',
        agent_code: 200,
    },
    { extraStr: 'iu' }
)

logger.error('haha')
logger.error(
    'haha',
    {
        agent_url: '111',
        agent_method: 'post',
        agent_data: { name: 'hehe' },
        agent_res: ss,
        agent_ttl: '11ms',
        maxLength: 4, //支持截断agent下游返回的日志内容，防止日志内容过多
        agent_code: 200,
    },
    { extraStr: 'iu' }
)

logger.fatal('haha')
logger.fatal(
    'haha',
    {
        agent_url: '111',
        agent_method: 'post',
        agent_data: { name: 'hehe' },
        agent_res: ss,
        agent_ttl: '11ms',
        agent_code: 200,
    },
    { extraStr: 'iu' }
)

logger.outPublicLog('=======', 'hahahahapublic')
logger.outPublicLogFormat([['name', 'haha'], ['age', 12]])
logger.outPublicLogFormat({
    job: 'boss',
    city: 'haha'
})

/**
 * 在initLogKoa或者initLogExpress后
 * 也可以从ctx.logger 对应到koa 或者 req.logger 对应到express 中拿到log实例
 * 然后调用ctx.logger.log('xxx') 打印日志，能够调用的实例方法见上面的静态方法，所有的静态方法都可以在实例方法调用
 * 通过实例调用会带有请求运行时的内容，traceid、请求url等，所以尽量使用ctx.logger来打印日志内容
 */
```