// Variáveis globais
let orders = [];
let products = [];
let categories = [];
let statusChart = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// Configuração dos event listeners
function setupEventListeners() {
    // Atualizar filtros quando o tipo de relatório mudar
    const reportType = document.getElementById('reportType');
    reportType.addEventListener('change', updateReportFilters);

    // Mostrar/ocultar campos de data personalizada
    const dateRange = document.getElementById('dateRange');
    dateRange.addEventListener('change', () => {
        const customDateRange = document.getElementById('customDateRange');
        customDateRange.style.display = dateRange.value === 'custom' ? 'flex' : 'none';
        loadReport();
    });
}

// Carregar dados do banco de dados
async function loadData() {
    try {
        [orders, products, categories] = await Promise.all([
            db.getOrders(),
            db.getProducts(),
            db.getCategories()
        ]);
        loadReport();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        utils.showNotification('Erro ao carregar dados', 'error');
    }
}

// Atualizar filtros baseado no tipo de relatório
function updateReportFilters() {
    const reportType = document.getElementById('reportType').value;
    loadReport();
}

// Carregar relatório
async function loadReport() {
    const reportType = document.getElementById('reportType').value;
    const dateRange = getDateRange();

    let filteredOrders = filterOrdersByDateRange(orders, dateRange);
    updateSummary(filteredOrders);
    updateStatusChart(filteredOrders);

    switch (reportType) {
        case 'sales':
            renderSalesReport(filteredOrders);
            break;
        case 'products':
            renderProductsReport(filteredOrders);
            break;
        case 'categories':
            renderCategoriesReport(filteredOrders);
            break;
    }
}

// Obter intervalo de datas
function getDateRange() {
    const dateRange = document.getElementById('dateRange').value;
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'yesterday':
            startDate = new Date(now.setDate(now.getDate() - 1));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            break;
        case 'custom':
            startDate = new Date(document.getElementById('startDate').value);
            endDate = new Date(document.getElementById('endDate').value);
            break;
    }

    return { startDate, endDate };
}

// Filtrar pedidos por intervalo de datas
function filterOrdersByDateRange(orders, dateRange) {
    return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });
}

// Atualizar resumo
function updateSummary(orders) {
    const totalSales = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;

    document.getElementById('totalSales').textContent = totalSales;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('averageTicket').textContent = formatCurrency(averageTicket);
}

// Atualizar gráfico de status
function updateStatusChart(orders) {
    const statusCounts = {
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0
    };

    orders.forEach(order => {
        statusCounts[order.status]++;
    });

    const ctx = document.getElementById('orderStatusChart').getContext('2d');

    if (statusChart) {
        statusChart.destroy();
    }

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendente', 'Em Preparo', 'Pronto', 'Entregue', 'Cancelado'],
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#FFA726', // Pending
                    '#42A5F5', // Preparing
                    '#66BB6A', // Ready
                    '#AB47BC', // Delivered
                    '#EF5350'  // Cancelled
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Renderizar relatório de vendas
function renderSalesReport(orders) {
    const table = document.getElementById('detailsTable');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>
                        <span class="status-badge status-${order.status}">
                            ${getStatusText(order.status)}
                        </span>
                    </td>
                    <td>${formatCurrency(order.total)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

// Renderizar relatório de produtos
function renderProductsReport(orders) {
    const productStats = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productStats[item.productId]) {
                productStats[item.productId] = {
                    name: item.name,
                    quantity: 0,
                    total: 0
                };
            }
            productStats[item.productId].quantity += item.quantity;
            productStats[item.productId].total += item.price * item.quantity;
        });
    });

    const table = document.getElementById('detailsTable');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
                <th>Média</th>
            </tr>
        </thead>
        <tbody>
            ${Object.values(productStats).map(stat => `
                <tr>
                    <td>${stat.name}</td>
                    <td>${stat.quantity}</td>
                    <td>${formatCurrency(stat.total)}</td>
                    <td>${formatCurrency(stat.total / stat.quantity)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

// Renderizar relatório de categorias
function renderCategoriesReport(orders) {
    const categoryStats = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product && product.categoryId) {
                const category = categories.find(c => c.id === product.categoryId);
                if (category) {
                    if (!categoryStats[category.id]) {
                        categoryStats[category.id] = {
                            name: category.name,
                            quantity: 0,
                            total: 0
                        };
                    }
                    categoryStats[category.id].quantity += item.quantity;
                    categoryStats[category.id].total += item.price * item.quantity;
                }
            }
        });
    });

    const table = document.getElementById('detailsTable');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
                <th>Média</th>
            </tr>
        </thead>
        <tbody>
            ${Object.values(categoryStats).map(stat => `
                <tr>
                    <td>${stat.name}</td>
                    <td>${stat.quantity}</td>
                    <td>${formatCurrency(stat.total)}</td>
                    <td>${formatCurrency(stat.total / stat.quantity)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

// Exportar relatório
function exportReport() {
    const reportType = document.getElementById('reportType').value;
    const dateRange = getDateRange();
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    let data = [];
    let filename = '';

    switch (reportType) {
        case 'sales':
            data = filteredOrders.map(order => [
                formatDate(order.createdAt),
                order.id,
                order.customerName,
                getStatusText(order.status),
                order.total
            ]);
            filename = 'relatorio_vendas';
            break;
        case 'products':
            const productStats = {};
            filteredOrders.forEach(order => {
                order.items.forEach(item => {
                    if (!productStats[item.productId]) {
                        productStats[item.productId] = {
                            name: item.name,
                            quantity: 0,
                            total: 0
                        };
                    }
                    productStats[item.productId].quantity += item.quantity;
                    productStats[item.productId].total += item.price * item.quantity;
                });
            });
            data = Object.values(productStats).map(stat => [
                stat.name,
                stat.quantity,
                stat.total,
                stat.total / stat.quantity
            ]);
            filename = 'relatorio_produtos';
            break;
        case 'categories':
            const categoryStats = {};
            filteredOrders.forEach(order => {
                order.items.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (product && product.categoryId) {
                        const category = categories.find(c => c.id === product.categoryId);
                        if (category) {
                            if (!categoryStats[category.id]) {
                                categoryStats[category.id] = {
                                    name: category.name,
                                    quantity: 0,
                                    total: 0
                                };
                            }
                            categoryStats[category.id].quantity += item.quantity;
                            categoryStats[category.id].total += item.price * item.quantity;
                        }
                    }
                });
            });
            data = Object.values(categoryStats).map(stat => [
                stat.name,
                stat.quantity,
                stat.total,
                stat.total / stat.quantity
            ]);
            filename = 'relatorio_categorias';
            break;
    }

    const csv = [
        getReportHeaders(reportType),
        ...data
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${formatDate(new Date())}.csv`;
    link.click();
}

// Obter cabeçalhos do relatório
function getReportHeaders(reportType) {
    switch (reportType) {
        case 'sales':
            return ['Data', 'ID', 'Cliente', 'Status', 'Valor'];
        case 'products':
            return ['Produto', 'Quantidade', 'Valor Total', 'Média'];
        case 'categories':
            return ['Categoria', 'Quantidade', 'Valor Total', 'Média'];
        default:
            return [];
    }
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