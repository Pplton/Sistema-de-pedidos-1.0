# Planejamento da Arquitetura - Sistema de Encomendas Delícia de Pão

## 1. Estrutura de Dados

### 1.1 Modelo de Dados para Produtos

A estrutura de dados para produtos será fundamental para o funcionamento do sistema. Cada produto terá as seguintes propriedades:

```javascript
const produto = {
    id: "string", // Identificador único do produto
    nome: "string", // Nome do produto
    preco: "number", // Preço unitário do produto
    categoria: "string", // Categoria do produto
    setor: "string", // Setor de produção
    ativo: "boolean", // Status do produto (ativo/inativo)
    dataCriacao: "Date", // Data de criação do produto
    dataAtualizacao: "Date" // Data da última atualização
};
```

As categorias disponíveis serão:
- Salgados tradicionais Fritos
- Salgados tradicionais Assados
- Tortas
- Doces Tradicionais
- Doces Especiais
- Pães
- Salgados Especiais

Os setores de produção serão:
- Padaria
- Confeitaria
- Salgaderia

### 1.2 Modelo de Dados para Clientes

A estrutura de dados para clientes permitirá o armazenamento e edição das informações dos clientes:

```javascript
const cliente = {
    id: "string", // Identificador único do cliente
    nome: "string", // Nome completo do cliente
    telefone: "string", // Telefone de contato
    email: "string", // Email do cliente (opcional)
    endereco: {
        rua: "string",
        numero: "string",
        bairro: "string",
        cidade: "string",
        cep: "string"
    }, // Endereço completo (opcional)
    dataCadastro: "Date", // Data de cadastro do cliente
    dataAtualizacao: "Date" // Data da última atualização
};
```

### 1.3 Modelo de Dados para Encomendas

A estrutura de dados para encomendas será a mais complexa, integrando produtos e clientes:

```javascript
const encomenda = {
    id: "string", // Identificador único da encomenda
    cliente: {
        id: "string", // ID do cliente
        nome: "string", // Nome do cliente
        telefone: "string" // Telefone do cliente
    },
    itens: [
        {
            produtoId: "string", // ID do produto
            nome: "string", // Nome do produto
            preco: "number", // Preço unitário
            quantidade: "number", // Quantidade solicitada
            subtotal: "number" // Preço * quantidade
        }
    ],
    valorTotal: "number", // Valor total da encomenda
    status: "string", // Status da encomenda
    observacoes: "string", // Observações adicionais
    dataEncomenda: "Date", // Data da encomenda
    horarioEncomenda: "string", // Horário da encomenda
    dataRetirada: "Date", // Data prevista para retirada
    dataCriacao: "Date", // Data de criação do registro
    dataAtualizacao: "Date" // Data da última atualização
};
```

Os status possíveis para encomendas serão:
- Encomenda em Aberto
- Encomenda Realizada
- Encomenda Cancelada
- Encomenda Retirada

## 2. Arquitetura de Componentes

### 2.1 Estrutura Modular

A aplicação será desenvolvida seguindo uma arquitetura modular, com componentes reutilizáveis e bem definidos:

**Componentes Principais:**
- `App`: Componente raiz da aplicação
- `Header`: Cabeçalho com logo e navegação
- `Navigation`: Menu de navegação principal
- `Dashboard`: Página inicial com resumo e acesso rápido
- `ProductManager`: Gerenciamento de produtos
- `OrderManager`: Gerenciamento de encomendas
- `CustomerManager`: Gerenciamento de clientes

**Componentes de Interface:**
- `Modal`: Componente modal reutilizável
- `Form`: Componentes de formulário
- `Table`: Tabela responsiva para listagens
- `Card`: Cartões para exibição de informações
- `Button`: Botões padronizados
- `Input`: Campos de entrada padronizados

**Componentes de Funcionalidade:**
- `ProductForm`: Formulário de cadastro/edição de produtos
- `OrderForm`: Formulário de criação/edição de encomendas
- `CustomerForm`: Formulário de cadastro/edição de clientes
- `OrderDetails`: Detalhes de uma encomenda
- `ProductSearch`: Busca de produtos
- `StatusManager`: Gerenciamento de status de encomendas

### 2.2 Fluxo de Dados

O fluxo de dados seguirá um padrão unidirecional, com estado centralizado:

1. **Estado Global**: Gerenciado através de um objeto JavaScript central
2. **Eventos**: Propagação de eventos através de custom events
3. **Persistência**: Sincronização automática com localStorage
4. **Validação**: Validação de dados em tempo real

## 3. Estratégia de Persistência de Dados

### 3.1 Local Storage

Para esta implementação, utilizaremos o localStorage do navegador como estratégia principal de persistência, oferecendo as seguintes vantagens:

