export function mapTransaction(row) {
    return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: Number(row.amount),
        categoryId: row.category_id,
        date: row.date,
        description: row.description,
        createdAt: row.created_at
    };
}

export function mapUser(row) { 
    if(!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        avatar: row.avatar,
        createdAt: row.created_at
    };
}



export function mapGoal(row) {
    const target = Number(row.target_amount);
    const current = Number(row.current_amount);

    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        targetAmount: target,
        currentAmount: current,
        deadline: row.deadline,
        status: row.status,
        percentageCompleted:
            target > 0
                ? Number(((current / target) * 100).toFixed(1))
                : 0
    };
}