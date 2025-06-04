// Database configuration
const DB = {
    // Nomes dos arquivos JSON
    FILES: {
        USERS: 'data/users.json',
        STORES: 'data/stores.json',
        PRODUCTS: 'data/products.json',
        CATEGORIES: 'data/categories.json',
        ORDERS: 'data/orders.json',
        THEMES: 'data/themes.json'
    },

    // Inicializa o banco de dados
    async init() {
        try {
            // Verifica se a pasta data existe
            if (!await this.checkDataFolder()) {
                await this.createDataFolder();
            }

            // Verifica se os arquivos existem, se não, cria com dados padrão
            await this.initializeFiles();
            return true;
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            throw error;
        }
    },

    // Verifica se a pasta data existe
    async checkDataFolder() {
        try {
            const response = await fetch('data/');
            return response.ok;
        } catch {
            return false;
        }
    },

    // Cria a pasta data
    async createDataFolder() {
        try {
            await fetch('data/', { method: 'POST' });
        } catch (error) {
            console.error('Erro ao criar pasta data:', error);
            throw error;
        }
    },

    // Inicializa os arquivos com dados padrão
    async initializeFiles() {
        // Dados padrão para usuários
        const defaultUsers = [
            {
                username: 'admin',
                password: 'admin123',
                storeId: 'default',
                role: 'admin'
            }
        ];

        // Dados padrão para lojas
        const defaultStores = [
            {
                id: 'default',
                name: 'EvoApps',
                theme: {
                    primaryColor: '#1a237e',
                    primaryLight: '#534bae',
                    primaryDark: '#000051',
                    secondaryColor: '#2196f3',
                    secondaryLight: '#6ec6ff',
                    secondaryDark: '#0069c0',
                    accentColor: '#00bcd4',
                    accentLight: '#62efff',
                    accentDark: '#008ba3'
                }
            }
        ];

        // Cria os arquivos se não existirem
        await this.saveToJSON(this.FILES.USERS, defaultUsers);
        await this.saveToJSON(this.FILES.STORES, defaultStores);
        await this.saveToJSON(this.FILES.PRODUCTS, []);
        await this.saveToJSON(this.FILES.CATEGORIES, []);
        await this.saveToJSON(this.FILES.ORDERS, []);
        await this.saveToJSON(this.FILES.THEMES, []);
    },

    // Salva dados em um arquivo JSON
    async saveToJSON(file, data) {
        try {
            const response = await fetch(file, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.error(`Erro ao salvar em ${file}:`, error);
            throw error;
        }
    },

    // Lê dados de um arquivo JSON
    async readFromJSON(file) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro ao ler de ${file}:`, error);
            return [];
        }
    },

    // Funções específicas para cada tipo de dado
    async getUser(username) {
        const users = await this.readFromJSON(this.FILES.USERS);
        return users.find(user => user.username === username);
    },

    async getStoreTheme(storeId) {
        const themes = await this.readFromJSON(this.FILES.THEMES);
        return themes.find(theme => theme.storeId === storeId);
    },

    async saveUser(user) {
        const users = await this.readFromJSON(this.FILES.USERS);
        const index = users.findIndex(u => u.username === user.username);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        return await this.saveToJSON(this.FILES.USERS, users);
    },

    async saveStore(store) {
        const stores = await this.readFromJSON(this.FILES.STORES);
        const index = stores.findIndex(s => s.id === store.id);
        if (index >= 0) {
            stores[index] = store;
        } else {
            stores.push(store);
        }
        return await this.saveToJSON(this.FILES.STORES, stores);
    },

    async saveTheme(theme) {
        const themes = await this.readFromJSON(this.FILES.THEMES);
        const index = themes.findIndex(t => t.storeId === theme.storeId);
        if (index >= 0) {
            themes[index] = theme;
        } else {
            themes.push(theme);
        }
        return await this.saveToJSON(this.FILES.THEMES, themes);
    }
};

// Exporta o objeto DB para uso global
window.db = DB; 