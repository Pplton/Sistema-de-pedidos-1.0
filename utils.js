// Utility functions
const utils = {
    // Format currency
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Log activity
    async logActivity(userId, action, description) {
        try {
            const activity = {
                userId,
                action,
                description,
                timestamp: new Date().toISOString()
            };
            await window.db.addData(window.db.STORES.ACTIVITIES, activity);
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
        }
    }
};

// Make utils available globally
window.utils = utils; 