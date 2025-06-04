// Database configuration
const DB_NAME = 'doceriaDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    USERS: 'users',
    STORES: 'stores',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    LOGS: 'logs'
};

// Initialize database
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(new Error('Erro ao abrir o banco de dados'));
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('username', 'username', { unique: true });
                userStore.createIndex('storeId', 'storeId', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.STORES)) {
                const storeStore = db.createObjectStore(STORES.STORES, { keyPath: 'id', autoIncrement: true });
                storeStore.createIndex('name', 'name', { unique: true });
            }

            if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
                const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id', autoIncrement: true });
                productStore.createIndex('categoryId', 'categoryId', { unique: false });
                productStore.createIndex('storeId', 'storeId', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
                const categoryStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id', autoIncrement: true });
                categoryStore.createIndex('storeId', 'storeId', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.ORDERS)) {
                const orderStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id', autoIncrement: true });
                orderStore.createIndex('storeId', 'storeId', { unique: false });
                orderStore.createIndex('status', 'status', { unique: false });
                orderStore.createIndex('pickupTime', 'pickupTime', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.LOGS)) {
                const logStore = db.createObjectStore(STORES.LOGS, { keyPath: 'id', autoIncrement: true });
                logStore.createIndex('timestamp', 'timestamp', { unique: false });
                logStore.createIndex('userId', 'userId', { unique: false });
            }

            // Create initial admin user
            const userStore = event.target.transaction.objectStore(STORES.USERS);
            userStore.add({
                username: 'admin',
                password: 'admin123', // In production, this should be hashed
                role: 'ADMIN',
                storeId: null,
                createdAt: new Date()
            });
        };
    });
};

// Generic function to add data to a store
const addData = (storeName, data) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Generic function to get data from a store
const getData = (storeName, id) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Generic function to update data in a store
const updateData = (storeName, id, data) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...data, id });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Generic function to delete data from a store
const deleteData = (storeName, id) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Function to get all data from a store
const getAllData = (storeName) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Function to authenticate user
const authenticateUser = (username, password) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(STORES.USERS, 'readonly');
            const store = transaction.objectStore(STORES.USERS);
            const index = store.index('username');
            const request = index.get(username);

            request.onsuccess = () => {
                const user = request.result;
                if (user && user.password === password) {
                    resolve(user);
                } else {
                    reject(new Error('Usuário ou senha inválidos'));
                }
            };
            request.onerror = () => reject(new Error('Erro ao autenticar usuário'));
        }).catch(reject);
    });
};

// Function to clear a store
const clearStore = (storeName) => {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
};

// Export functions
window.db = {
    initDB,
    addData,
    getData,
    updateData,
    deleteData,
    getAllData,
    authenticateUser,
    clearStore,
    STORES
}; 