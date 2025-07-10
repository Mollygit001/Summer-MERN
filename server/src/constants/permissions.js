const permissions = {
    admin: [
        'user:create',
        'user:delete',
        'user:update',
        'user:read',
        'link:create',
        'link:update',
        'link:delete',
        'link:read',
        'payment:create',
    ],
    viewer: [
        'user:read',
        'link:read',
    ],
    developer: [
        'link:read'
    ]
}

export default permissions;