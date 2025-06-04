// Variáveis globais
let orders = [];
let products = [];
let currentOrder = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadProducts();
    setupEventListeners();
});

// Configuração dos event listeners
function setupEventListeners() {
    // Busca de pedidos
    const searchInput = document.getElementById('orderSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterOrders(searchTerm);
    });

    // Filtro de status
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', () => {
        filterOrders();
    });

    // Filtro de data
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', () => {
        filterOrders();
    });

    // Formulário de novo pedido
    const newOrderForm = document.getElementById('newOrderForm');
    newOrderForm.addEventListener('submit', handleNewOrderSubmit);
}

// Carregar pedidos do banco de dados
async function loadOrders() {
    try {
        orders = await db.getOrders();
        renderOrders(orders);
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        utils.showNotification('Erro ao carregar pedidos', 'error');
    }
}

// Carregar produtos do banco de dados
async function loadProducts() {
    try {
        products = await db.getProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        utils.showNotification('Erro ao carregar produtos', 'error');
    }
}

// Renderizar pedidos na tabela
function renderOrders(ordersToRender) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (ordersToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Nenhum pedido encontrado</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToRender.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

// Criar linha de pedido
function createOrderRow(order) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${order.id}</td>
        <td>${order.customerName}</td>
        <td>${formatDate(order.createdAt)}</td>
        <td>${formatCurrency(order.total)}</td>
        <td>
            <span class="status-badge status-${order.status}">
                <i class="fas ${getStatusIcon(order.status)}"></i>
                ${getStatusText(order.status)}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button onclick="viewOrderDetails(${order.id})" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="printOrder(${order.id})" title="Imprimir">
                    <i class="fas fa-print"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// Filtrar pedidos
function filterOrders(searchTerm = '') {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filtered = orders;

    // Filtrar por termo de busca
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.id.toString().includes(searchTerm)
        );
    }

    // Filtrar por status
    if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtrar por data
    if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        filtered = filtered.filter(order => 
            new Date(order.createdAt).toDateString() === filterDate
        );
    }

    renderOrders(filtered);
}

// Mostrar modal de novo pedido
function showNewOrderModal() {
    document.getElementById('newOrderForm').reset();
    document.getElementById('productsList').innerHTML = '';
    updateOrderSummary();
    document.getElementById('newOrderModal').style.display = 'block';
}

// Adicionar produto ao pedido
function addProductToOrder() {
    const productsList = document.getElementById('productsList');
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
        <select class="product-select" onchange="updateOrderSummary()">
            <option value="">Selecione um produto</option>
            ${products.map(product => `
                <option value="${product.id}" data-price="${product.price}">
                    ${product.name} - ${formatCurrency(product.price)}
                </option>
            `).join('')}
        </select>
        <input type="number" min="1" value="1" class="product-quantity" 
               onchange="updateOrderSummary()">
        <button type="button" onclick="removeProduct(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    productsList.appendChild(productItem);
}

// Remover produto do pedido
function removeProduct(button) {
    button.closest('.product-item').remove();
    updateOrderSummary();
}

// Atualizar resumo do pedido
function updateOrderSummary() {
    const productItems = document.querySelectorAll('.product-item');
    let subtotal = 0;

    productItems.forEach(item => {
        const select = item.querySelector('.product-select');
        const quantity = parseInt(item.querySelector('.product-quantity').value);
        const price = parseFloat(select.options[select.selectedIndex].dataset.price || 0);
        subtotal += price * quantity;
    });

    const deliveryFee = subtotal > 0 ? 5 : 0; // Taxa de entrega fixa de R$ 5,00
    const total = subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('deliveryFee').textContent = formatCurrency(deliveryFee);
    document.getElementById('total').textContent = formatCurrency(total);
}

