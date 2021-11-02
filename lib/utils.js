const { v4: uuid } = require('uuid')
const os = require('os')
const dayjs = require('dayjs')
const _ = require('lodash')

module.exports = {
    genUUid() {
        return uuid().replace(/-/g, '')
    },
    getHostIp() {
        let address = ''
        let interfaces = os.networkInterfaces()
        for (let key in interfaces) {
            let iface = interfaces[key].filter(details => {
                return details.family === 'IPv4' && details.internal === false
            })
            if (iface.length > 0) address = iface[0].address
        }
        return address
    },
    getExec() {
        const tmp = new Error().stack.split('\n')[5]
        const execFilename = tmp && tmp.replace(/^\s+/, '')
        return execFilename
    },
    getTraceId(reqHeader, k = 'traceid') {
        if (reqHeader && reqHeader[k]) {
            return reqHeader[k]
        } else {
            const gentid = this.genUUid()
            reqHeader[k] = gentid
            return gentid
        }
    },
    getSpanId(reqHeader, k = 'spanid') {
        if (reqHeader && reqHeader[k]) {
            return reqHeader[k]
        } else {
            return this.genUUid()
        }
    },
    getClientIp(ctx) {
        let req = ctx.req || ctx
        let ipAddress =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection &&
                req.connection.socket &&
                req.connection.socket.remoteAddress)
        return ipAddress ? ipAddress.split(',')[0] : ''
    },
    getUserName(ctx) {
        return ctx.username || (ctx.session && ctx.session.username) || ''
    },
    formatPrint(str, arr) {
        let result = str
        if (_.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                const [k, v] = arr[i]
                k && !_.isUndefined(v) && (result += `||${k}=${v}`)
            }
        } else if (_.isObject(arr)) {
            for (let k in arr) {
                k && !_.isUndefined(arr[k]) && (result += `||${k}=${arr[k]}`)
            }
        }
        return result
    },
    setLogConfigValue(config, ck, cv) {
        if (ck.includes('.')) {
            _.set(config, `appenders.${ck}`, cv)
        } else {
            for (let key in config['appenders']) {
                if (config['appenders'][key]) {
                    config['appenders'][key][ck] = cv
                }
            }
        }
    },
    createGoodLog(
        level,
        str,
        {
            agent_url = '',
            agent_method = 'get',
            agent_data = {},
            agent_res = {},
            agent_ttl = '',
            agent_code = '',
            maxLength = 0,
        } = {},
        {
            traceid = '',
            spanid = '',
            localip = '',
            remoteip = '',
            extraStr = '',
            logPrefix = '_undef',
        } = {}
    ) {
        const normal = [
            ['traceid', traceid],
            ['spanid', spanid],
            ['pid', process.pid],
            ['localIp', localip],
            ['remote_addr', remoteip],
        ]

        let logStr = this.formatPrint(
            `[${level}][${dayjs().format(
                'YYYY-MM-DDTHH:mm:ss.SSSZ'
            )}][default:${this.getExec()}] ${logPrefix}`,
            normal
        )
        extraStr && (logStr += `||${extraStr}`)

        if (agent_url) {
            if (maxLength > 0) {
                agent_res = _.truncate(JSON.stringify(agent_res), {
                    length: maxLength + 3,
                })
            } else {
                agent_res = JSON.stringify(agent_res)
            }
            const agent = [
                ['agent_url', agent_url],
                ['agent_method', agent_method],
                ['agent_data', JSON.stringify(agent_data)],
                ['agent_res', agent_res],
                ['agent_ttl', agent_ttl],
                ['agent_code', agent_code],
            ]

            logStr += this.formatPrint('', agent)
        }
        str && (logStr += `||msg=${str}`)
        return logStr
    },
}
