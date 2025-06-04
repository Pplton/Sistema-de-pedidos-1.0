// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize database
        await window.db.init();
        
        // Setup login form
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginMessage = document.getElementById('loginMessage');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                if (!username || !password) {
                    utils.showNotification('Por favor, preencha todos os campos.', 'error');
                    return;
                }

                try {
                    // Tenta fazer login
                    const success = await utils.login(username, password);
                    
                    if (success) {
                        // Redireciona para o dashboard
                        window.location.href = 'dashboard.html';
                    } else {
                        // Mostra mensagem de erro
                        utils.showNotification('Usuário ou senha inválidos', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao fazer login:', error);
                    utils.showNotification('Erro ao fazer login. Tente novamente.', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        utils.showNotification('Erro ao inicializar o banco de dados', 'error');
    }
});

// Show message to user
function showMessage(message, type = 'error') {
    const messageElement = document.getElementById('loginMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// Check if user is logged in
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(user);
}

// Logout function
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Log activity
async function logActivity(userId, action, details) {
    try {
        await window.db.addData(window.db.STORES.LOGS, {
            userId,
            action,
            details,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Erro ao registrar atividade:', error);
    }
}

// Export utility functions
window.utils = {
    checkAuth,
    logout,
    formatCurrency,
    formatDate,
    logActivity,
    login: async (username, password) => {
        try {
            const user = await window.db.authenticateUser(username, password);
            
            if (!user) {
                throw new Error('Usuário ou senha inválidos');
            }

            // Store user session
            sessionStorage.setItem('user', JSON.stringify({
                id: user.id,
                name: user.username,
                login: user.username,
                role: user.role,
                storeId: user.storeId
            }));

            // Redirect based on user role
            switch (user.role) {
                case 'ADMIN':
                    window.location.href = 'admin.html';
                    break;
                case 'OWNER':
                case 'MANAGER':
                    window.location.href = 'dashboard.html';
                    break;
                case 'EMPLOYEE':
                    window.location.href = 'pdv.html';
                    break;
                default:
                    showMessage('Tipo de usuário inválido', 'error');
                    return false;
            }
            return true;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showMessage(error.message || 'Erro ao fazer login', 'error');
            return false;
        }
    },
    showNotification: function(message, type) {
        showMessage(message, type);
    }
}; 