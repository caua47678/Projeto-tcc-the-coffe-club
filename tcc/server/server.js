// =========================================================
// Servidor - The Coffe Club
// Conecta o site ao banco de dados SQLite (thecoffe.db)
// =========================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Caminho do banco de dados (pasta "banco de dados", um nível acima de /server)
const DB_PATH = path.join(__dirname, "..", "banco de dados", "thecoffe.db");
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do site (index.html, css, imagens, carrinho.html etc.)
app.use(express.static(path.join(__dirname, "..")));

// ---------------------------------------------------------
// GET /api/produtos - lista todos os produtos do cardápio
// ---------------------------------------------------------
app.get("/api/produtos", (req, res) => {
    const produtos = db.prepare("SELECT * FROM produtos").all();
    res.json(produtos);
});

// ---------------------------------------------------------
// GET /api/produtos/:id - um produto específico
// ---------------------------------------------------------
app.get("/api/produtos/:id", (req, res) => {
    const produto = db
        .prepare("SELECT * FROM produtos WHERE id = ?")
        .get(req.params.id);

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(produto);
});

// ---------------------------------------------------------
// GET /api/entregadores - lista entregadores ativos
// ---------------------------------------------------------
app.get("/api/entregadores", (req, res) => {
    const entregadores = db
        .prepare("SELECT * FROM entregadores WHERE ativo = 1")
        .all();
    res.json(entregadores);
});

// ---------------------------------------------------------
// GET /api/pedidos - lista pedidos com dados de cliente/entregador
// (útil para uma futura tela de administração)
// ---------------------------------------------------------
app.get("/api/pedidos", (req, res) => {
    const pedidos = db
        .prepare(
            `SELECT p.id, c.nome AS cliente, c.endereco, e.nome AS entregador,
                    p.forma_pagamento, p.status, p.total, p.data_pedido
             FROM pedidos p
             JOIN clientes c ON c.id = p.cliente_id
             LEFT JOIN entregadores e ON e.id = p.entregador_id
             ORDER BY p.id DESC`
        )
        .all();
    res.json(pedidos);
});

// ---------------------------------------------------------
// POST /api/pedidos - cria um novo pedido (finalizar compra)
// Body esperado:
// {
//   nome: "José da Costa",
//   endereco: "Rua das Flores, 123",
//   telefone: "(11) 99999-9999",   (opcional)
//   pagamento: "Pix",
//   itens: [ { id: 2, quantidade: 1 }, { id: 6, quantidade: 1 } ]
// }
// ---------------------------------------------------------
app.post("/api/pedidos", (req, res) => {
    const { nome, endereco, telefone, pagamento, itens } = req.body;

    if (!nome || !endereco || !pagamento || !itens || itens.length === 0) {
        return res.status(400).json({ erro: "Dados incompletos para finalizar o pedido." });
    }

    const criarPedido = db.transaction(() => {
        // 1) cria o cliente
        const clienteInfo = db
            .prepare("INSERT INTO clientes (nome, endereco, telefone) VALUES (?, ?, ?)")
            .run(nome, endereco, telefone || null);

        const clienteId = clienteInfo.lastInsertRowid;

        // 2) calcula o total buscando o preço real de cada produto no banco
        const buscarProduto = db.prepare("SELECT * FROM produtos WHERE id = ?");
        let total = 0;
        const itensValidados = [];

        for (const item of itens) {
            const produto = buscarProduto.get(item.id);
            if (!produto) continue;

            const quantidade = item.quantidade || 1;
            total += produto.preco * quantidade;

            itensValidados.push({
                produto_id: produto.id,
                quantidade,
                preco_unitario: produto.preco,
            });
        }

        // 3) cria o pedido (sem entregador definido ainda - status Pendente)
        const pedidoInfo = db
            .prepare(
                `INSERT INTO pedidos (cliente_id, forma_pagamento, status, total)
                 VALUES (?, ?, 'Pendente', ?)`
            )
            .run(clienteId, pagamento, total);

        const pedidoId = pedidoInfo.lastInsertRowid;

        // 4) insere os itens do pedido
        const inserirItem = db.prepare(
            `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
             VALUES (?, ?, ?, ?)`
        );

        for (const item of itensValidados) {
            inserirItem.run(pedidoId, item.produto_id, item.quantidade, item.preco_unitario);
        }

        return { pedidoId, total };
    });

    try {
        const resultado = criarPedido();
        res.status(201).json({
            mensagem: "Pedido criado com sucesso!",
            pedidoId: resultado.pedidoId,
            total: resultado.total,
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao criar o pedido." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor The Coffe Club rodando em http://localhost:${PORT}`);
});
