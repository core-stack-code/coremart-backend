
type RedisKeyDomain = 'cache' | 'session' | 'ratelimit' | 'otp' | 'oauth';

type RedisKeyEntity = 
    'products:list' |
    'products:details' |
    'categories:products' |
    'reviews'


export const getRedisKeys = (domain: RedisKeyDomain, entity: RedisKeyEntity, content: string) => {
    switch (domain) {
        case 'cache':
            return `cache:${entity}:${content}`;
        default:
            return 'unknown';
    }
}