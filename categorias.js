// Variáveis globais
let categories = [];
let editingCategoryId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

// Configuração dos event listeners
function setupEventListeners() {
    // Busca de categorias
    const searchInput = document.getElementById('categorySearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterCategories(searchTerm);
    });

    // Formulário de categoria
    const categoryForm = document.getElementById('categoryForm');
    categoryForm.addEventListener('submit', handleCategorySubmit);
}

// Carregar categorias do banco de dados
async function loadCategories() {
    try {
        categories = await db.getCategories();
        renderCategories(categories);
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        utils.showNotification('Erro ao carregar categorias', 'error');
    }
}

// Renderizar categorias na grid
function renderCategories(categoriesToRender) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    if (categoriesToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <p>Nenhuma categoria encontrada</p>
            </div>
        `;
        return;
    }

    categoriesToRender.forEach(category => {
        const card = createCategoryCard(category);
        grid.appendChild(card);
    });
}

// Criar card de categoria
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
        <div class="category-header">
            <h3 class="category-title">${category.name}</h3>
            <div class="category-actions">
                <button onclick="editCategory(${category.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCategory(${category.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="category-description">${category.description}</p>
        <div class="category-stats">
            <div class="stat-item">
                <i class="fas fa-box"></i>
                <span>${category.productCount || 0} produtos</span>
            </div>
        </div>
    `;
    return card;
}

// Filtrar categorias
function filterCategories(searchTerm) {
    const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm)
    );
    renderCategories(filtered);
}

// Mostrar modal de adicionar categoria
function showAddCategoryModal() {
    editingCategoryId = null;
    document.getElementById('modalTitle').textContent = 'Nova Categoria';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'block';
}

// Mostrar modal de editar categoria
function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    editingCategoryId = categoryId;
    document.getElementById('modalTitle').textContent = 'Editar Categoria';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description;
    document.getElementById('categoryModal').style.display = 'block';
}

// Fechar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Manipular envio do formulário
async function handleCategorySubmit(e) {
    e.preventDefault();

    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    try {
        if (editingCategoryId) {
            await db.updateCategory(editingCategoryId, categoryData);
            utils.showNotification('Categoria atualizada com sucesso!', 'success');
        } else {
            await db.addCategory(categoryData);
            utils.showNotification('Categoria adicionada com sucesso!', 'success');
        }

        closeModal('categoryModal');
        loadCategories();
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        utils.showNotification('Erro ao salvar categoria', 'error');
    }
}

// Excluir categoria
async function deleteCategory(categoryId) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
        await db.deleteCategory(categoryId);
        utils.showNotification('Categoria excluída com sucesso!', 'success');
        loadCategories();
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        utils.showNotification('Erro ao excluir categoria', 'error');
    }
} 