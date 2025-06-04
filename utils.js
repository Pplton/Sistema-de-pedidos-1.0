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
    },

    // Verificar autenticação
    checkAuth() {
        const isLoginPage = window.location.pathname.includes('index.html');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuthenticated && !isLoginPage) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (isAuthenticated && isLoginPage) {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    },

    // Login
    async login(username, password) {
        try {
            const user = await window.db.getUser(username);
            if (user && user.password === password) {
                // Salva o usuário na sessão
                sessionStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    storeId: user.storeId,
                    role: user.role
                }));
                
                // Carrega o tema da loja
                await this.loadStoreTheme(user.storeId);
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    },

    // Logout
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Inicializar página
    initPage() {
        if (this.checkAuth()) {
            const currentUser = localStorage.getItem('currentUser');
            const userElement = document.getElementById('currentUser');
            if (userElement && currentUser) {
                userElement.textContent = `Olá, ${currentUser}`;
            }
        }
    },

    // Funções de tema
    async loadStoreTheme(storeId) {
        try {
            const theme = await window.db.getStoreTheme(storeId);
            if (theme) {
                this.applyTheme(theme);
            }
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
        }
    },
    
    applyTheme(theme) {
        // Aplica as cores do tema
        document.documentElement.style.setProperty('--store-primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--store-primary-light', theme.primaryLight);
        document.documentElement.style.setProperty('--store-primary-dark', theme.primaryDark);
        document.documentElement.style.setProperty('--store-secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--store-secondary-light', theme.secondaryLight);
        document.documentElement.style.setProperty('--store-secondary-dark', theme.secondaryDark);
        document.documentElement.style.setProperty('--store-accent-color', theme.accentColor);
        document.documentElement.style.setProperty('--store-accent-light', theme.accentLight);
        document.documentElement.style.setProperty('--store-accent-dark', theme.accentDark);
        
        // Adiciona a classe de tema personalizado
        document.body.classList.add('theme-custom');
        
        // Atualiza o logo e nome da loja se fornecidos
        if (theme.logo) {
            const logoElement = document.querySelector('.logo-icon');
            if (logoElement) {
                logoElement.style.backgroundImage = `url(${theme.logo})`;
                logoElement.style.backgroundSize = 'contain';
                logoElement.style.backgroundRepeat = 'no-repeat';
                logoElement.style.backgroundPosition = 'center';
            }
        }
        
        if (theme.storeName) {
            const storeNameElement = document.querySelector('.store-name');
            if (storeNameElement) {
                storeNameElement.textContent = theme.storeName;
            }
        }
    },

    getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    isAuthenticated() {
        return !!this.getCurrentUser();
    }
};

// Make utils available globally
window.utils = utils;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    utils.initPage();
}); 