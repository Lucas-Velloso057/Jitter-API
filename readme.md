# 💻 Desafio Técnico Jitterbit: Order Management API

Este projeto consiste na implementação de uma API RESTful para gerenciamento de pedidos (CRUD), desenvolvida como parte do processo de avaliação técnica da Jitterbit.

A API inclui operações obrigatórias de Criação (POST) e Consulta por ID (GET), além das operações opcionais (Listagem, Atualização e Deleção), seguindo as melhores práticas de integração, mapeamento de dados e segurança (JWT).

## 🚀 1. Tecnologias Utilizadas

* **Linguagem:** JavaScript (Node.js)
* **Framework Web:** Express
* **ORM:** Sequelize (utilizado com PostgreSQL)
* **Banco de Dados:** PostgreSQL (via Docker Compose)
* **Autenticação:** JWT (JSON Web Token)
* **Documentação:** Swagger/OpenAPI

---

## 🛠️ 2. Pré-requisitos e Setup do Ambiente

Para rodar a API localmente, você precisa ter instalados:

1.  **Node.js** e **npm**
2.  **Docker** e **Docker Compose**

### 2.1. Configuração do Ambiente e Banco de Dados

1.  **Clone o Repositório:**
    ```bash
    git clone [SEU_LINK_DO_REPOSITORIO]
    cd jitterbit-api-challenge
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configuração do Banco de Dados (.env):**
    * Crie um arquivo chamado **`.env`** na raiz do projeto.
    * Copie o conteúdo do **`.env.example`** e preencha a chave `JWT_SECRET` e as credenciais do PostgreSQL (`DB_PASS` com sua senha).

    > **Nota:** As variáveis de ambiente do `.env` são usadas para configurar tanto o container Docker (PostgreSQL) quanto a aplicação Node.js (Sequelize e JWT).

4.  **Inicie o Banco de Dados (Docker Compose):**
    ```bash
    docker-compose up -d
    ```
    *(Este comando iniciará o container do PostgreSQL na porta 5432.)*

5.  **Inicie a API Node.js:**
    ```bash
    npm start
    ```
    *(A API iniciará na porta 3000 e, no primeiro acesso, o Sequelize criará as tabelas `Orders` e `Items` no banco de dados.)*

---

## 🔑 3. Fluxo de Autenticação e Uso da API

A API requer autenticação JWT para acessar qualquer rota de pedido (`/order/*`).

### 3.1. Obter o Token JWT

1.  **Endpoint:** `POST http://localhost:3000/login`
2.  **Body (raw JSON):**
    ```json
    {
      "apiKey": "SuaChaveSecretaMuitoForte123!" 
    }
    ```
    *(Use o valor definido em `JWT_SECRET` no seu arquivo `.env` como `apiKey`.)*

3.  **Resposta:** Copie o valor do campo `token` da resposta `200 OK`.

### 3.2. Usar o Token nas Requisições

Para todas as rotas em `/order`, inclua o cabeçalho **`Authorization`** no formato:

`Authorization: Bearer [SEU_TOKEN_AQUI]`

---

## 📝 4. Endpoints da API (CRUD Completo)

Todos os detalhes de schemas (entrada e saída) estão disponíveis na documentação Swagger.

| Operação | Método | URL | Descrição |
| :--- | :--- | :--- | :--- |
| **Login** | `POST` | `/login` | Gera o token JWT para autenticação. |
| **Criar Pedido** | `POST` | `/order` | **(Obrigatório)** Recebe o JSON em Português, aplica o mapeamento de dados e salva no DB. |
| **Obter por ID** | `GET` | `/order/:numeroPedido` | **(Obrigatório)** Consulta um pedido e seus itens pelo `numeroPedido`. |
| **Listar Todos** | `GET` | `/order/list` | **(Opcional)** Retorna todos os pedidos registrados. |
| **Atualizar** | `PUT` | `/order/:numeroPedido` | **(Opcional)** Atualiza os dados do pedido e substitui a lista de itens. |
| **Deletar** | `DELETE` | `/order/:numeroPedido` | **(Opcional)** Remove o pedido e seus itens associados. |

## 🔗 5. Documentação Interativa (Swagger)

A documentação interativa, incluindo os schemas de entrada (`OrderInput` em Português) e saída (`OrderOutput` em Inglês), está disponível no seguinte endereço:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 💡 6. Critérios de Avaliação Atendidos

* **Funcionalidade Completa:** CRUD implementado para Pedidos e Itens.
* **Mapeamento de Dados:** Implementação do `mapIncomingData` para transformar campos do JSON de entrada (Português) para o schema do banco de dados (Inglês).
* **Tratamento de Erros:** Uso de transações de DB para atomicidade e tratamento de erros (400, 404, 409, 500) com respostas HTTP adequadas.
* **Código Organizado:** Estrutura MVC com *controllers*, *models* e *routes*.
* **Recursos Opcionais Implementados:**
    * Autenticação JWT.
    * Documentação Swagger.