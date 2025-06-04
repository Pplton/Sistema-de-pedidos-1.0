// State management
let currentUsers = [];
let currentStores = [];
let currentBackupSettings = {
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '00:00'
};

// Initialize admin interface
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication and role
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
        window.location.href = 'index.html';
        return;
    }

    // Set up navigation
    setupNavigation();
    
    // Load initial data
    await loadUsers();
    await loadStores();
    await loadBackupSettings();
    
    // Show users panel by default
    showPanel('users');

    // Initialize event listeners
    initializeEventListeners();
});

// Navigation setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const panel = item.dataset.panel;
            showPanel(panel);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Panel management
function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === panelId) {
            panel.classList.add('active');
        }
    });
}

// Users management
async function loadUsers() {
    try {
        currentUsers = await getAllData(STORES.USERS);
        displayUsers();
    } catch (error) {
        showMessage('Erro ao carregar usuários', 'error');
    }
}

function displayUsers() {
    const usersList = document.querySelector('#usersList');
    const storeFilter = document.querySelector('#userStore');
    const roleFilter = document.querySelector('#userRole');

    if (!usersList || !storeFilter || !roleFilter) return;

    const filteredUsers = currentUsers.filter(user => {
        const storeMatch = storeFilter.value === 'ALL' || user.storeId === storeFilter.value;
        const roleMatch = roleFilter.value === 'ALL' || user.role === roleFilter.value;
        return storeMatch && roleMatch;
    });

    usersList.innerHTML = filteredUsers.map(user => `
        <div class="user-card">
            <div class="user-info">
                <h3>${user.name}</h3>
                <p>${user.login}</p>
            </div>
            <span class="user-role role-${user.role.toLowerCase()}">${user.role}</span>
            <div class="user-actions">
                <button onclick="editUser('${user.id}')" class="btn btn-secondary">Editar</button>
                <button onclick="deleteUser('${user.id}')" class="btn btn-danger">Excluir</button>
            </div>
        </div>
    `).join('');
}

async function addUser(event) {
    event.preventDefault();
    const form = event.target;
    const userData = {
        name: form.name.value,
        login: form.login.value,
        password: form.password.value,
        role: form.role.value,
        storeId: form.store.value,
        createdAt: new Date().toISOString()
    };

    try {
        await addData(STORES.USERS, userData);
        await loadUsers();
        closeModal('add-user-modal');
        showMessage('Usuário adicionado com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao adicionar usuário', 'error');
    }
}

async function editUser(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (!user) return;

    const form = document.querySelector('#edit-user-form');
    form.name.value = user.name;
    form.login.value = user.login;
    form.role.value = user.role;
    form.store.value = user.storeId;
    form.dataset.userId = userId;

    openModal('edit-user-modal');
}

