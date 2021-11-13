const log4js = require('log4js')
const dayjs = require('dayjs')
const _ = require('lodash')

const utils = require('./utils')

let logConfig = {
    appenders: {
        applog: {
            type: 'dateFile',
            filename: 'logs/all.log',
            pattern: 'yyyy-MM-dd',
            daysToKeep: 3,
            layout: {
                type: 'pattern',
                pattern: '%m',
            },
        },
        publiclog: {
            type: 'dateFile',
            filename: 'logs/publiclog/public.log',
            pattern: 'yyyyMMddhh',
            daysToKeep: 60,
            layout: {
                type: 'pattern',
                pattern: '%m',
            },
        },
    },
    categories: {
        default: { appenders: ['applog'], level: 'DEBUG' },
        publiclog: { appenders: ['publiclog'], level: 'DEBUG' },
    },
}

var appLogger = console
var publicLogger = null

class ViperLog {
    constructor(context) {
        const {
            traceid,
            spanid,
            localip,
            remoteip,
            method,
            uri,
            userName,
            referer,
            query,
            body,
        } = context
        this.traceid = traceid || utils.genUUid()
        this.localip = localip || ''
        this.remoteip = remoteip || ''
        this.spanid = spanid || utils.genUUid()
        this.method = method
        this.uri = uri
        this.userName = userName
        this.referer = referer || ''
        this.query = query || {}
        this.body = body || {}
        this.info = this.info.bind(this)
        this.warn = this.warn.bind(this)
        this.error = this.error.bind(this)
        this.fatal = this.fatal.bind(this)
        this.formatPrint = utils.formatPrint
        this.getExec = utils.getExec
    }

    reqIn() {
        const m = [
            ['traceid', this.traceid],
            ['spanid', this.spanid],
            ['pid', process.pid],
            ['localIp', this.localip],
            ['remote_addr', this.remoteip],
            ['method', this.method],
            ['uri', this.uri],
            ['userName', this.userName],
            ['referer', this.referer],
            ['query', JSON.stringify(this.query)],
            ['body', JSON.stringify(this.body)],
        ]
        appLogger.info(
            utils.formatPrint(
                `[INFO][${dayjs().format(
                    'YYYY-MM-DDTHH:mm:ss.SSSZ'
                )}][default:] _com_request_in`,
                m
            )
        )
    }

    reqOut({ code, proc_time, contentLength }) {
        const m = [
            ['traceid', this.traceid],
            ['spanid', this.spanid],
            ['pid', process.pid],
            ['localIp', this.localip],
            ['remote_addr', this.remoteip],
            ['method', this.method],
            ['uri', this.uri],
            ['code', code],
            ['proc_time', proc_time],
            ['contentLength', contentLength],
            ['userName', this.userName],
            ['referer', this.referer],
        ]
        appLogger.info(
            utils.formatPrint(
                `[INFO][${dayjs().format(
                    'YYYY-MM-DDTHH:mm:ss.SSSZ'
                )}][default:] _com_request_out`,
                m
            )
        )
    }

    info(str, agent, normal) {
        printLevelLog.call(this, 'INFO', str, agent, normal)
    }

    log(str, agent, normal) {
        printLevelLog.call(this, 'INFO', str, agent, normal)
    }

    warn(str, agent, normal) {
        printLevelLog.call(this, 'WARN', str, agent, normal)
    }

    error(str, agent, normal) {
        printLevelLog.call(this, 'ERROR', str, agent, normal)
    }

    fatal(str, agent, normal) {
        printLevelLog.call(this, 'FATAL', str, agent, normal)
    }

    outPublicLog(str, myPublicLogKey = '') {
        if (!myPublicLogKey) {
            myPublicLogKey = ViperLog.publicLogKey
        }
        if (publicLogger) {
            publicLogger.info(
                `${myPublicLogKey}||timestamp=${dayjs().format(
                    'YYYY-MM-DD HH:mm:ss'
                )}||${str}`
            )
        }
    }

    outPublicLogFormat(m = [], myPublicLogKey = '') {
        if (!myPublicLogKey) {
            myPublicLogKey = ViperLog.publicLogKey
        }
        if (publicLogger) {
            publicLogger.info(utils.formatPrint(`${myPublicLogKey}||timestamp=${dayjs().format(
                'YYYY-MM-DD HH:mm:ss'
            )}`, m))
        }
    }
}

ViperLog.setOptions = (opts = {}) => {
    const {
        env,
        pm2,
        compress,
        extraOptions,
        logToConsole,
        applog,
        publiclog,
    } = opts
    logToConsole && (ViperLog.console = true)
    pm2 && (logConfig['pm2'] = true) && (logConfig['pm2InstanceVar'] = 'INSTANCE_ID')
    ViperLog.publicLogKey = ''
    ViperLog.nowEnv = env
    if (!publiclog) {
        delete logConfig['appenders']['publiclog']
        delete logConfig['categories']['publiclog']
        ViperLog.publiclog = false
    } else {
        if (_.isObject(publiclog) && publiclog.key) {
            ViperLog.publicLogKey = publiclog.key
        }
        ViperLog.publicLog = true
    }

    ViperLog.console && utils.setLogConfigValue(logConfig, 'type', 'stdout')
    if (compress && _.isBoolean(compress)) {
        utils.setLogConfigValue(logConfig, 'applog.compress', compress)
        utils.setLogConfigValue(logConfig, 'publiclog.compress', compress)
    }
    applog.daysToKeep &&
        utils.setLogConfigValue(
            logConfig,
            'applog.daysToKeep',
            applog.daysToKeep
        )
    publiclog &&
        publiclog.daysToKeep &&
        utils.setLogConfigValue(
            logConfig,
            'publiclog.daysToKeep',
            publiclog.daysToKeep
        )
    applog.fileName && (logConfig.appenders.applog.filename = applog.fileName)
    publiclog &&
        publiclog.fileName &&
        (logConfig.appenders.publiclog.filename = publiclog.fileName)
    extraOptions && (logConfig = extraOptions)

    log4js.configure(logConfig)
    appLogger = log4js.getLogger('app')
    publicLogger = log4js.getLogger('publiclog')
}

