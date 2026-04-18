
type RedisKeyDomain = 'cache'  | 'oauth' | 'ratelimit';

export type RedisKeyEntity = 
    'products:list' |
    'products:details' |
    'products:new' |
    'products:rated' |
    'categories:products' |
    'reviews' |
    'state:google' |
    'state:github' |
    'link:google' |
    'link:github' |
    'public:ip' |
    'otp:user'


export const getRedisKeys = (domain: RedisKeyDomain, entity: RedisKeyEntity, content: string) => {
    return `${domain}:${entity}:${content}`;
}