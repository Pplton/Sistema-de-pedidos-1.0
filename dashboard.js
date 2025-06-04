// Dashboard State Management
let salesChart = null;
let productsChart = null;
let currentOrders = [];
let currentProducts = [];
let currentCategories = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = utils.checkAuth();
    if (!user) return;

    // Set current user and store info
    document.getElementById('currentUser').textContent = `Usuário: ${user.username}`;
    
    try {
        const store = await db.getData(db.STORES.STORES, user.storeId);
        document.getElementById('currentStore').textContent = `Loja: ${store.name}`;
    } catch (error) {
        console.error('Erro ao carregar informações da loja:', error);
    }

    // Setup navigation
    setupNavigation();

    // Load initial data
    await loadOverview();
    await loadOrders();
    await loadProducts();
    await loadCategories();

    // Setup event listeners
    setupEventListeners();
});

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding panel
            const panelId = item.dataset.panel;
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(panelId).classList.add('active');
        });
    });
}

// Load overview data
async function loadOverview() {
    try {
        const user = utils.checkAuth();
        const orders = await db.getAllData(db.STORES.ORDERS);
        const storeOrders = orders.filter(order => order.storeId === user.storeId);

        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = storeOrders.filter(order => 
            new Date(order.createdAt).toISOString().split('T')[0] === today
        );
        const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);

        const pendingOrders = storeOrders.filter(order => order.status === 'PENDING').length;
        const preparingOrders = storeOrders.filter(order => order.status === 'PREPARING').length;

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthlyOrders = storeOrders.filter(order => new Date(order.createdAt) >= monthStart);
        const monthlySales = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

        // Update statistics display
        document.getElementById('todaySales').textContent = utils.formatCurrency(todaySales);
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('preparingOrders').textContent = preparingOrders;
        document.getElementById('monthlySales').textContent = utils.formatCurrency(monthlySales);

        // Create charts
        createSalesChart(storeOrders);
        createProductsChart(storeOrders);
    } catch (error) {
        console.error('Erro ao carregar dados do overview:', error);
    }
}

// Create sales chart
function createSalesChart(orders) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Group orders by date
    const salesByDate = {};
    orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        salesByDate[date] = (salesByDate[date] || 0) + order.total;
    });

    // Get last 7 days
    const dates = [];
    const sales = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        sales.push(salesByDate[dateStr] || 0);
    }

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Vendas',
                data: sales,
                borderColor: '#ff6b6b',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Create products chart
