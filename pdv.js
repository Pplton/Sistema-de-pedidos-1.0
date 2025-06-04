// PDV State Management
let currentOrder = {
    items: [],
    customer: {
        name: '',
        phone: '',
        pickupTime: ''
    },
    status: 'PENDING',
    total: 0,
    subtotal: 0
};

let currentCategory = null;
let products = [];
let categories = [];
let productQuantities = {};
let currentStore = null;
let currentUser = null;

// Initialize PDV
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load initial data
        await loadCategories();
        await loadProducts();
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        showMessage('Erro ao inicializar o PDV', 'error');
    }
});

// Load categories
async function loadCategories() {
    try {
        categories = await window.db.getAllData(window.db.STORES.CATEGORIES);
        displayCategories(categories);
    } catch (error) {
        showMessage('Erro ao carregar categorias', 'error');
    }
}

// Display categories
function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    categoriesList.innerHTML = categories.map(category => `
        <button class="category-item" onclick="filterByCategory('${category.id}')">
            ${category.name}
        </button>
    `).join('');
}

// Load products
async function loadProducts() {
    try {
        products = await window.db.getAllData(window.db.STORES.PRODUCTS);
        displayProducts(products);
    } catch (error) {
        showMessage('Erro ao carregar produtos', 'error');
    }
}

// Filter products by category and search
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(product => {
        const matchesCategory = !currentCategory || product.categoryId === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    displayProducts(filteredProducts);
}

// Display products in list and grid
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsList || !productsGrid) return;

    // Display in list format
    productsList.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${window.utils.formatCurrency(product.price)}</div>
            </div>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button onclick="updateProductQuantity(${product.id}, ${(productQuantities[product.id] || 1) - 1})">-</button>
                    <span>${productQuantities[product.id] || 1}</span>
                    <button onclick="updateProductQuantity(${product.id}, ${(productQuantities[product.id] || 1) + 1})">+</button>
                </div>
                <button class="add-to-cart" onclick="addToOrder(${product.id}, ${productQuantities[product.id] || 1})">
                    Adicionar
                </button>
            </div>
        </div>
    `).join('');

    // Display in grid format
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}" data-category-id="${product.categoryId}">
            <h3>${product.name}</h3>
            <p class="price">${window.utils.formatCurrency(product.price)}</p>
        </div>
    `).join('');

    // Add click event to grid products
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => addToOrder(card.dataset.id, 1));
    });
}

// Update product quantity
function updateProductQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    productQuantities[productId] = newQuantity;
    
    // Update quantity display
    const quantitySpan = document.querySelector(`.product-item[data-id="${productId}"] .quantity-selector span`);
    if (quantitySpan) {
        quantitySpan.textContent = newQuantity;
    }
}

// Filter by category
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    filterProducts();
}

// Add product to order
function addToOrder(productId, quantity = 1) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingItem = currentOrder.items.find(item => item.productId === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentOrder.items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    // Reset quantity after adding to order
    productQuantities[productId] = 1;
    updateOrderDisplay();
    showMessage('Produto adicionado ao pedido', 'success');
}

// Update order display
function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    if (!orderItems || !subtotalElement || !totalElement) return;

    currentOrder.subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    currentOrder.total = currentOrder.subtotal;

    orderItems.innerHTML = currentOrder.items.map(item => `
        <div class="order-item">
            <div class="item-info">
                <span>${item.name}</span>
                <span>${window.utils.formatCurrency(item.price)}</span>
            </div>
            <div class="item-quantity">
                <button onclick="updateItemQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateItemQuantity(${item.productId}, ${item.quantity + 1})">+</button>
            </div>
            <button onclick="removeItem(${item.productId})" class="btn-danger">×</button>
        </div>
    `).join('');

    subtotalElement.textContent = window.utils.formatCurrency(currentOrder.subtotal);
    totalElement.textContent = window.utils.formatCurrency(currentOrder.total);
}

// Update item quantity
function updateItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeItem(productId);
        return;
    }

    const item = currentOrder.items.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        updateOrderDisplay();
    }
}

// Remove item from order
function removeItem(productId) {
    currentOrder.items = currentOrder.items.filter(item => item.productId !== productId);
    updateOrderDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Authentication form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }
}

// Validate order
function validateOrder() {
    const customerName = document.getElementById('customerName').value;
    if (!customerName) {
        showMessage('Nome do cliente é obrigatório', 'error');
        return false;
    }

    if (currentOrder.items.length === 0) {
        showMessage('Adicione itens ao pedido', 'error');
        return false;
    }

    currentOrder.customer.name = customerName;
    currentOrder.customer.phone = document.getElementById('customerPhone').value;
    return true;
}

// Save order
async function saveOrder() {
    if (!validateOrder()) return;

    try {
        const orderData = {
            ...currentOrder,
            createdAt: new Date().toISOString()
        };

        await window.db.addData(window.db.STORES.ORDERS, orderData);
        showMessage('Pedido salvo com sucesso', 'success');
        clearOrder();
    } catch (error) {
        showMessage('Erro ao salvar pedido', 'error');
    }
}

// Clear order
function clearOrder() {
    currentOrder = {
        items: [],
        customer: {
            name: '',
            phone: '',
            pickupTime: ''
        },
        status: 'PENDING',
        total: 0,
        subtotal: 0
    };

    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    updateOrderDisplay();
}

// Finish order
function finishOrder() {
    if (!validateOrder()) return;
    showAuthModal('finish');
}

// Show authentication modal
function showAuthModal(action) {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    modal.dataset.action = action;
    modal.classList.add('active');
}

// Handle authentication
async function handleAuth(event) {
    event.preventDefault();

    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    const action = event.target.closest('.modal').dataset.action;

    try {
        const user = await window.db.authenticateUser(username, password);
        
        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }

        // Handle different actions
        switch (action) {
            case 'finish':
                await finishOrderWithAuth(user);
                break;
            case 'admin':
                window.location.href = 'admin.html';
                break;
            case 'dashboard':
                window.location.href = 'dashboard.html';
                break;
        }

        closeModal('authModal');
    } catch (error) {
        showMessage(error.message || 'Erro na autenticação', 'error');
    }
}

// Finish order with authentication
async function finishOrderWithAuth(user) {
    try {
        const orderData = {
            ...currentOrder,
            status: 'COMPLETED',
            completedBy: user.id,
            completedAt: new Date().toISOString()
        };

        await window.db.addData(window.db.STORES.ORDERS, orderData);
        showMessage('Pedido finalizado com sucesso', 'success');
        clearOrder();
    } catch (error) {
        showMessage('Erro ao finalizar pedido', 'error');
    }
}

// Show admin access
function showAdminAccess() {
    showAuthModal('admin');
}

// Show dashboard access
function showDashboardAccess() {
    showAuthModal('dashboard');
}

// Show message
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        if (modal.querySelector('form')) {
            modal.querySelector('form').reset();
        }
    }
} 