// Manipular envio do formulário de novo pedido
async function handleNewOrderSubmit(e) {
    e.preventDefault();

    const orderData = {
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        deliveryAddress: document.getElementById('deliveryAddress').value,
        items: getOrderItems(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        await db.addOrder(orderData);
        utils.showNotification('Pedido criado com sucesso!', 'success');
        closeModal('newOrderModal');
        loadOrders();
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        utils.showNotification('Erro ao criar pedido', 'error');
    }
}

// Obter itens do pedido
function getOrderItems() {
    const items = [];
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const select = item.querySelector('.product-select');
        const quantity = parseInt(item.querySelector('.product-quantity').value);
        const productId = select.value;

        if (productId && quantity > 0) {
            const product = products.find(p => p.id === parseInt(productId));
            items.push({
                productId: parseInt(productId),
                quantity,
                price: product.price,
                name: product.name
            });
        }
    });

    return items;
}

// Visualizar detalhes do pedido
async function viewOrderDetails(orderId) {
    try {
        const order = await db.getOrder(orderId);
        currentOrder = order;
        
        const content = document.getElementById('orderDetailsContent');
        content.innerHTML = `
            <div class="order-details">
                <div class="details-section">
                    <h3>Informações do Cliente</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nome</span>
                            <span class="detail-value">${order.customerName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefone</span>
                            <span class="detail-value">${order.customerPhone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Endereço</span>
                            <span class="detail-value">${order.deliveryAddress}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h3>Itens do Pedido</h3>
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Preço</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="order-summary">
                    <div class="summary-item">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(order.total - 5)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Taxa de Entrega:</span>
                        <span>${formatCurrency(5)}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Total:</span>
                        <span>${formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('orderDetailsModal').style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        utils.showNotification('Erro ao carregar detalhes do pedido', 'error');
    }
}

// Atualizar status do pedido
async function updateOrderStatus() {
    if (!currentOrder) return;

    const statuses = ['pending', 'preparing', 'ready', 'delivered'];
    const currentIndex = statuses.indexOf(currentOrder.status);
    const nextStatus = statuses[currentIndex + 1] || 'pending';

    try {
        await db.updateOrder(currentOrder.id, { status: nextStatus });
        utils.showNotification('Status do pedido atualizado com sucesso!', 'success');
        closeModal('orderDetailsModal');
        loadOrders();
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        utils.showNotification('Erro ao atualizar status do pedido', 'error');
    }
}

// Imprimir pedido
function printOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Pedido #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .details { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total { text-align: right; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Pedido #${order.id}</h1>
                    <p>Data: ${formatDate(order.createdAt)}</p>
                </div>
                <div class="details">
                    <h3>Cliente</h3>
                    <p>Nome: ${order.customerName}</p>
                    <p>Telefone: ${order.customerPhone}</p>
                    <p>Endereço: ${order.deliveryAddress}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Preço</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    <p>Total: ${formatCurrency(order.total)}</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Exportar pedidos
function exportOrders() {
    const filteredOrders = orders.filter(order => {
        const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let matches = true;

        if (searchTerm) {
            matches = matches && (
                order.customerName.toLowerCase().includes(searchTerm) ||
                order.id.toString().includes(searchTerm)
            );
        }

        if (statusFilter) {
            matches = matches && order.status === statusFilter;
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            matches = matches && new Date(order.createdAt).toDateString() === filterDate;
        }

        return matches;
    });

    const csv = [
        ['ID', 'Cliente', 'Data', 'Total', 'Status'],
        ...filteredOrders.map(order => [
            order.id,
            order.customerName,
            formatDate(order.createdAt),
            order.total,
            getStatusText(order.status)
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${formatDate(new Date())}.csv`;
    link.click();
}

// Funções auxiliares
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function getStatusIcon(status) {
    const icons = {
        pending: 'fa-clock',
        preparing: 'fa-utensils',
        ready: 'fa-check-circle',
        delivered: 'fa-truck',
        cancelled: 'fa-times-circle'
    };
    return icons[status] || 'fa-question-circle';
}

function getStatusText(status) {
    const texts = {
        pending: 'Pendente',
        preparing: 'Em preparo',
        ready: 'Pronto',
        delivered: 'Entregue',
        cancelled: 'Cancelado'
    };
    return texts[status] || 'Desconhecido';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
} 