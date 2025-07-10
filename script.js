// Sistema de Encomendas Delícia de Pão
// Arquivo JavaScript Principal

// Constantes e Configurações
const STORAGE_KEYS = {
    PRODUTOS: 'delicia_produtos',
    CLIENTES: 'delicia_clientes',
    ENCOMENDAS: 'delicia_encomendas',
    CONFIGURACOES: 'delicia_config'
};

const STATUS_ENCOMENDA = {
    ABERTO: 'Encomenda em Aberto',
    REALIZADA: 'Encomenda Realizada',
    CANCELADA: 'Encomenda Cancelada',
    RETIRADA: 'Encomenda Retirada'
};

const CATEGORIAS_PRODUTO = [
    'Salgados tradicionais Fritos',
    'Salgados tradicionais Assados',
    'Tortas',
    'Doces Tradicionais',
    'Doces Especiais',
    'Pães',
    'Salgados Especiais'
];

const SETORES_PRODUCAO = [
    'Padaria',
    'Confeitaria',
    'Salgaderia'
];

// Classe para Gerenciamento de Dados
class DataManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }
    
    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover dados:', error);
            return false;
        }
    }
}

// Classe para Gerenciamento de Estado da Aplicação
class AppState {
    constructor() {
        this.produtos = DataManager.load(STORAGE_KEYS.PRODUTOS) || [];
        this.clientes = DataManager.load(STORAGE_KEYS.CLIENTES) || [];
        this.encomendas = DataManager.load(STORAGE_KEYS.ENCOMENDAS) || [];
        this.currentPage = 'dashboard';
        this.filters = {};
        
        // Inicializar dados de exemplo se não existirem
        this.initializeDefaultData();
        this.calculateClientOrderFrequency();
    }
    
    calculateClientOrderFrequency() {
        this.clientes.forEach(cliente => {
            const clienteEncomendas = this.encomendas.filter(e => e.cliente.id === cliente.id);
            cliente.frequenciaPedidos = clienteEncomendas.length;
        });
        this.saveClientes();
    }
    
    initializeDefaultData() {
        if (this.produtos.length === 0) {
            this.produtos = [
                {
                    id: this.generateId(),
                    nome: 'Pão de Queijo',
                    preco: 1.50,
                    categoria: 'Pães',
                    setor: 'Padaria',
                    ativo: true,
                    dataCriacao: new Date(),
                    dataAtualizacao: new Date()
                },
                {
                    id: this.generateId(),
                    nome: 'Coxinha',
                    preco: 3.00,
                    categoria: 'Salgados tradicionais Fritos',
                    setor: 'Salgaderia',
                    ativo: true,
                    dataCriacao: new Date(),
                    dataAtualizacao: new Date()
                },
                {
                    id: this.generateId(),
                    nome: 'Brigadeiro',
                    preco: 2.50,
                    categoria: 'Doces Tradicionais',
                    setor: 'Confeitaria',
                    ativo: true,
                    dataCriacao: new Date(),
                    dataAtualizacao: new Date()
                }
            ];
            this.saveProdutos();
        }
        
        if (this.clientes.length === 0) {
            this.clientes = [
                {
                    id: this.generateId(),
                    nome: 'Maria Silva',
                    telefone: '(11) 99999-9999',
                    email: 'maria@email.com',
                    endereco: {
                        rua: 'Rua das Flores, 123',
                        bairro: 'Centro',
                        cidade: 'São Paulo',
                        cep: '01234-567'
                    },
                    dataCadastro: new Date(),
                    dataAtualizacao: new Date()
                }
            ];
            this.saveClientes();
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Métodos para Produtos
    addProduto(produto) {
        produto.id = this.generateId();
        produto.dataCriacao = new Date();
        produto.dataAtualizacao = new Date();
        produto.ativo = true;
        this.produtos.push(produto);
        this.saveProdutos();
        return produto;
    }
    
    updateProduto(id, dadosAtualizados) {
        const index = this.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.produtos[index] = {
                ...this.produtos[index],
                ...dadosAtualizados,
                dataAtualizacao: new Date()
            };
            this.saveProdutos();
            return this.produtos[index];
        }
        return null;
    }
    
    deleteProduto(id) {
        const index = this.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.produtos.splice(index, 1);
            this.saveProdutos();
            return true;
        }
        return false;
    }
    
    getProdutoById(id) {
        return this.produtos.find(p => p.id === id);
    }
    
    saveProdutos() {
        DataManager.save(STORAGE_KEYS.PRODUTOS, this.produtos);
    }
    
    // Métodos para Clientes
    addCliente(cliente) {
        cliente.id = this.generateId();
        cliente.dataCadastro = new Date();
        cliente.dataAtualizacao = new Date();
        this.clientes.push(cliente);
        this.saveClientes();
        return cliente;
    }
    
    updateCliente(id, dadosAtualizados) {
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes[index] = {
                ...this.clientes[index],
                ...dadosAtualizados,
                dataAtualizacao: new Date()
            };
            this.saveClientes();
            return this.clientes[index];
        }
        return null;
    }
    
    deleteCliente(id) {
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes.splice(index, 1);
            this.saveClientes();
            return true;
        }
        return false;
    }
    
    getClienteById(id) {
        return this.clientes.find(c => c.id === id);
    }
    
    saveClientes() {
        DataManager.save(STORAGE_KEYS.CLIENTES, this.clientes);
    }
    
    // Métodos para Encomendas
    addEncomenda(encomenda) {
        encomenda.id = this.generateId();
        encomenda.dataCriacao = new Date();
        encomenda.dataAtualizacao = new Date();
        encomenda.status = STATUS_ENCOMENDA.ABERTO;
        this.encomendas.push(encomenda);
        this.saveEncomendas();
        return encomenda;
    }
    
    updateEncomenda(id, dadosAtualizados) {
        const index = this.encomendas.findIndex(e => e.id === id);
        if (index !== -1) {
            this.encomendas[index] = {
                ...this.encomendas[index],
                ...dadosAtualizados,
                dataAtualizacao: new Date()
            };
            this.saveEncomendas();
            return this.encomendas[index];
        }
        return null;
    }
    
    deleteEncomenda(id) {
        const index = this.encomendas.findIndex(e => e.id === id);
        if (index !== -1) {
            this.encomendas.splice(index, 1);
            this.saveEncomendas();
            return true;
        }
        return false;
    }
    
    getEncomendaById(id) {
        return this.encomendas.find(e => e.id === id);
    }
    
    saveEncomendas() {
        DataManager.save(STORAGE_KEYS.ENCOMENDAS, this.encomendas);
    }
}

