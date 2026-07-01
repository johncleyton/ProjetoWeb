# Projeto Web: Estância d'Oliveira

Website institucional e sistema de gestão para o restaurante **Estância d'Oliveira**, localizado em Campinas-SP. A plataforma oferece cardápio digital, carta de vinhos com painel administrativo, sistema de pedidos de marmitas e um canal de "Trabalhe Conosco" com envio de currículos.

**Integrantes:**
- Frederico Scheffel Oliveira - 15452718
- Leonardo Massuhiro Sato - 15469108
- Larissa Pires Moreira Rocha Duarte - 15522358

## Funcionalidades

| Área | Descrição |
|---|---|
| **Home / Cardápio** | Apresentação do restaurante, preços por dia da semana e galeria de pratos. |
| **Carta de Vinhos** | Catálogo público de vinhos com imagens. Painel admin para CRUD completo (criar, editar, excluir) com upload de imagem. |
| **Marmita** | Montagem de marmita personalizada com envio do pedido via API. |
| **Trabalhe Conosco** | Formulário de envio de currículo (PDF) com seleção de cargo desejado. Área administrativa para visualização e gerenciamento dos currículos recebidos. |
| **Autenticação** | Cadastro e login de usuários com JWT. Controle de acesso por roles (`admin` / `user`). |

## Arquitetura

```
ProjetoWeb/
├── index.html              # Página principal (Home + Cardápio + Contato)
├── vinhos.html             # Página da carta de vinhos
├── marmita.html            # Página de pedidos de marmita
├── curriculos.html         # Painel admin de currículos
├── style.css               # Estilos globais
├── script.js               # Lógica do frontend (Home)
├── vinhos.js               # Lógica da carta de vinhos
├── marmita.js              # Lógica de pedidos de marmita
├── curriculos.js           # Lógica do painel de currículos
├── auth.js                 # Autenticação frontend (login/registro/JWT)
├── images/                 # Imagens estáticas (logo, fotos de pratos)
├── docker-compose.yml      # MinIO (armazenamento S3)
└── backend/
    ├── index.js            # Servidor Express (entry point)
    ├── dbsync.js           # Sincronização do banco + seed do admin
    ├── package.json
    ├── .env.example        # Variáveis de ambiente (modelo)
    ├── models/
    │   ├── dbconfig.js     # Configuração Sequelize/PostgreSQL
    │   ├── user.model.js   # Modelo de usuários
    │   ├── wine.model.js   # Modelo de vinhos
    │   └── curriculum.model.js  # Modelo de currículos
    ├── controllers/
    │   ├── auth.controller.js       # Registro, login e /me
    │   ├── wine.controller.js       # CRUD de vinhos
    │   ├── order.controller.js      # Pedidos (marmita e vinho)
    │   └── curriculum.controller.js # Envio e gestão de currículos
    ├── routes/
    │   └── api.routes.js   # Definição de todas as rotas /api
    ├── middleware/
    │   └── auth.middleware.js  # Verificação JWT + role admin
    └── media/
        ├── minio.client.js    # Cliente MinIO (criação de buckets, upload/download)
        └── media.uploader.js  # Middleware Multer para upload de arquivos
```

## Tecnologias

| Camada | Tecnologias |
|---|---|
| **Frontend** | HTML5, CSS3 (vanilla), JavaScript (ES6+) |
| **Backend** | Node.js, Express |
| **Banco de Dados** | PostgreSQL + Sequelize (ORM) |
| **Armazenamento** | MinIO (compatível S3) via Docker |
| **Autenticação** | JWT (jsonwebtoken) + bcryptjs |
| **Upload** | Multer |
| **Containerização** | Docker Compose (MinIO) |

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+ instalado
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando
- [Docker](https://www.docker.com/) e Docker Compose instalados (para o MinIO)
- [Git](https://git-scm.com/) instalado

### 1. Clonar o repositório

```bash
git clone https://github.com/johncleyton/ProjetoWeb.git
cd ProjetoWeb
```

### 2. Subir o MinIO (armazenamento de imagens e currículos)

```bash
docker compose up -d
```

Isso iniciará o MinIO nas portas:
- **9000** - API S3
- **9001** - Console Web (acesse `http://localhost:9001` com `minioadmin` / `minioadmin`)

### 3. Criar o banco de dados PostgreSQL

Acesse o PostgreSQL e crie o banco:

```sql
CREATE DATABASE estancia_db;
```

### 4. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `backend/.env` com as suas credenciais:

```env
# Banco de Dados
PGHOST=localhost
PGUSER=postgres
PGDATABASE=estancia_db
PGPASSWORD=sua_senha_aqui
PGPORT=5432

# JWT
AUTH_SECRET=minha_chave_secreta_super_segura

# Admin Padrão
ADMIN_EMAIL=admin@estancia.com
ADMIN_PASSWORD=admin123

# Servidor
PORT=3000

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=wines
```

### 5. Instalar dependências do backend

```bash
cd backend
npm install
```

### 6. Sincronizar o banco de dados (criar tabelas + admin)

```bash
npm run dbsync
```

Esse comando irá:
- Criar as tabelas `users`, `wines` e `curriculums`
- Criar o usuário administrador padrão configurado no `.env`

### 7. Iniciar o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com hot-reload)
npm run dev
```

O servidor estará disponível em **http://localhost:3000**.

O backend também serve os arquivos estáticos do frontend, então basta acessar `http://localhost:3000` no navegador para usar todo o sistema.

## Endpoints da API

Todas as rotas estão sob o prefixo `/api`.

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Cadastrar novo usuário | Não |
| `POST` | `/api/auth/login` | Login (retorna JWT) | Não |
| `GET` | `/api/auth/me` | Dados do usuário logado | JWT |

### Vinhos

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/wines` | Listar todos os vinhos | Não |
| `POST` | `/api/wines` | Criar vinho (com imagem) | Admin |
| `PUT` | `/api/wines/:id` | Editar vinho | Admin |
| `DELETE` | `/api/wines/:id` | Excluir vinho | Admin |

### Pedidos

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/orders/marmita` | Criar pedido de marmita | Não |
| `POST` | `/api/orders/wine` | Criar pedido de vinho | Não |

### Currículos

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/curriculum` | Enviar currículo (PDF) | JWT |
| `GET` | `/api/curriculum` | Listar todos os currículos | Admin |
| `DELETE` | `/api/curriculum/:id` | Excluir currículo | Admin |

## Acesso Administrativo

Após rodar o `npm run dbsync`, um usuário admin é criado automaticamente:

| Campo | Valor padrão |
|---|---|
| **E-mail** | `admin@estancia.com` |
| **Senha** | `admin123` |

Altere as credenciais padrão em produção editando o arquivo `.env`.

Com o login de admin, é possível:
- Gerenciar a carta de vinhos (adicionar, editar e remover vinhos com imagem)
- Visualizar e gerenciar os currículos recebidos

## Licença

ISC
