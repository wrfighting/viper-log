const logger = require('./index')

var ss = { name: 'xixixixi' }

logger.setOptions({
    env: 'dev',
    publiclog: { key: 'pc', fileName: 'logs/public.log' },
    applog: { daysToKeep: 5, fileName: 'logs/all.log' },
})
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
        maxLength: 4,
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