// Classe para Gerenciamento de UI
class UIManager {
    static showModal(title, content) {
        const modal = document.getElementById('modalContainer');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }
    
    static hideModal() {
        const modal = document.getElementById('modalContainer');
        modal.classList.remove('active');
    }
    
    static showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remover toast após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
    
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    static formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}

// Classe Principal da Aplicação
class DeliciaDePaoApp {
    constructor() {
        console.log('Construtor da aplicação chamado');
        this.state = new AppState();
        this.init();
    }
    
    init() {
        console.log('Iniciando aplicação...');
        this.setupEventListeners();
        this.setupRoutes();
        this.updateDashboardStats();
        console.log('Aplicação inicializada com sucesso');
    }
    
    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMobile = document.getElementById('navMobile');
        
        if (menuToggle && navMobile) {
            menuToggle.addEventListener('click', () => {
                navMobile.classList.toggle('active');
            });
        }
        
        // Modal close
        const modalClose = document.getElementById('modalClose');
        const modalContainer = document.getElementById('modalContainer');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                UIManager.hideModal();
            });
        }
        
        if (modalContainer) {
            modalContainer.addEventListener('click', (e) => {
                if (e.target === modalContainer) {
                    UIManager.hideModal();
                }
            });
        }
        
        // Dashboard cards
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        console.log('Dashboard cards encontrados:', dashboardCards.length);
        
        dashboardCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                console.log('Dashboard card clicado:', action);
                this.handleDashboardAction(action);
            });
        });
        
        // Botões de ação
        this.setupActionButtons();
        
        // Filtros
        this.setupFilters();
        
        console.log('Event listeners configurados');
    }
    
    setupActionButtons() {
        console.log('Configurando botões de ação...');
        
        // Novo Produto
        const btnNovoProduto = document.getElementById('btnNovoProduto');
        if (btnNovoProduto) {
            console.log('Botão Novo Produto encontrado');
            btnNovoProduto.addEventListener('click', () => {
                console.log('Botão Novo Produto clicado');
                this.showProdutoForm();
            });
        } else {
            console.log('Botão Novo Produto NÃO encontrado');
        }
        
        // Nova Encomenda
        const btnNovaEncomenda = document.getElementById('btnNovaEncomenda');
        if (btnNovaEncomenda) {
            console.log('Botão Nova Encomenda encontrado');
            btnNovaEncomenda.addEventListener('click', () => {
                console.log('Botão Nova Encomenda clicado');
                this.showEncomendaForm();
            });
        } else {
            console.log('Botão Nova Encomenda NÃO encontrado');
        }
        
        // Novo Cliente
        const btnNovoCliente = document.getElementById('btnNovoCliente');
        if (btnNovoCliente) {
            console.log('Botão Novo Cliente encontrado');
            btnNovoCliente.addEventListener('click', () => {
                console.log('Botão Novo Cliente clicado');
                this.showClienteForm();
            });
        } else {
            console.log('Botão Novo Cliente NÃO encontrado');
        }
    }
    
    setupFilters() {
        console.log('Configurando filtros...');
        
        // Filtros de produtos
        const filtroSetor = document.getElementById('filtroSetor');
        const filtroCategoria = document.getElementById('filtroCategoria');
        const buscarProduto = document.getElementById('buscarProduto');
        
        if (filtroSetor) {
            filtroSetor.addEventListener('change', () => this.renderProdutos());
        }
        
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.renderProdutos());
        }
        
        if (buscarProduto) {
            buscarProduto.addEventListener('input', () => this.renderProdutos());
        }
        
        // Filtros de encomendas
        const filtroStatus = document.getElementById('filtroStatus');
        const filtroData = document.getElementById('filtroData');
        const buscarEncomenda = document.getElementById('buscarEncomenda');
        
        if (filtroStatus) {
            filtroStatus.addEventListener('change', () => this.renderEncomendas());
        }
        
        if (filtroData) {
            filtroData.addEventListener('change', () => this.renderEncomendas());
        }
        
        if (buscarEncomenda) {
            buscarEncomenda.addEventListener('input', () => this.renderEncomendas());
        }
        
        // Filtros de clientes
        const buscarCliente = document.getElementById('buscarCliente');
        
        if (buscarCliente) {
            buscarCliente.addEventListener('input', () => this.renderClientes());
        }
    }
    
    setupRoutes() {
        console.log('Configurando rotas...');
        
        // Configurar event listeners para navegação
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    this.navigate(href.substring(1));
                }
            }
        });
        
        // Navegação inicial
        this.navigate('dashboard');
    }
    
    navigate(path) {
        console.log('Navegando para:', path);
        
        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelectorAll(`[href="#${path}"]`).forEach(link => {
            link.classList.add('active');
        });
        
        // Mostrar página atual
        const targetPage = document.getElementById(`${path}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log('Página ativada:', targetPage.id);
        } else {
            console.log('Página não encontrada:', `${path}-page`);
        }
        
        // Executar ações específicas da página
        switch (path) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'produtos':
                this.renderProdutos();
                break;
            case 'encomendas':
                this.renderEncomendas();
                break;
            case 'clientes':
                this.renderClientes();
                break;
        }
    }
    
    handleDashboardAction(action) {
        console.log('Ação do dashboard:', action);
        switch (action) {
            case 'nova-encomenda':
                this.navigate('encomendas');
                setTimeout(() => this.showEncomendaForm(), 100);
                break;
            case 'visualizar-encomendas':
                this.navigate('encomendas');
                break;
            case 'gerenciar-produtos':
                this.navigate('produtos');
                break;
            case 'gerenciar-clientes':
                this.navigate('clientes');
                break;
        }
    }
    
    updateDashboardStats() {
        console.log('Atualizando estatísticas do dashboard...');
        const totalEncomendas = document.getElementById('total-encomendas');
        const encomendasPendentes = document.getElementById('encomendas-pendentes');
        const totalProdutos = document.getElementById('total-produtos');
        const totalClientes = document.getElementById('total-clientes');
        
        if (totalEncomendas) {
            totalEncomendas.textContent = this.state.encomendas.length;
        }
        
        if (encomendasPendentes) {
            const pendentes = this.state.encomendas.filter(e => 
                e.status === STATUS_ENCOMENDA.ABERTO || e.status === STATUS_ENCOMENDA.REALIZADA
            ).length;
            encomendasPendentes.textContent = pendentes;
        }
        
        if (totalProdutos) {
            totalProdutos.textContent = this.state.produtos.filter(p => p.ativo).length;
        }
        
        if (totalClientes) {
            totalClientes.textContent = this.state.clientes.length;
        }
    }
    
    renderProdutos() {
        console.log('Renderizando produtos...');
        const tbody = document.querySelector('#tabelaProdutos tbody');
        if (!tbody) {
            console.log('Tabela de produtos não encontrada');
            return;
        }
        
        // Aplicar filtros
        let produtos = this.state.produtos.filter(p => p.ativo);
        
        const filtroSetor = document.getElementById('filtroSetor')?.value;
        const filtroCategoria = document.getElementById('filtroCategoria')?.value;
        const buscarProduto = document.getElementById('buscarProduto')?.value.toLowerCase();
        
        if (filtroSetor) {
            produtos = produtos.filter(p => p.setor === filtroSetor);
        }
        
        if (filtroCategoria) {
            produtos = produtos.filter(p => p.categoria === filtroCategoria);
        }
        
        if (buscarProduto) {
            produtos = produtos.filter(p => 
                p.nome.toLowerCase().includes(buscarProduto)
            );
        }
        
        // Renderizar tabela
        tbody.innerHTML = '';
        
        if (produtos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-box"></i>
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente ajustar os filtros ou cadastre um novo produto.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${UIManager.formatCurrency(produto.preco)}</td>
                <td>${produto.setor}</td>
                <td>${produto.categoria}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.editProduto('${produto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deleteProduto('${produto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderEncomendas() {
        console.log('Renderizando encomendas...');
        const tbody = document.querySelector('#tabelaEncomendas tbody');
        if (!tbody) {
            console.log('Tabela de encomendas não encontrada');
            return;
        }
        
        // Aplicar filtros
        let encomendas = [...this.state.encomendas];
        
        const filtroStatus = document.getElementById('filtroStatus')?.value;
        const filtroData = document.getElementById('filtroData')?.value;
        const buscarEncomenda = document.getElementById('buscarEncomenda')?.value.toLowerCase();
        
        if (filtroStatus) {
            encomendas = encomendas.filter(e => e.status === filtroStatus);
        }
        
        if (filtroData) {
            encomendas = encomendas.filter(e => {
                const dataEncomenda = new Date(e.dataEncomenda).toISOString().split('T')[0];
                return dataEncomenda === filtroData;
            });
        }
        
        if (buscarEncomenda) {
            encomendas = encomendas.filter(e => 
                e.cliente.nome.toLowerCase().includes(buscarEncomenda)
            );
        }
        
        // Ordenar por data (mais recentes primeiro)
        encomendas.sort((a, b) => new Date(b.dataEncomenda) - new Date(a.dataEncomenda));
        
        // Renderizar tabela
        tbody.innerHTML = '';
        
        if (encomendas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <h3>Nenhuma encomenda encontrada</h3>
                            <p>Tente ajustar os filtros ou crie uma nova encomenda.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        encomendas.forEach(encomenda => {
            const row = document.createElement('tr');
            const statusClass = encomenda.status.toLowerCase().replace(/\s+/g, '-').replace('encomenda-', '');
            
            row.innerHTML = `
                <td>${encomenda.cliente.nome}</td>
                <td>${encomenda.cliente.telefone}</td>
                <td>${UIManager.formatDate(encomenda.dataEncomenda)}</td>
                <td>${encomenda.horarioEncomenda}</td>
                <td><span class="status-badge status-${statusClass}">${encomenda.status}</span></td>
                <td>${UIManager.formatCurrency(encomenda.valorTotal)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.viewEncomenda('${encomenda.id}')" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="app.editEncomenda('${encomenda.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.changeStatusEncomenda('${encomenda.id}')" title="Alterar status">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deleteEncomenda('${encomenda.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderClientes() {
        console.log('Renderizando clientes...');
        const tbody = document.querySelector('#tabelaClientes tbody');
        if (!tbody) {
            console.log('Tabela de clientes não encontrada');
            return;
        }
        
        // Aplicar filtros
        let clientes = [...this.state.clientes];
        
        const buscarCliente = document.getElementById('buscarCliente')?.value.toLowerCase();
        
        if (buscarCliente) {
            clientes = clientes.filter(c => 
                c.nome.toLowerCase().includes(buscarCliente) ||
                c.telefone.toLowerCase().includes(buscarCliente)
            );
        }
        
        // Ordenar por nome e depois por frequência de pedidos (maior frequência primeiro)
        clientes.sort((a, b) => {
            if (a.frequenciaPedidos !== b.frequenciaPedidos) {
                return b.frequenciaPedidos - a.frequenciaPedidos;
            }
            return a.nome.localeCompare(b.nome);
        });
        
        // Renderizar tabela
        tbody.innerHTML = '';
        
        if (clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h3>Nenhum cliente encontrado</h3>
                            <p>Tente ajustar os filtros ou cadastre um novo cliente.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email || '-'}</td>
                <td>${UIManager.formatDate(cliente.dataCadastro)}</td>
                <td>${cliente.frequenciaPedidos || 0}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.editCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deleteCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Métodos para formulários
    showProdutoForm(produtoId = null) {
        const produto = produtoId ? this.state.getProdutoById(produtoId) : null;
        const isEdit = !!produto;
        
        const formHTML = `
            <form id="produtoForm" class="form-grid">
                <div class="form-group">
                    <label for="produtoNome">Nome do Produto *</label>
                    <input type="text" id="produtoNome" class="form-input" value="${produto ? produto.nome : ''}" required>
                    <div class="error-message" id="produtoNome-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="produtoPreco">Preço (R$) *</label>
                    <input type="number" id="produtoPreco" class="form-input" step="0.01" min="0" value="${produto ? produto.preco : ''}" required>
                    <div class="error-message" id="produtoPreco-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="produtoCategoria">Categoria *</label>
                    <select id="produtoCategoria" class="form-select" required>
                        <option value="">Selecione uma categoria</option>
                        ${CATEGORIAS_PRODUTO.map(categoria => 
                            `<option value="${categoria}" ${produto && produto.categoria === categoria ? 'selected' : ''}>${categoria}</option>`
                        ).join('')}
                    </select>
                    <div class="error-message" id="produtoCategoria-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="produtoSetor">Setor de Produção *</label>
                    <select id="produtoSetor" class="form-select" required>
                        <option value="">Selecione um setor</option>
                        ${SETORES_PRODUCAO.map(setor => 
                            `<option value="${setor}" ${produto && produto.setor === setor ? 'selected' : ''}>${setor}</option>`
                        ).join('')}
                    </select>
                    <div class="error-message" id="produtoSetor-error"></div>
                </div>
                
                <div class="form-group full-width">
                    <label for="produtoImagem">Foto do Produto</label>
                    <div class="image-upload-container">
                        <input type="file" id="produtoImagem" class="form-input" accept="image/*">
                        <div class="image-preview" id="imagePreview">
                            ${produto && produto.imagem ? `<img src="${produto.imagem}" alt="Preview" style="max-width: 200px; max-height: 200px;">` : ''}
                        </div>
                    </div>
                    <div class="error-message" id="produtoImagem-error"></div>
                </div>
                
                <div class="form-group full-width">
                    <label for="produtoDescricao">Descrição</label>
                    <textarea id="produtoDescricao" class="form-input" rows="3" placeholder="Descrição detalhada do produto...">${produto ? produto.descricao || '' : ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="UIManager.hideModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Cadastrar'} Produto</button>
                </div>
            </form>
        `;
        
        UIManager.showModal(isEdit ? 'Editar Produto' : 'Novo Produto', formHTML);
        
        // Configurar evento de submit
        document.getElementById('produtoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduto(produtoId);
        });
        
        // Configurar preview de imagem
        const imageInput = document.getElementById('produtoImagem');
        const imagePreview = document.getElementById('imagePreview');
        
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    showEncomendaForm(encomendaId = null) {
        const encomenda = encomendaId ? this.state.getEncomendaById(encomendaId) : null;
        const isEdit = !!encomenda;
        
        const formHTML = `
            <form id="encomendaForm" class="form-grid">
                <div class="form-group">
                    <label for="encomendaCliente">Cliente *</label>
                    <select id="encomendaCliente" class="form-select" required ${isEdit ? 'disabled' : ''}>
                        <option value="">Selecione um cliente</option>
                        ${this.state.clientes.map(cliente => 
                            `<option value="${cliente.id}" ${encomenda && encomenda.cliente.id === cliente.id ? 'selected' : ''}>${cliente.nome} - ${cliente.telefone}</option>`
                        ).join('')}
                    </select>
                    <div class="error-message" id="encomendaCliente-error"></div>
                </div>
                
                ${!isEdit ? `
                <div class="form-group">
                    <button type="button" class="btn btn-secondary" id="btnNovoClienteEncomenda">
                        <i class="fas fa-user-plus"></i> Cadastrar Novo Cliente
                    </button>
                </div>
                <div id="novoClienteFormContainer" style="display:none;" class="form-grid">
                    <div class="form-group">
                        <label for="novoClienteNome">Nome Completo *</label>
                        <input type="text" id="novoClienteNome" class="form-input">
                        <div class="error-message" id="novoClienteNome-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="novoClienteTelefone">Telefone *</label>
                        <input type="tel" id="novoClienteTelefone" class="form-input">
                        <div class="error-message" id="novoClienteTelefone-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="novoClienteEmail">Email</label>
                        <input type="email" id="novoClienteEmail" class="form-input">
                        <div class="error-message" id="novoClienteEmail-error"></div>
                    </div>
                    <div class="form-group full-width">
                        <label for="novoClienteRua">Endereço</label>
                        <input type="text" id="novoClienteRua" class="form-input" placeholder="Rua, número">
                    </div>
                    <div class="form-group">
                        <label for="novoClienteBairro">Bairro</label>
                        <input type="text" id="novoClienteBairro" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="novoClienteCidade">Cidade</label>
                        <input type="text" id="novoClienteCidade" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="novoClienteCep">CEP</label>
                        <input type="text" id="novoClienteCep" class="form-input" placeholder="00000-000">
                    </div>
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label for="encomendaData">Data da Encomenda *</label>
                    <input type="date" id="encomendaData" class="form-input" value="${encomenda ? new Date(encomenda.dataEncomenda).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
                    <div class="error-message" id="encomendaData-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="encomendaHorario">Horário *</label>
                    <input type="time" id="encomendaHorario" class="form-input" value="${encomenda ? encomenda.horarioEncomenda : ''}" required>
                    <div class="error-message" id="encomendaHorario-error"></div>
                </div>
                
                <div class="form-group full-width">
                    <label>Produtos da Encomenda</label>
                    <div id="produtosEncomenda">
                        ${isEdit && encomenda.itens ? this.renderItensEncomenda(encomenda.itens) : ''}
                    </div>
                    <button type="button" class="btn btn-secondary" onclick="app.addItemEncomenda()">
                        <i class="fas fa-plus"></i> Adicionar Produto
                    </button>
                </div>
                
                <div class="form-group full-width">
                    <label for="encomendaObservacoes">Observações</label>
                    <textarea id="encomendaObservacoes" class="form-input" rows="3" placeholder="Observações adicionais...">${encomenda ? encomenda.observacoes || '' : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Valor Total</label>
                    <div id="valorTotalEncomenda" class="text-large font-bold">R$ 0,00</div>
                </div>
                
                <div class="form-group">
                    <label for="encomendaFormaPagamento">Forma de Pagamento *</label>
                    <select id="encomendaFormaPagamento" class="form-select" required>
                        <option value="">Selecione a forma de pagamento</option>
                        <option value="Dinheiro" ${encomenda && encomenda.formaPagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                        <option value="PIX" ${encomenda && encomenda.formaPagamento === 'PIX' ? 'selected' : ''}>PIX</option>
                        <option value="Cartão de Débito" ${encomenda && encomenda.formaPagamento === 'Cartão de Débito' ? 'selected' : ''}>Cartão de Débito</option>
                        <option value="Cartão de Crédito" ${encomenda && encomenda.formaPagamento === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
                        <option value="Transferência Bancária" ${encomenda && encomenda.formaPagamento === 'Transferência Bancária' ? 'selected' : ''}>Transferência Bancária</option>
                        <option value="Parcelado" ${encomenda && encomenda.formaPagamento === 'Parcelado' ? 'selected' : ''}>Parcelado</option>
                    </select>
                    <div class="error-message" id="encomendaFormaPagamento-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="encomendaValorPago">Valor Pago (Entrada)</label>
                    <input type="number" id="encomendaValorPago" class="form-input" step="0.01" min="0" value="${encomenda ? encomenda.valorPago || 0 : 0}" onchange="app.calculateValorRestante()">
                    <div class="error-message" id="encomendaValorPago-error"></div>
                </div>
                
                <div class="form-group">
                    <label>Valor Restante</label>
                    <div id="valorRestanteEncomenda" class="text-large font-bold">R$ 0,00</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="UIManager.hideModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Criar'} Encomenda</button>
                </div>
            </form>
        `;
        
        UIManager.showModal(isEdit ? 'Editar Encomenda' : 'Nova Encomenda', formHTML);
        
        // Configurar evento de submit
        document.getElementById('encomendaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEncomenda(encomendaId);
        });
        
        // Configurar botão para mostrar/ocultar formulário de novo cliente
        if (!isEdit) {
            const btnNovoCliente = document.getElementById('btnNovoClienteEncomenda');
            const novoClienteContainer = document.getElementById('novoClienteFormContainer');
            const selectCliente = document.getElementById('encomendaCliente');
            
            btnNovoCliente.addEventListener('click', () => {
                if (novoClienteContainer.style.display === 'none' || !novoClienteContainer.style.display) {
                    novoClienteContainer.style.display = 'grid';
                    btnNovoCliente.innerHTML = '<i class="fas fa-user"></i> Usar Cliente Existente';
                    selectCliente.disabled = true;
                    selectCliente.value = '';
                } else {
                    novoClienteContainer.style.display = 'none';
                    btnNovoCliente.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar Novo Cliente';
                    selectCliente.disabled = false;
                }
            });
        }
        
        // Calcular valor total inicial
        this.calculateTotalEncomenda();
        this.calculateValorRestante();
    }
    
    showClienteForm(clienteId = null) {
        console.log('Mostrando formulário de cliente');
        UIManager.showToast('Formulário de cliente será implementado', 'info');
    }
    
    // Métodos de ação
    editProduto(id) {
        console.log('Editando produto:', id);
        this.showProdutoForm(id);
    }
    
    deleteProduto(id) {
        console.log('Excluindo produto:', id);
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.state.deleteProduto(id);
            this.renderProdutos();
            this.updateDashboardStats();
            UIManager.showToast('Produto excluído com sucesso!');
        }
    }
    
    viewEncomenda(id) {
        console.log('Visualizando encomenda:', id);
        UIManager.showToast('Visualização de encomenda será implementada', 'info');
    }
    
    editEncomenda(id) {
        console.log('Editando encomenda:', id);
        this.showEncomendaForm(id);
    }
    
    changeStatusEncomenda(id) {
        console.log('Alterando status da encomenda:', id);
        UIManager.showToast('Alteração de status será implementada', 'info');
    }
    
    deleteEncomenda(id) {
        console.log('Excluindo encomenda:', id);
        if (confirm('Tem certeza que deseja excluir esta encomenda?')) {
            this.state.deleteEncomenda(id);
            this.renderEncomendas();
            this.updateDashboardStats();
            UIManager.showToast('Encomenda excluída com sucesso!');
        }
    }
    
    editCliente(id) {
        console.log('Editando cliente:', id);
        this.showClienteForm(id);
    }
    
    deleteCliente(id) {
        console.log('Excluindo cliente:', id);
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            this.state.deleteCliente(id);
            this.renderClientes();
            this.updateDashboardStats();
            UIManager.showToast('Cliente excluído com sucesso!');
        }
    }
}

DeliciaDePaoApp.prototype.addItemEncomenda = function() {
    // Verificar se estamos no contexto do formulário de encomenda
    const container = document.getElementById('produtosEncomenda');
    if (!container) {
        console.log('Formulário de encomenda não está aberto. Abrindo...');
        this.showEncomendaForm();
        
        // Aguardar um pouco e tentar novamente
        setTimeout(() => {
            this.addItemEncomenda();
        }, 300);
        return;
    }
    
    const produtosDisponiveis = this.state.produtos.filter(p => p.ativo);
    
    if (produtosDisponiveis.length === 0) {
        UIManager.showToast('Nenhum produto cadastrado. Cadastre produtos primeiro!', 'error');
        return;
    }

    const produtosHTML = produtosDisponiveis.map(produto => `
        <div class="produto-card" data-produto-id="${produto.id}" data-produto-preco="${produto.preco}" data-produto-nome="${produto.nome}">
            <div class="produto-imagem">
                ${produto.imagem ? 
                    `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.style.display='none'">` : 
                    `<div class="produto-placeholder"><i class="fas fa-image"></i></div>`
                }
            </div>
            <div class="produto-info">
                <h4>${produto.nome}</h4>
                <p class="produto-preco">${UIManager.formatCurrency(produto.preco)}</p>
                <p class="produto-categoria">${produto.categoria}</p>
            </div>
            <div class="produto-quantidade">
                <div class="quantidade-controls">
                    <button type="button" class="btn btn-sm btn-quantidade" onclick="app.decreaseProdutoQuantity('${produto.id}')">-</button>
                    <input type="number" class="form-input quantidade-produto" id="qty-${produto.id}" value="0" min="0" max="99" data-produto-id="${produto.id}">
                    <button type="button" class="btn btn-sm btn-quantidade" onclick="app.increaseProdutoQuantity('${produto.id}')">+</button>
                </div>
                <div class="produto-subtotal" id="subtotal-${produto.id}">R$ 0,00</div>
            </div>
        </div>
    `).join('');

    const modalContent = `
        <div class="produto-selection-modal">
            <div class="produto-selection-header">
                <h3>Selecione os Produtos</h3>
                <div class="produto-search">
                    <input type="text" id="produtoSearch" class="form-input" placeholder="Buscar produtos..." style="width: 100%;">
                </div>
            </div>
            
            <div class="produtos-grid" id="produtosGrid">
                ${produtosHTML}
            </div>
            
            <div class="produto-selection-summary">
                <div class="summary-info">
                    <strong>Produtos selecionados: <span id="produtosSelecionados">0</span></strong>
                    <strong>Total: <span id="totalSelecao">R$ 0,00</span></strong>
                </div>
                <div class="produto-selection-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.cancelProdutoSelection()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="app.confirmProdutoSelection()" id="btnAdicionarProdutos" disabled>
                        Adicionar Produtos
                    </button>
                </div>
            </div>
        </div>
    `;

    // Mostrar modal de seleção
    UIManager.showModal('Selecionar Produtos', modalContent);

    // Configurar busca
    const searchInput = document.getElementById('produtoSearch');
    const produtosGrid = document.getElementById('produtosGrid');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const produtoCards = produtosGrid.querySelectorAll('.produto-card');
        
        produtoCards.forEach(card => {
            const produtoNome = card.querySelector('h4').textContent.toLowerCase();
            const produtoCategoria = card.querySelector('.produto-categoria').textContent.toLowerCase();
            
            if (produtoNome.includes(searchTerm) || produtoCategoria.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Configurar eventos de quantidade
    document.querySelectorAll('.quantidade-produto').forEach(input => {
        input.addEventListener('input', () => {
            this.updateProdutoSelection();
        });
    });
};

DeliciaDePaoApp.prototype.increaseProdutoQuantity = function(produtoId) {
    const input = document.getElementById(`qty-${produtoId}`);
    const currentValue = parseInt(input.value) || 0;
    if (currentValue < 99) {
        input.value = currentValue + 1;
        this.updateProdutoSelection();
    }
};

DeliciaDePaoApp.prototype.decreaseProdutoQuantity = function(produtoId) {
    const input = document.getElementById(`qty-${produtoId}`);
    const currentValue = parseInt(input.value) || 0;
    if (currentValue > 0) {
        input.value = currentValue - 1;
        this.updateProdutoSelection();
    }
};

DeliciaDePaoApp.prototype.updateProdutoSelection = function() {
    const quantidadeInputs = document.querySelectorAll('.quantidade-produto');
    let produtosSelecionados = 0;
    let totalSelecao = 0;
    
    quantidadeInputs.forEach(input => {
        const quantidade = parseInt(input.value) || 0;
        const produtoId = input.dataset.produtoId;
        const produto = this.state.getProdutoById(produtoId);
        
        if (quantidade > 0) {
            produtosSelecionados++;
            const subtotal = produto.preco * quantidade;
            totalSelecao += subtotal;
            
            // Atualizar subtotal do produto
            const subtotalElement = document.getElementById(`subtotal-${produtoId}`);
            if (subtotalElement) {
                subtotalElement.textContent = UIManager.formatCurrency(subtotal);
            }
        } else {
            // Resetar subtotal se quantidade for 0
            const subtotalElement = document.getElementById(`subtotal-${produtoId}`);
            if (subtotalElement) {
                subtotalElement.textContent = 'R$ 0,00';
            }
        }
    });
    
    // Atualizar resumo
    document.getElementById('produtosSelecionados').textContent = produtosSelecionados;
    document.getElementById('totalSelecao').textContent = UIManager.formatCurrency(totalSelecao);
    
    // Habilitar/desabilitar botão de adicionar
    const btnAdicionar = document.getElementById('btnAdicionarProdutos');
    btnAdicionar.disabled = produtosSelecionados === 0;
};

DeliciaDePaoApp.prototype.confirmProdutoSelection = function() {
    try {
        const quantidadeInputs = document.querySelectorAll('.quantidade-produto');
        const produtosParaAdicionar = [];
        
        quantidadeInputs.forEach(input => {
            const quantidade = parseInt(input.value) || 0;
            const produtoId = input.dataset.produtoId;
            
            if (quantidade > 0 && produtoId) {
                const produto = this.state.getProdutoById(produtoId);
                if (produto) {
                    produtosParaAdicionar.push({
                        produto: produto,
                        quantidade: quantidade
                    });
                }
            }
        });
        
        if (produtosParaAdicionar.length === 0) {
            UIManager.showToast('Selecione pelo menos um produto', 'error');
            return;
        }
        
        // Fechar modal de seleção
        UIManager.hideModal();
        
        // Verificar se estamos no contexto do formulário de encomenda
        const container = document.getElementById('produtosEncomenda');
        if (!container) {
            console.error('Container de produtos não encontrado. Abrindo formulário de encomenda...');
            // Se não estiver no formulário de encomenda, abrir o formulário primeiro
            this.showEncomendaForm();
            
            // Aguardar um pouco e tentar novamente
            setTimeout(() => {
                this.addProdutosToEncomenda(produtosParaAdicionar);
            }, 200);
            return;
        }
        
        this.addProdutosToEncomenda(produtosParaAdicionar);
        
    } catch (error) {
        console.error('Erro ao confirmar seleção de produtos:', error);
        UIManager.showToast('Erro ao adicionar produtos. Tente novamente.', 'error');
    }
};

DeliciaDePaoApp.prototype.addProdutosToEncomenda = function(produtosParaAdicionar) {
    try {
        const container = document.getElementById('produtosEncomenda');
        if (!container) {
            console.error('Container de produtos ainda não encontrado');
            UIManager.showToast('Erro: Formulário de encomenda não está aberto', 'error');
            return;
        }
        
        const currentItems = container.querySelectorAll('.item-encomenda').length;
        
        produtosParaAdicionar.forEach((item, index) => {
            const newItemHTML = `
                <div class="item-encomenda" data-index="${currentItems + index}" data-produto-id="${item.produto.id}">
                    <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr auto;">
                        <div class="produto-selecionado">
                            <div class="produto-info-display">
                                <strong>${item.produto.nome}</strong>
                                <small>${UIManager.formatCurrency(item.produto.preco)}</small>
                            </div>
                        </div>
                        <input type="number" class="form-input quantidade-input" min="1" value="${item.quantidade}" onchange="app.updateItemEncomenda(${currentItems + index})" placeholder="Qtd">
                        <div class="subtotal-item">${UIManager.formatCurrency(item.produto.preco * item.quantidade)}</div>
                        <button type="button" class="btn btn-sm btn-error" onclick="app.removeItemEncomenda(${currentItems + index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', newItemHTML);
        });
        
        this.calculateTotalEncomenda();
        
        UIManager.showToast(`${produtosParaAdicionar.length} produto(s) adicionado(s) com sucesso!`, 'success');
        
        // Focar na aba de encomenda para finalização
        setTimeout(() => {
            const encomendaPage = document.getElementById('encomendas-page');
            if (encomendaPage) {
                encomendaPage.classList.add('active');
                // Scroll para o formulário de encomenda
                const encomendaForm = document.getElementById('encomendaForm');
                if (encomendaForm) {
                    encomendaForm.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('Erro ao adicionar produtos à encomenda:', error);
        UIManager.showToast('Erro ao adicionar produtos. Tente novamente.', 'error');
    }
};

DeliciaDePaoApp.prototype.cancelProdutoSelection = function() {
    UIManager.hideModal();
};

DeliciaDePaoApp.prototype.updateItemEncomenda = function(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (!item) return;
    
    const quantidadeInput = item.querySelector('.quantidade-input');
    const subtotalDiv = item.querySelector('.subtotal-item');
    const produtoId = item.dataset.produtoId;
    
    const produto = this.state.getProdutoById(produtoId);
    if (!produto) return;
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    const subtotal = produto.preco * quantidade;
    
    subtotalDiv.textContent = UIManager.formatCurrency(subtotal);
    this.calculateTotalEncomenda();
};

DeliciaDePaoApp.prototype.removeItemEncomenda = function(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item) {
        item.remove();
        this.calculateTotalEncomenda();
    }
};

DeliciaDePaoApp.prototype.saveEncomenda = function(encomendaId = null) {
    console.log('Salvando encomenda...');
    
    // Verificar se é um novo cliente ou cliente existente
    const selectCliente = document.getElementById('encomendaCliente');
    const novoClienteContainer = document.getElementById('novoClienteFormContainer');
    
    let cliente;
    let isNovoCliente = false;
    
    if (novoClienteContainer && novoClienteContainer.style.display !== 'none') {
        // Cadastrar novo cliente
        const nome = document.getElementById('novoClienteNome').value.trim();
        const telefone = document.getElementById('novoClienteTelefone').value.trim();
        const email = document.getElementById('novoClienteEmail').value.trim();
        const rua = document.getElementById('novoClienteRua').value.trim();
        const bairro = document.getElementById('novoClienteBairro').value.trim();
        const cidade = document.getElementById('novoClienteCidade').value.trim();
        const cep = document.getElementById('novoClienteCep').value.trim();
        
        // Validações
        if (!nome) {
            UIManager.showToast('Nome do cliente é obrigatório', 'error');
            return;
        }
        
        if (!telefone) {
            UIManager.showToast('Telefone do cliente é obrigatório', 'error');
            return;
        }
        
        // Criar novo cliente
        cliente = {
            nome: nome,
            telefone: telefone,
            email: email || null,
            endereco: {
                rua: rua || null,
                bairro: bairro || null,
                cidade: cidade || null,
                cep: cep || null
            }
        };
        
        cliente = this.state.addCliente(cliente);
        isNovoCliente = true;
        
        console.log('Novo cliente cadastrado:', cliente);
    } else {
        // Usar cliente existente
        const clienteId = selectCliente.value;
        if (!clienteId) {
            UIManager.showToast('Selecione um cliente ou cadastre um novo', 'error');
            return;
        }
        
        cliente = this.state.getClienteById(clienteId);
        if (!cliente) {
            UIManager.showToast('Cliente não encontrado', 'error');
            return;
        }
    }
    
    // Coletar dados da encomenda
    const dataEncomenda = document.getElementById('encomendaData').value;
    const horarioEncomenda = document.getElementById('encomendaHorario').value;
    const observacoes = document.getElementById('encomendaObservacoes').value;
    const formaPagamento = document.getElementById('encomendaFormaPagamento').value;
    const valorPago = parseFloat(document.getElementById('encomendaValorPago').value) || 0;
    
    if (!dataEncomenda) {
        UIManager.showToast('Data da encomenda é obrigatória', 'error');
        return;
    }
    
    if (!horarioEncomenda) {
        UIManager.showToast('Horário da encomenda é obrigatório', 'error');
        return;
    }
    
    if (!formaPagamento) {
        UIManager.showToast('Forma de pagamento é obrigatória', 'error');
        return;
    }
    
    // Coletar itens da encomenda
    const itens = [];
    const itemElements = document.querySelectorAll('.item-encomenda');
    
    if (itemElements.length === 0) {
        UIManager.showToast('Adicione pelo menos um produto à encomenda', 'error');
        return;
    }
    
    let valorTotal = 0;
    
    itemElements.forEach((item, index) => {
        const produtoId = item.dataset.produtoId;
        const quantidadeInput = item.querySelector('.quantidade-input');
        
        const quantidade = parseInt(quantidadeInput.value) || 0;
        
        if (!produtoId) {
            UIManager.showToast(`Produto não selecionado no item ${index + 1}`, 'error');
            return;
        }
        
        if (quantidade <= 0) {
            UIManager.showToast(`Quantidade inválida no item ${index + 1}`, 'error');
            return;
        }
        
        const produto = this.state.getProdutoById(produtoId);
        if (!produto) {
            UIManager.showToast(`Produto não encontrado no item ${index + 1}`, 'error');
            return;
        }
        
        const subtotal = produto.preco * quantidade;
        valorTotal += subtotal;
        
        itens.push({
            produto: produto,
            quantidade: quantidade,
            precoUnitario: produto.preco,
            subtotal: subtotal
        });
    });
    
    if (itens.length === 0) {
        UIManager.showToast('Adicione pelo menos um produto à encomenda', 'error');
        return;
    }
    
    // Criar ou atualizar encomenda
    const encomendaData = {
        cliente: cliente,
        dataEncomenda: new Date(dataEncomenda + 'T' + horarioEncomenda),
        horarioEncomenda: horarioEncomenda,
        itens: itens,
        valorTotal: valorTotal,
        observacoes: observacoes || null,
        formaPagamento: formaPagamento,
        valorPago: valorPago,
        status: STATUS_ENCOMENDA.ABERTO
    };
    
    let encomenda;
    if (encomendaId) {
        // Atualizar encomenda existente
        encomenda = this.state.updateEncomenda(encomendaId, encomendaData);
    } else {
        // Criar nova encomenda
        encomenda = this.state.addEncomenda(encomendaData);
    }
    
    if (encomenda) {
        UIManager.hideModal();
        
        if (isNovoCliente) {
            UIManager.showToast(`Cliente ${cliente.nome} cadastrado e encomenda criada com sucesso!`, 'success');
        } else {
            UIManager.showToast('Encomenda criada com sucesso!', 'success');
        }
        
        // Atualizar listas
        this.renderEncomendas();
        this.renderClientes();
        this.updateDashboardStats();
        
        console.log('Encomenda salva:', encomenda);
    } else {
        UIManager.showToast('Erro ao salvar encomenda', 'error');
    }
};

DeliciaDePaoApp.prototype.calculateTotalEncomenda = function() {
    const itemElements = document.querySelectorAll('.item-encomenda');
    let total = 0;
    
    itemElements.forEach(item => {
        const produtoId = item.dataset.produtoId;
        const quantidadeInput = item.querySelector('.quantidade-input');
        
        const produto = this.state.getProdutoById(produtoId);
        if (!produto) return;
        
        const quantidade = parseInt(quantidadeInput.value) || 0;
        total += produto.preco * quantidade;
    });
    
    const valorTotalElement = document.getElementById('valorTotalEncomenda');
    if (valorTotalElement) {
        valorTotalElement.textContent = UIManager.formatCurrency(total);
        // Recalcular valor restante quando o total mudar
        this.calculateValorRestante();
    }
};

DeliciaDePaoApp.prototype.calculateValorRestante = function() {
    const valorTotalElement = document.getElementById('valorTotalEncomenda');
    const valorPagoInput = document.getElementById('encomendaValorPago');
    const valorRestanteElement = document.getElementById('valorRestanteEncomenda');
    
    if (!valorTotalElement || !valorPagoInput || !valorRestanteElement) return;
    
    // Extrair valor total (remover "R$ " e converter vírgula para ponto)
    const valorTotalText = valorTotalElement.textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const valorTotal = parseFloat(valorTotalText) || 0;
    
    // Extrair valor pago
    const valorPago = parseFloat(valorPagoInput.value) || 0;
    
    // Calcular valor restante
    const valorRestante = Math.max(0, valorTotal - valorPago);
    
    // Atualizar display
    valorRestanteElement.textContent = UIManager.formatCurrency(valorRestante);
    
    // Mudar cor baseado no status do pagamento
    if (valorRestante === 0) {
        valorRestanteElement.style.color = 'var(--success)';
    } else if (valorPago > 0) {
        valorRestanteElement.style.color = 'var(--warning)';
    } else {
        valorRestanteElement.style.color = 'var(--error)';
    }
};

DeliciaDePaoApp.prototype.renderItensEncomenda = function(itens) {
    if (!itens || itens.length === 0) return '';
    
    return itens.map((item, index) => `
        <div class="item-encomenda" data-index="${index}" data-produto-id="${item.produto.id}">
            <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr auto;">
                <div class="produto-selecionado">
                    <div class="produto-info-display">
                        <strong>${item.produto.nome}</strong>
                        <small>${UIManager.formatCurrency(item.produto.preco)}</small>
                    </div>
                </div>
                <input type="number" class="form-input quantidade-input" min="1" value="${item.quantidade}" onchange="app.updateItemEncomenda(${index})" placeholder="Qtd">
                <div class="subtotal-item">${UIManager.formatCurrency(item.subtotal)}</div>
                <button type="button" class="btn btn-sm btn-error" onclick="app.removeItemEncomenda(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

DeliciaDePaoApp.prototype.saveProduto = function(produtoId = null) {
    console.log('Salvando produto...');
    
    const produtoNome = document.getElementById('produtoNome').value.trim();
    const produtoPreco = parseFloat(document.getElementById('produtoPreco').value);
    const produtoCategoria = document.getElementById('produtoCategoria').value;
    const produtoSetor = document.getElementById('produtoSetor').value;
    const produtoDescricao = document.getElementById('produtoDescricao').value.trim();
    const produtoImagem = document.getElementById('produtoImagem').files[0]; // Pega o arquivo

    const errors = [];

    if (!produtoNome) {
        errors.push('Nome do produto é obrigatório.');
    }
    if (produtoPreco <= 0) {
        errors.push('Preço deve ser maior que zero.');
    }
    if (!produtoCategoria) {
        errors.push('Categoria é obrigatória.');
    }
    if (!produtoSetor) {
        errors.push('Setor de produção é obrigatório.');
    }
    if (!produtoImagem) {
        errors.push('Foto do produto é obrigatória.');
    }

    if (errors.length > 0) {
        UIManager.showToast(errors.join('\n'), 'error');
        return;
    }

    const produto = {
        nome: produtoNome,
        preco: produtoPreco,
        categoria: produtoCategoria,
        setor: produtoSetor,
        descricao: produtoDescricao,
        imagem: produtoImagem ? URL.createObjectURL(produtoImagem) : null, // Salva o caminho da imagem
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
    };

    let savedProduto;
    if (produtoId) {
        savedProduto = this.state.updateProduto(produtoId, produto);
    } else {
        savedProduto = this.state.addProduto(produto);
    }

    if (savedProduto) {
        UIManager.hideModal();
        UIManager.showToast(`Produto "${savedProduto.nome}" ${produtoId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        this.renderProdutos();
        this.updateDashboardStats();
        console.log('Produto salvo:', savedProduto);
    } else {
        UIManager.showToast('Erro ao salvar produto', 'error');
    }
};

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INICIALIZAÇÃO DA APLICAÇÃO ===');
    console.log('DOM carregado, inicializando aplicação...');
    
    try {
        window.app = new DeliciaDePaoApp();
        console.log('Aplicação inicializada com sucesso:', window.app);
    } catch (error) {
        console.error('ERRO ao inicializar aplicação:', error);
        console.error('Stack trace:', error.stack);
    }
    
    console.log('=== FIM DA INICIALIZAÇÃO ===');
});

// Exportar classes para uso global
window.DeliciaDePaoApp = DeliciaDePaoApp;
window.UIManager = UIManager;
window.DataManager = DataManager;

