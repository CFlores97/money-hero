export function sanitizeUser(user) {
    if(!user ) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.created_at
    };
}