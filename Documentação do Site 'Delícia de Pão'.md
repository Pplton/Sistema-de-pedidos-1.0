
# Documentação do Site 'Delícia de Pão'

## 1. Funcionalidade: Realizar Encomenda

Esta seção permite que os usuários criem novas encomendas. A interface atual apresenta os seguintes elementos e comportamentos:

*   **Campo de Pesquisa de Produto:** Permite buscar produtos existentes.
*   **Nome do Produto:** Campo para exibir ou inserir o nome do produto.
*   **Valor Unitário:** Campo para exibir ou inserir o valor individual do produto.
*   **Quantidade:** Campo para definir a quantidade do produto, com botões para aumentar e diminuir.
*   **Valor Total:** Exibe o valor total calculado para o item.
*   **Botões de Ação para o Produto:** Incluem 'Cancelar produto' e 'Adicionar produto'.
*   **Lista de Produtos na Encomenda:** Exibe os produtos adicionados à encomenda, com suas quantidades, valores unitários e totais. Inclui botões para 'Excluir item'.
*   **Subtotal:** Exibe o valor total da encomenda.
*   **Observação:** Campo de texto para adicionar observações à encomenda.
*   **Botões de Ação da Encomenda:** 'Cancelar Encomenda' e 'Avançar'.

**Observações:**
*   A pesquisa de produtos parece funcionar, mas a adição de produtos à lista de encomenda não foi totalmente testada devido a limitações da plataforma original.
*   A interface é simples e direta, mas pode ser aprimorada em termos de usabilidade e feedback visual.




## 2. Funcionalidade: Visualizar Encomenda

Esta seção permite aos usuários visualizar e gerenciar encomendas existentes. A interface atual apresenta os seguintes elementos e comportamentos:

*   **Filtros:**
    *   **Data da encomenda:** Campo para filtrar encomendas por data.
    *   **Status da encomenda:** Dropdown com opções como "Encomenda Realizada", "Encomenda em Aberto", "Encomenda Cancelada", "Encomenda Retirada".
*   **Lista de Encomendas:** Exibe as encomendas com as seguintes informações:
    *   Nome do cliente
    *   Telefone
    *   Data da encomenda
    *   Horário da encomenda
    *   Status da encomenda
*   **Ações por Encomenda:** Para cada encomenda listada, existem botões de ação:
    *   **Pedido retirado:** Marca a encomenda como retirada.
    *   **Editar dados do cliente:** Abre um pop-up com os detalhes da encomenda, mas não permite a edição direta dos dados do cliente na interface atual.
    *   **Editar pedido:** Abre um pop-up com os detalhes da encomenda, mas não permite a edição direta dos itens do pedido na interface atual.
    *   **Status do pedido:** Permite alterar o status da encomenda.

**Observações:**
*   A funcionalidade de visualização e filtragem parece estar funcionando.
*   A edição de dados do cliente e do pedido não é diretamente possível através dos botões na interface atual, apenas a visualização dos detalhes em um pop-up. Isso será um ponto chave para aprimoramento na nova versão.




## 3. Funcionalidade: Cadastrar Produto

Esta seção permite o cadastro de novos produtos. A interface atual apresenta os seguintes elementos e comportamentos:

*   **Filtros:**
    *   **Setor de Produção:** Dropdown para filtrar produtos por setor (Padaria, Confeitaria, Salgaderia).
    *   **Categoria:** Dropdown para filtrar produtos por categoria (Salgados tradicionais Fritos, Salgados tradicionais Assados, Tortas, Doces Tradicionais, Doces Especiais, Pães, Salgados Especiais).
    *   **Buscar Item:** Campo de texto para pesquisar produtos.
*   **Lista de Produtos:** Exibe os produtos cadastrados com as seguintes informações:
    *   Nome do produto
    *   Preço
    *   Setor de Produção
    *   Categoria
*   **Ações por Produto:** Para cada produto listado, existem botões de ação:
    *   **Editar item:** Permite editar os dados do produto.
    *   **Excluir item:** Permite excluir o produto.
*   **Botão 'Cadastrar Produto':** Abre um pop-up para o cadastro de um novo produto, com os seguintes campos:
    *   **Nome do produto:** Campo de texto para o nome do produto.
    *   **Valor do produto:** Campo de texto para o valor do produto.
    *   **Categoria do produto:** Dropdown para selecionar a categoria.
    *   **Setor de produção:** Dropdown para selecionar o setor.
    *   **Botão 'Cadastrar':** Finaliza o cadastro do produto.

**Observações:**
*   A funcionalidade de cadastro e listagem de produtos parece estar completa.
*   A edição e exclusão de produtos também estão presentes.




## 4. Estrutura Geral do Site

O site atual, construído na plataforma Bubble.io, apresenta uma estrutura de navegação simples e direta, baseada em páginas distintas para cada funcionalidade principal:

*   **Página Inicial:** Contém botões de navegação para as principais funcionalidades: "Realizar encomenda", "Visualizar encomenda" e "Cadastrar produto".
*   **Página "Realizar Encomenda":** Dedicada à criação de novas encomendas, com formulários para adicionar produtos e finalizar o pedido.
*   **Página "Visualizar Encomenda":** Apresenta uma lista de encomendas existentes, com opções de filtragem e ações para cada encomenda (visualizar detalhes, alterar status).
*   **Página "Cadastrar Produto":** Permite o gerenciamento de produtos, incluindo listagem, cadastro, edição e exclusão.

**Observações:**
*   A navegação é baseada em redirecionamentos de página, o que é comum em aplicações web.
*   A responsividade não foi avaliada em detalhes na plataforma original, mas será um foco principal na nova implementação em HTML/CSS/JS.
*   A persistência de dados é gerenciada pela plataforma Bubble.io, e na nova implementação será necessário definir uma estratégia de armazenamento de dados (local storage, API com backend, etc.).




## 5. Funcionalidades a Serem Implementadas/Aprimoradas

Na nova versão do site, as seguintes funcionalidades serão implementadas ou aprimoradas para atender aos requisitos do usuário:

*   **Edição de Pedidos:**
    *   Permitir a modificação de pedidos existentes, incluindo a adição, remoção ou alteração da quantidade de produtos em um pedido.
    *   Atualização automática do valor total do pedido após as modificações.
    *   Interface intuitiva para facilitar a edição.

*   **Edição de Clientes:**
    *   Possibilitar a edição dos dados cadastrais dos clientes associados a uma encomenda.
    *   Campos editáveis para nome, telefone, endereço e outras informações relevantes do cliente.
    *   Validação dos dados inseridos para garantir a integridade.

**Considerações para a Implementação:**
*   A implementação dessas funcionalidades exigirá a criação de formulários e lógica de manipulação de dados no frontend (HTML, CSS, JavaScript).
*   Será necessário definir como os dados serão persistidos (por exemplo, usando Local Storage para uma solução mais simples, ou integrando com uma API para um backend mais robusto, dependendo da complexidade e escala desejada pelo usuário).
*   A responsividade será crucial para garantir que essas funcionalidades sejam acessíveis e utilizáveis em diferentes dispositivos.