- **Simplicidade**: Não requer configuração de servidor ou banco de dados
- **Rapidez**: Acesso instantâneo aos dados
- **Offline**: Funciona sem conexão com a internet
- **Compatibilidade**: Suportado por todos os navegadores modernos

### 3.2 Estrutura de Armazenamento

Os dados serão organizados no localStorage da seguinte forma:

```javascript
// Chaves do localStorage
const STORAGE_KEYS = {
    PRODUTOS: 'delicia_produtos',
    CLIENTES: 'delicia_clientes',
    ENCOMENDAS: 'delicia_encomendas',
    CONFIGURACOES: 'delicia_config'
};
```

### 3.3 Gerenciamento de Dados

Será implementada uma camada de abstração para gerenciar a persistência:

```javascript
class DataManager {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    static load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    
    static remove(key) {
        localStorage.removeItem(key);
    }
}
```

## 4. Estrutura de Navegação e Roteamento

### 4.1 Single Page Application (SPA)

A aplicação será desenvolvida como uma SPA, com roteamento baseado em hash ou History API:

**Rotas Principais:**
- `/` - Dashboard principal
- `/produtos` - Gerenciamento de produtos
- `/encomendas` - Listagem de encomendas
- `/encomendas/nova` - Nova encomenda
- `/encomendas/:id` - Detalhes/edição de encomenda
- `/clientes` - Gerenciamento de clientes

### 4.2 Sistema de Roteamento

Implementação de um roteador simples em JavaScript:

```javascript
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }
    
    addRoute(path, handler) {
        this.routes[path] = handler;
    }
    
    navigate(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            this.routes[path]();
            history.pushState(null, null, `#${path}`);
        }
    }
}
```

## 5. Design System e Paleta de Cores

### 5.1 Paleta de Cores

Baseando-se na identidade visual existente do "Delícia de Pão", a paleta de cores será:

**Cores Primárias:**
- Vermelho Principal: `#C41E3A` (cor dominante do site original)
- Dourado: `#FFD700` (presente no logo)
- Branco: `#FFFFFF`

**Cores Secundárias:**
- Vermelho Escuro: `#8B0000` (para hover e estados ativos)
- Cinza Claro: `#F5F5F5` (backgrounds)
- Cinza Médio: `#CCCCCC` (bordas)
- Cinza Escuro: `#333333` (textos)

**Cores de Status:**
- Sucesso: `#28A745`
- Aviso: `#FFC107`
- Erro: `#DC3545`
- Informação: `#17A2B8`

### 5.2 Tipografia

**Fonte Principal:** 
- Família: 'Roboto', sans-serif
- Pesos: 300 (light), 400 (regular), 500 (medium), 700 (bold)

**Hierarquia Tipográfica:**
- H1: 2.5rem (40px) - Títulos principais
- H2: 2rem (32px) - Títulos de seção
- H3: 1.5rem (24px) - Subtítulos
- Body: 1rem (16px) - Texto padrão
- Small: 0.875rem (14px) - Textos auxiliares

### 5.3 Espaçamento e Grid

**Sistema de Espaçamento:**
- Base: 8px
- Múltiplos: 8px, 16px, 24px, 32px, 48px, 64px

**Grid Responsivo:**
- Container máximo: 1200px
- Breakpoints:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

## 6. Responsividade para Diferentes Dispositivos

### 6.1 Abordagem Mobile-First

A aplicação será desenvolvida seguindo a metodologia mobile-first, garantindo uma experiência otimizada em dispositivos móveis:

**Características Mobile:**
- Interface touch-friendly
- Botões com tamanho mínimo de 44px
- Navegação simplificada
- Formulários otimizados para teclados virtuais

### 6.2 Adaptações por Dispositivo

**Mobile (320px - 767px):**
- Menu hambúrguer
- Cards em coluna única
- Formulários em tela cheia
- Tabelas com scroll horizontal

**Tablet (768px - 1023px):**
- Menu lateral retrátil
- Cards em duas colunas
- Formulários em modal
- Tabelas responsivas com quebra de linha

**Desktop (1024px+):**
- Menu lateral fixo
- Cards em grid flexível
- Formulários inline
- Tabelas completas

### 6.3 Técnicas de Responsividade

**CSS Grid e Flexbox:**
```css
.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.card {
    display: flex;
    flex-direction: column;
    min-height: 200px;
}
```

**Media Queries:**
```css
/* Mobile First */
.navigation {
    display: none;
}

/* Tablet */
@media (min-width: 768px) {
    .navigation {
        display: block;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .navigation {
        position: fixed;
        width: 250px;
    }
}
```

Esta arquitetura fornece uma base sólida para o desenvolvimento de uma aplicação web moderna, responsiva e funcional, que atenderá às necessidades específicas do sistema de encomendas da "Delícia de Pão" enquanto oferece uma experiência de usuário superior à versão original.

