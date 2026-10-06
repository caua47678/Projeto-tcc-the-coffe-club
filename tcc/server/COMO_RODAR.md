# Como rodar o The Coffe Club com o banco de dados integrado

O site agora busca os produtos do banco `thecoffe.db` e salva os pedidos
nele de verdade, através de um pequeno servidor Node.js (pasta `/server`).

## Passo a passo

1. Tenha o **Node.js** instalado (baixe em https://nodejs.org, se ainda não tiver).

2. Abra um terminal na pasta `server`:
   ```
   cd tcc/server
   ```

3. Instale as dependências (só precisa fazer isso uma vez):
   ```
   npm install
   ```

4. Rode o servidor:
   ```
   npm start
   ```
   Você vai ver a mensagem:
   ```
   Servidor The Coffe Club rodando em http://localhost:3000
   ```

5. Abra o navegador em:
   ```
   http://localhost:3000/index.html
   ```
   (Use sempre essa URL — não abra o `index.html` direto com duplo clique,
   porque aí o site não consegue falar com o servidor/banco.)

## O que foi integrado

- `listarProdutos()` no `script.js` agora busca os produtos em
  `GET /api/produtos` (antes eram fixos no código).
- `confirmarCompra()` agora envia o pedido para `POST /api/pedidos`,
  que grava o cliente, o pedido e os itens no `thecoffe.db`.
- O preço final é recalculado no servidor a partir do banco (não confia
  só no que veio do navegador) — mais seguro para o TCC defender.

## Endpoints disponíveis

| Método | Rota              | O que faz                                   |
|--------|-------------------|----------------------------------------------|
| GET    | /api/produtos     | Lista todos os produtos do cardápio          |
| GET    | /api/produtos/:id | Detalhe de um produto                        |
| GET    | /api/entregadores | Lista entregadores ativos                    |
| GET    | /api/pedidos      | Lista todos os pedidos já feitos             |
| POST   | /api/pedidos      | Cria um novo pedido (usado no checkout)      |

## Onde fica o banco

`tcc/banco de dados/thecoffe.db` — pode abrir direto na extensão SQLite
do VSCode para ver os dados enquanto testa o site.