ViperLog.log = (str, agent, normal) => {
    printLevelLog('INFO', str, agent, normal, false)
}

ViperLog.info = (str, agent, normal) => {
    printLevelLog('INFO', str, agent, normal, false)
}

ViperLog.warn = (str, agent, normal) => {
    printLevelLog('WARN', str, agent, normal, false)
}

ViperLog.error = (str, agent, normal) => {
    printLevelLog('ERROR', str, agent, normal, false)
}

ViperLog.fatal = (str, agent, normal) => {
    printLevelLog('FATAL', str, agent, normal, false)
}

ViperLog.initLogKoa = function (options = {}) {
    return async function (ctx, next) {
        const { skipUrl = [], skipMethod = [], traceidKey, spanidKey, userNameKey } = options
        let headers = ctx.headers
        ctx.logger = new ViperLog({
            traceid: utils.getTraceId(headers, traceidKey),
            spanid: utils.getSpanId(headers, spanidKey),
            remoteip: utils.getClientIp(ctx),
            localip: utils.getHostIp(),
            method: ctx.method,
            uri: ctx.url,
            userName: utils.getUserName(ctx, userNameKey),
            referer: options.noReferer ? '' : ctx.request.header.referer,
            query: ctx.query,
            body: ctx.request.body,
        })
        if (skipUrl.includes(ctx.url) || skipMethod.includes(ctx.method)) {
            return next()
        }
        let start = new Date()
        ctx.logger.reqIn()

        await next()

        const writeHead = ctx.writeHead || (ctx.res && ctx.res.writeHead)
        const realRes = ctx.writeHead ? ctx : ctx.res

        realRes.writeHead = (code, headers) => {
            realRes.writeHead = writeHead
            realRes.writeHead(code, headers)
            realRes.__statusCode = code
            realRes.__headers = headers || {}
        }

        realRes.on('finish', () => {
            let responseTime = new Date() - start
            ctx.logger.reqOut({
                code: ctx.res.statusCode,
                proc_time: responseTime,
                contentLength: ctx.res._contentLength,
            })
        })
    }
}

ViperLog.initLogExpress = function (options = {}) {
    return function (req, res, next) {
        const { skipUrl = [], skipMethod = [], traceidKey, spanidKey, userNameKey } = options
        let headers = req.headers
        req.logger = new ViperLog({
            traceid: utils.getTraceId(headers, traceidKey),
            spanid: utils.getSpanId(headers, spanidKey),
            remoteip: utils.getClientIp(req),
            localip: utils.getHostIp(),
            method: req.method,
            uri: req.url,
            userName: utils.getUserName(req, userNameKey),
            referer: options.noReferer ? '' : headers.referer,
            query: req.query,
            body: req.body,
        })
        if (skipUrl.includes(req.url) || skipMethod.includes(req.method)) {
            return next()
        }
        let start = new Date()
        req.logger.reqIn()
        const writeHead = req.writeHead || res.writeHead
        const realRes = res

        realRes.writeHead = (code, headers) => {
            realRes.writeHead = writeHead
            realRes.writeHead(code, headers)
            realRes.__statusCode = code
            realRes.__headers = headers || {}
        }

        realRes.on('finish', () => {
            let responseTime = new Date() - start
            req.logger.reqOut({
                code: res.statusCode,
                proc_time: responseTime,
                contentLength: res._contentLength,
            })
        })

        next()
    }
}

function printLevelLog(level, str, agent, normal, bind = true) {
    let logStr = bind
        ? utils.createGoodLog.call(this, level, str, agent, normal)
        : utils.createGoodLog(level, str, agent, normal)
    appLogger.error(logStr)
}

ViperLog.outPublicLog = (str, myPublicLogKey = '') => {
    if (!myPublicLogKey) {
        myPublicLogKey = ViperLog.publicLogKey
    }
    if (publicLogger) {
        publicLogger.info(
            `${myPublicLogKey}||timestamp=${dayjs().format(
                'YYYY-MM-DD HH:mm:ss'
            )}||${str}`
        )
    }
}

ViperLog.outPublicLogFormat = (m = [], myPublicLogKey = '') => {
    if (!myPublicLogKey) {
        myPublicLogKey = ViperLog.publicLogKey
    }
    if (publicLogger) {
        publicLogger.info(utils.formatPrint(`${myPublicLogKey}||timestamp=${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
        )}`, m))
    }
}

module.exports = ViperLog
