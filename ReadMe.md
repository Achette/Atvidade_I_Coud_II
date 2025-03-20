# Atividade I - Cloud II

### Sistema de mensageria hotel

Consumidor para ler os dados de Reservas gerados por um sistema de
hotelaria.

## Alunos

- Eduarda Matos
- Igor Achete
- João Paulo Falcuci
- Victor Hugo Moro

## Executando a aplicação

Após clonar o repositório, na pasta raíz, instale as dependências do projeto:

```
npm install
```

Crie um arquivo `.env` para definir a porta que sua aplicação utilizará e o link de conexão com seu banco de dados. Neste projeto, utiliza-se o PostgresSQL.

- OBS: Altere a senha e o nome do banco de dados.

```
PORT=3000
DATABASE_URL="postgres://postgres:suaSenha@localhost:5432/nomeDoBancoDeDados?schema=public"
```

Após finalizar a instalação e ter criado o `.env`, na pasta `src`, inicie o consumer, para buscar e processar as mensagens advindas do Pub/Sub, execute o comando:

```
npm run consumer
```

Em paralelo, abra um novo terminal e execute o servidor:

```
npm run server
```

Com o servidor ativo, é possível acessar os dados pelo navegador, na porta definida no seu `.env` ou em aplicativos, como Postman, Insomina...  
Exemplo:  
Acesse a rota para visualizar todas as reservas

```
http://localhost:3000/reserves
```

Acesse a rota, passando um uuid como parametro para acessar uma reserva específica

```
http://localhost:3000/reserves/:uuid
```

## DER - Diagrama Relacional

<div align="center">
  <a href="https://mermaid.live/edit#pako:eNqNU1FSgzAQvUom33IB_rBFp1PHKm39cJjprGShGUuCIXFU6IE8hxczFGhLwdp8ZMjb93Y3y0tBI8mQuhTVmEOiIA0FsWt0N_HvFz4pS8eRBQn8uR88ecQlIY3hK6Q1q4Ub1uPSCxazVYOOZzt6JIX--U5bSY-zlY5Tlg2-UyiMUaGTY1fTMkfewr-dBZO6mwyVRhH9wZ0vr1fn-Ydoc4kBicxzwytBdzZFfawWF5pwRh6mByjXiouECJliDW5bfTu1i_TGWHx5hDPQqHmKJFJoP5mnB2JcMPwAJv20l1DzTHYLRxuOQuOEkZvpSau9v3W-5wpSmKN6h6NsbeTNgNLyJBBvJGjCOCgOXbowKSppXZl3L1htENRVBtu9bLCRTZVIW_WkoSacm5fRAGNf6mCRoqc9Krjnd211VvNPk01KekXtfFLgzL7eXb6Q6jVat9HKtAzUa2XZreWB0XL-KSLqamXwiippkjV1Y9jk9mSyaqrN69-jGYhnKdvz9hfcejsS">
    <img src="https://mermaid.ink/img/pako:eNqNU1FSgzAQvUom33IB_rBFp1PHKm39cJjprGShGUuCIXFU6IE8hxczFGhLwdp8ZMjb93Y3y0tBI8mQuhTVmEOiIA0FsWt0N_HvFz4pS8eRBQn8uR88ecQlIY3hK6Q1q4Ub1uPSCxazVYOOZzt6JIX--U5bSY-zlY5Tlg2-UyiMUaGTY1fTMkfewr-dBZO6mwyVRhH9wZ0vr1fn-Ydoc4kBicxzwytBdzZFfawWF5pwRh6mByjXiouECJliDW5bfTu1i_TGWHx5hDPQqHmKJFJoP5mnB2JcMPwAJv20l1DzTHYLRxuOQuOEkZvpSau9v3W-5wpSmKN6h6NsbeTNgNLyJBBvJGjCOCgOXbowKSppXZl3L1htENRVBtu9bLCRTZVIW_WkoSacm5fRAGNf6mCRoqc9Krjnd211VvNPk01KekXtfFLgzL7eXb6Q6jVat9HKtAzUa2XZreWB0XL-KSLqamXwiippkjV1Y9jk9mSyaqrN69-jGYhnKdvz9hfcejsS?type=png" alt="Diagrama Relacional">
  </a>
</div>

## Estrutura do Projeto

```
- /prisma - Esquema Prisma e migrations
- /src
  - /routes - rotas da API
  - consumer.js - Consumidor das mensagens (usando o Google Cloud Pub/Sub)
  - server.js - Arquivo principal da aplicação
- .env - variáveis de ambiente do projeto
- package.json - Dependências do projeto
```