function createProductsChart(orders) {
    const ctx = document.getElementById('productsChart').getContext('2d');
    
    // Count product sales
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });

    // Get top 5 products
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    if (productsChart) {
        productsChart.destroy();
    }

    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProducts.map(([name]) => name),
            datasets: [{
                label: 'Quantidade Vendida',
                data: topProducts.map(([,quantity]) => quantity),
                backgroundColor: '#4ecdc4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Load orders
async function loadOrders() {
    try {
        const user = utils.checkAuth();
        currentOrders = await db.getAllData(db.STORES.ORDERS);
        currentOrders = currentOrders.filter(order => order.storeId === user.storeId);
        displayOrders();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

// Display orders
function displayOrders() {
    const status = document.getElementById('orderStatus').value;
    const date = document.getElementById('orderDate').value;

    let filteredOrders = currentOrders;
    if (status !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    if (date) {
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt).toISOString().split('T')[0] === date
        );
    }

    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-info">
                <strong>Cliente: ${order.customer.name}</strong>
                <span>Telefone: ${order.customer.phone}</span>
                <span>Retirada: ${utils.formatDate(order.customer.pickupTime)}</span>
                <span>Total: ${utils.formatCurrency(order.total)}</span>
            </div>
            <div class="order-status status-${order.status.toLowerCase()}">
                ${getStatusText(order.status)}
            </div>
            <div class="order-actions">
                <button onclick="updateOrderStatus(${order.id}, '${getNextStatus(order.status)}')" class="btn-primary">
                    ${getNextStatusText(order.status)}
                </button>
            </div>
        </div>
    `).join('');
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Pendente',
        'PREPARING': 'Preparando',
        'READY': 'Pronto',
        'DELIVERED': 'Entregue',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
}

// Get next status
function getNextStatus(currentStatus) {
    const statusFlow = {
        'PENDING': 'PREPARING',
        'PREPARING': 'READY',
        'READY': 'DELIVERED'
    };
    return statusFlow[currentStatus] || currentStatus;
}

// Get next status text
function getNextStatusText(currentStatus) {
    const nextStatus = getNextStatus(currentStatus);
    return getStatusText(nextStatus);
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const order = currentOrders.find(o => o.id === orderId);
        if (!order) return;

        order.status = newStatus;
        await db.updateData(db.STORES.ORDERS, order);
        await utils.logActivity(
            utils.checkAuth().id,
            'UPDATE_ORDER_STATUS',
            `Pedido ${orderId} atualizado para ${newStatus}`
        );

        displayOrders();
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        alert('Erro ao atualizar status do pedido. Tente novamente.');
    }
}

// Load products
async function loadProducts() {
    try {
        const user = utils.checkAuth();
        currentProducts = await db.getAllData(db.STORES.PRODUCTS);
        currentProducts = currentProducts.filter(product => product.storeId === user.storeId);
        displayProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = currentProducts.map(product => `
        <div class="product-card">
            <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">${utils.formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button onclick="editProduct(${product.id})" class="btn-secondary">Editar</button>
                    <button onclick="deleteProduct(${product.id})" class="btn-secondary">Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load categories
async function loadCategories() {
    try {
        const user = utils.checkAuth();
        currentCategories = await db.getAllData(db.STORES.CATEGORIES);
        currentCategories = currentCategories.filter(category => category.storeId === user.storeId);
        displayCategories();
        updateCategorySelect();
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Display categories
function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = currentCategories.map(category => `
        <div class="category-card">
            <div class="category-info">
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
            </div>
            <div class="category-actions">
                <button onclick="editCategory(${category.id})" class="btn-secondary">Editar</button>
                <button onclick="deleteCategory(${category.id})" class="btn-secondary">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Update category select
function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    select.innerHTML = currentCategories.map(category => `
        <option value="${category.id}">${category.name}</option>
    `).join('');
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
}

// Show add category modal
function showAddCategoryModal() {
    document.getElementById('addCategoryModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    // Order filters
    document.getElementById('orderStatus').addEventListener('change', displayOrders);
    document.getElementById('orderDate').addEventListener('change', displayOrders);

    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = utils.checkAuth();
        
        const product = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            categoryId: parseInt(document.getElementById('productCategory').value),
            image: document.getElementById('productImage').value,
            storeId: user.storeId
        };

        try {
            await db.addData(db.STORES.PRODUCTS, product);
            await utils.logActivity(user.id, 'ADD_PRODUCT', `Produto adicionado: ${product.name}`);
            closeModal('addProductModal');
            loadProducts();
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Erro ao adicionar produto. Tente novamente.');
        }
    });

    // Add category form
    document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = utils.checkAuth();
        
        const category = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            storeId: user.storeId
        };

        try {
            await db.addData(db.STORES.CATEGORIES, category);
            await utils.logActivity(user.id, 'ADD_CATEGORY', `Categoria adicionada: ${category.name}`);
            closeModal('addCategoryModal');
            loadCategories();
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            alert('Erro ao adicionar categoria. Tente novamente.');
        }
    });
}

// Generate report
async function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportType = document.getElementById('reportType').value;

    if (!startDate || !endDate) {
        alert('Selecione o período do relatório.');
        return;
    }

    try {
        const user = utils.checkAuth();
        const orders = await db.getAllData(db.STORES.ORDERS);
        const storeOrders = orders.filter(order => 
            order.storeId === user.storeId &&
            new Date(order.createdAt) >= new Date(startDate) &&
            new Date(order.createdAt) <= new Date(endDate)
        );

        let reportContent = '';
        switch (reportType) {
            case 'SALES':
                reportContent = generateSalesReport(storeOrders);
                break;
            case 'PRODUCTS':
                reportContent = generateProductsReport(storeOrders);
                break;
            case 'ORDERS':
                reportContent = generateOrdersReport(storeOrders);
                break;
        }

        document.getElementById('reportContent').innerHTML = reportContent;
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        alert('Erro ao gerar relatório. Tente novamente.');
    }
}

// Generate sales report
function generateSalesReport(orders) {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const salesByDay = {};
    
    orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        salesByDay[date] = (salesByDay[date] || 0) + order.total;
    });

    return `
        <h3>Relatório de Vendas</h3>
        <p>Total de Vendas: ${utils.formatCurrency(totalSales)}</p>
        <p>Número de Pedidos: ${orders.length}</p>
        <h4>Vendas por Dia:</h4>
        <ul>
            ${Object.entries(salesByDay).map(([date, total]) => `
                <li>${date}: ${utils.formatCurrency(total)}</li>
            `).join('')}
        </ul>
    `;
}

// Generate products report
function generateProductsReport(orders) {
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });

    return `
        <h3>Relatório de Produtos</h3>
        <h4>Produtos Vendidos:</h4>
        <ul>
            ${Object.entries(productSales)
                .sort(([,a], [,b]) => b - a)
                .map(([name, quantity]) => `
                    <li>${name}: ${quantity} unidades</li>
                `).join('')}
        </ul>
    `;
}

// Generate orders report
function generateOrdersReport(orders) {
    const statusCount = {
        'PENDING': 0,
        'PREPARING': 0,
        'READY': 0,
        'DELIVERED': 0,
        'CANCELLED': 0
    };

    orders.forEach(order => {
        statusCount[order.status]++;
    });

    return `
        <h3>Relatório de Pedidos</h3>
        <p>Total de Pedidos: ${orders.length}</p>
        <h4>Status dos Pedidos:</h4>
        <ul>
            ${Object.entries(statusCount).map(([status, count]) => `
                <li>${getStatusText(status)}: ${count}</li>
            `).join('')}
        </ul>
    `;
}

// Export report
function exportReport() {
    const reportContent = document.getElementById('reportContent').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
} 