async function updateUser(event) {
    event.preventDefault();
    const form = event.target;
    const userId = form.dataset.userId;
    const userData = {
        name: form.name.value,
        login: form.login.value,
        role: form.role.value,
        storeId: form.store.value
    };

    if (form.password.value) {
        userData.password = form.password.value;
    }

    try {
        await updateData(STORES.USERS, userId, userData);
        await loadUsers();
        closeModal('edit-user-modal');
        showMessage('Usuário atualizado com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao atualizar usuário', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
        await deleteData(STORES.USERS, userId);
        await loadUsers();
        showMessage('Usuário excluído com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao excluir usuário', 'error');
    }
}

// Stores management
async function loadStores() {
    try {
        currentStores = await getAllData(STORES.STORES);
        displayStores();
        updateStoreFilters();
    } catch (error) {
        showMessage('Erro ao carregar lojas', 'error');
    }
}

function displayStores() {
    const storesList = document.querySelector('.stores-list');
    storesList.innerHTML = currentStores.map(store => `
        <div class="store-card">
            <div class="store-info">
                <h3>${store.name}</h3>
                <p>${store.address}</p>
                <p>${store.phone}</p>
                <p>${store.email}</p>
            </div>
            <div class="store-actions">
                <button onclick="editStore('${store.id}')" class="btn btn-secondary">Editar</button>
                <button onclick="deleteStore('${store.id}')" class="btn btn-danger">Excluir</button>
            </div>
        </div>
    `).join('');
}

function updateStoreFilters() {
    const storeFilters = document.querySelectorAll('.store-filter');
    storeFilters.forEach(filter => {
        filter.innerHTML = `
            <option value="all">Todas as lojas</option>
            ${currentStores.map(store => `
                <option value="${store.id}">${store.name}</option>
            `).join('')}
        `;
    });
}

async function addStore(event) {
    event.preventDefault();
    const form = event.target;
    const storeData = {
        name: form.name.value,
        address: form.address.value,
        phone: form.phone.value,
        email: form.email.value,
        createdAt: new Date().toISOString()
    };

    try {
        await addData(STORES.STORES, storeData);
        await loadStores();
        closeModal('add-store-modal');
        showMessage('Loja adicionada com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao adicionar loja', 'error');
    }
}

async function editStore(storeId) {
    const store = currentStores.find(s => s.id === storeId);
    if (!store) return;

    const form = document.querySelector('#edit-store-form');
    form.name.value = store.name;
    form.address.value = store.address;
    form.phone.value = store.phone;
    form.email.value = store.email;
    form.dataset.storeId = storeId;

    openModal('edit-store-modal');
}

async function updateStore(event) {
    event.preventDefault();
    const form = event.target;
    const storeId = form.dataset.storeId;
    const storeData = {
        name: form.name.value,
        address: form.address.value,
        phone: form.phone.value,
        email: form.email.value
    };

    try {
        await updateData(STORES.STORES, storeId, storeData);
        await loadStores();
        closeModal('edit-store-modal');
        showMessage('Loja atualizada com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao atualizar loja', 'error');
    }
}

async function deleteStore(storeId) {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;

    try {
        await deleteData(STORES.STORES, storeId);
        await loadStores();
        showMessage('Loja excluída com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao excluir loja', 'error');
    }
}

// Backup management
async function loadBackupSettings() {
    try {
        const settings = await getData(STORES.STORES, 'backup-settings');
        if (settings) {
            currentBackupSettings = settings;
            updateBackupSettings();
        }
    } catch (error) {
        showMessage('Erro ao carregar configurações de backup', 'error');
    }
}

function updateBackupSettings() {
    const form = document.querySelector('#backup-settings-form');
    form.autoBackup.checked = currentBackupSettings.autoBackup;
    form.backupFrequency.value = currentBackupSettings.backupFrequency;
    form.backupTime.value = currentBackupSettings.backupTime;
}

async function saveBackupSettings(event) {
    event.preventDefault();
    const form = event.target;
    const settings = {
        autoBackup: form.autoBackup.checked,
        backupFrequency: form.backupFrequency.value,
        backupTime: form.backupTime.value
    };

    try {
        await updateData(STORES.STORES, 'backup-settings', settings);
        currentBackupSettings = settings;
        showMessage('Configurações de backup salvas com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao salvar configurações de backup', 'error');
    }
}

async function createBackup() {
    try {
        const data = {
            users: await getAllData(STORES.USERS),
            stores: await getAllData(STORES.STORES),
            products: await getAllData(STORES.PRODUCTS),
            categories: await getAllData(STORES.CATEGORIES),
            orders: await getAllData(STORES.ORDERS),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage('Backup criado com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao criar backup', 'error');
    }
}

async function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const data = JSON.parse(await file.text());
        
        // Validate backup data
        if (!data.users || !data.stores || !data.products || !data.categories || !data.orders) {
            throw new Error('Formato de backup inválido');
        }

        // Clear existing data
        await clearStore(STORES.USERS);
        await clearStore(STORES.STORES);
        await clearStore(STORES.PRODUCTS);
        await clearStore(STORES.CATEGORIES);
        await clearStore(STORES.ORDERS);

        // Restore data
        for (const user of data.users) {
            await addData(STORES.USERS, user);
        }
        for (const store of data.stores) {
            await addData(STORES.STORES, store);
        }
        for (const product of data.products) {
            await addData(STORES.PRODUCTS, product);
        }
        for (const category of data.categories) {
            await addData(STORES.CATEGORIES, category);
        }
        for (const order of data.orders) {
            await addData(STORES.ORDERS, order);
        }

        await loadUsers();
        await loadStores();
        showMessage('Backup restaurado com sucesso', 'success');
    } catch (error) {
        showMessage('Erro ao restaurar backup', 'error');
    }
}

// Utility functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Initialize event listeners
function initializeEventListeners() {
    // Add User Form
    const addUserForm = document.querySelector('#addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', addUser);
    }

    // Edit User Form
    const editUserForm = document.querySelector('#editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', updateUser);
    }

    // Add Store Form
    const addStoreForm = document.querySelector('#addStoreForm');
    if (addStoreForm) {
        addStoreForm.addEventListener('submit', addStore);
    }

    // Edit Store Form
    const editStoreForm = document.querySelector('#editStoreForm');
    if (editStoreForm) {
        editStoreForm.addEventListener('submit', updateStore);
    }

    // Backup Settings Form
    const backupSettingsForm = document.querySelector('#backup-settings-form');
    if (backupSettingsForm) {
        backupSettingsForm.addEventListener('submit', saveBackupSettings);
    }

    // Store Filter
    const storeFilter = document.querySelector('#userStore');
    if (storeFilter) {
        storeFilter.addEventListener('change', displayUsers);
    }

    // Role Filter
    const roleFilter = document.querySelector('#userRole');
    if (roleFilter) {
        roleFilter.addEventListener('change', displayUsers);
    }

    // Restore Backup
    const restoreBackup = document.querySelector('#restoreFile');
    if (restoreBackup) {
        restoreBackup.addEventListener('change', (e) => restoreBackup(e.target.files[0]));
    }
}

// Modal functions
function showAddUserModal() {
    openModal('addUserModal');
}

function showAddStoreModal() {
    openModal('addStoreModal');
}

// Make functions available globally
window.showAddUserModal = showAddUserModal;
window.showAddStoreModal = showAddStoreModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editStore = editStore;
window.deleteStore = deleteStore;
window.createBackup = createBackup;
window.closeModal = closeModal; 