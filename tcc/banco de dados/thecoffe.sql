-- =========================================================
-- Banco de Dados - The Coffe Club
-- Projeto de TCC - José da Costa
-- SQLite
-- =========================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------
-- Tabela: clientes
-- ---------------------------------------------------------
CREATE TABLE clientes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    endereco    TEXT NOT NULL,
    telefone    TEXT
);

-- ---------------------------------------------------------
-- Tabela: entregadores
-- ---------------------------------------------------------
CREATE TABLE entregadores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    telefone    TEXT,
    veiculo     TEXT,              -- ex: Moto, Bicicleta, Carro
    placa       TEXT,
    ativo       INTEGER NOT NULL DEFAULT 1   -- 1 = ativo, 0 = inativo
);

-- ---------------------------------------------------------
-- Tabela: produtos (itens do cardápio)
-- ---------------------------------------------------------
CREATE TABLE produtos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    descricao   TEXT,
    preco       REAL NOT NULL,
    imagem      TEXT
);

-- ---------------------------------------------------------
-- Tabela: pedidos
-- ---------------------------------------------------------
CREATE TABLE pedidos (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id        INTEGER NOT NULL,
    entregador_id     INTEGER,                  -- pode ficar nulo até um entregador ser designado
    data_pedido       TEXT NOT NULL DEFAULT (datetime('now')),
    forma_pagamento   TEXT NOT NULL CHECK (forma_pagamento IN ('Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro')),
    status            TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em preparo', 'Saiu para entrega', 'Entregue', 'Cancelado')),
    total             REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- ---------------------------------------------------------
-- Tabela: itens_pedido (produtos dentro de cada pedido)
-- ---------------------------------------------------------
CREATE TABLE itens_pedido (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id         INTEGER NOT NULL,
    produto_id        INTEGER NOT NULL,
    quantidade        INTEGER NOT NULL DEFAULT 1,
    preco_unitario    REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- =========================================================
-- Dados iniciais: produtos do cardápio (do script.js)
-- =========================================================
INSERT INTO produtos (id, nome, descricao, preco, imagem) VALUES
(1,  'Café Preto Tradicional',              'Café puro e intenso, servido gelado, no estilo clássico.',                     12.90, 'wireframes/cf1.png'),
(2,  'Cappuccino Cremoso',                  'Espresso encorpado com espuma de leite cremosa e finalização em calda.',      15.90, 'wireframes/cf2.png'),
(3,  'Cream Refresher de Frutas Vermelhas', 'Bebida refrescante e frutada, com toque cremoso e cobertura de frutas vermelhas.', 17.90, 'wireframes/cf3.png'),
(4,  'Chá Verde Matcha Cremoso',            'Matcha suave misturado com leite cremoso, leve e revigorante.',               16.90, 'wireframes/cf4.png'),
(5,  'Mel de Baunilha Cold Foam',           'Base gelada finalizada com espuma cremosa de baunilha e toque de mel.',       15.50, 'wireframes/cf5.png'),
(6,  'Caramelo Cream Cold Brew',            'Cold brew suave com calda de caramelo e cobertura cremosa.',                  16.50, 'wireframes/cf200.png'),
(7,  'Coco Tropical Cold Brew',             'Cold brew com toque tropical de coco, refrescante e aromático.',              18.90, 'wireframes/cf7.png'),
(8,  'Chocolate Belga Cold Foam',           'Bebida rica em chocolate belga, finalizada com espuma cremosa.',              19.90, 'wireframes/cf8.png'),
(9,  'Vanilla Sweet Cream Cold',            'Doce e cremosa, com toque delicado de vanilla e chantilly.',                  17.50, 'wireframes/cf9.png'),
(10, 'Café com Leite Suave',                'Combinação equilibrada de café e leite, suave e reconfortante.',              13.90, 'wireframes/c11.png'),
(11, 'Café Americano Encorpado',            'Café encorpado e aromático, ideal para quem gosta de sabor intenso.',         12.50, 'wireframes/c11.png'),
(12, 'Café Espresso Clássico',              'Espresso tradicional, forte e puro, servido gelado com toque cremoso.',       11.90, 'wireframes/c12.png');

-- =========================================================
-- Dados de exemplo: entregadores
-- =========================================================
INSERT INTO entregadores (nome, telefone, veiculo, placa) VALUES
('Carlos Silva',   '(11) 91234-5678', 'Moto',      'ABC1D23'),
('Fernanda Souza',  '(11) 99876-5432', 'Bicicleta', NULL);

-- =========================================================
-- Dados de exemplo: cliente, pedido e itens (para teste)
-- =========================================================
INSERT INTO clientes (nome, endereco, telefone) VALUES
('José da Costa', 'Rua das Flores, 123 - São Paulo/SP', '(11) 98888-7777');

INSERT INTO pedidos (cliente_id, entregador_id, forma_pagamento, status, total) VALUES
(1, 1, 'Pix', 'Em preparo', 33.80);

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
(1, 2, 1, 15.90),
(1, 6, 1, 16.50);
