const prods = document.querySelector(".conteiner");

const API_URL = "http://localhost:3000/api";

let produtos = [];

const carrinho = [];

async function listarProdutos() {

    try {

        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error("Falha ao buscar produtos");
        }

        produtos = await resposta.json();

    } catch (erro) {

        console.error("Erro ao carregar produtos do servidor:", erro);

        modalMensagem(
            "Não foi possível carregar o cardápio. Verifique se o servidor está rodando (npm start na pasta /server)."
        );

        return;

    }

    let output = "";

    produtos.forEach(produto => {

        output += `

            <div class="card" data-link="carrinho.html?produto=${produto.id}">

                <h3>
                    ${produto.nome}
                </h3>

                <img
                    src="${produto.imagem}"
                    alt="${produto.nome}">

                <p>
                    R$ ${produto.preco.toFixed(2).replace(".", ",")}
                </p>

                <button onclick="modalDetalhes(${produto.id})">
                    Detalhes
                </button>

            </div>

        `;

    });

    prods.innerHTML = output;

    const params = new URLSearchParams(window.location.search);
    const idProduto = params.get("produto");

    if (idProduto) {
        modalDetalhes(Number(idProduto));
    }
}

function modalDetalhes(id) {

    const produto = produtos.find(produto => produto.id === id);

    if (!produto) {
        return;
    }

    const detalhes = document.getElementById("detalhes");

    detalhes.classList.remove("oculto");


    document.getElementById("titulo").innerHTML =
        produto.nome;

    document.getElementById("idProd").innerHTML =
        produto.id;

    document.getElementById("img").src =
        produto.imagem;

    document.getElementById("descricao").innerHTML =
        produto.descricao;

    document.getElementById("preco").innerHTML =
        "Preço: R$ " +
        produto.preco.toFixed(2).replace(".", ",");

}

function modalMensagem(msg) {

    const mensagem =
        document.getElementById("mensagem");

    const texto =
        document.getElementById("texto");

    texto.innerHTML = msg;

    mensagem.classList.remove("oculto");

}

function adicionarCarrinho(id) {

    id = Number(id);


    const produtoCarrinho =
        carrinho.find(produto => produto.id === id);


    if (produtoCarrinho) {

        produtoCarrinho.quantidade++;

        produtoCarrinho.total =
            produtoCarrinho.quantidade *
            produtoCarrinho.preco;

    } else {

        const produtoOriginal =
            produtos.find(produto => produto.id === id);


        if (!produtoOriginal) {
            return;
        }


        const novoProduto = {

            ...produtoOriginal,

            quantidade: 1,

            total: produtoOriginal.preco

        };


        carrinho.push(novoProduto);

    }


    preencherTabelaCarrinho();

    atualizarContadorCarrinho();

    mostrarCarrinho();

}

function mostrarCarrinho() {

    document
        .getElementById("carrinhoCompras")
        .classList
        .remove("oculto");

}

function preencherTabelaCarrinho() {

    const tabela =
        document.getElementById("corpoCarrinho");


    let output = "";


    let totalCarrinho = 0;


    carrinho.forEach(produto => {

        output += `

            <tr data-link="carrinho.html?produto=${produto.id}">

                <td>
                    ${produto.nome}
                </td>

                <td>
                    <img
                        class="foto-carrinho"
                        src="${produto.imagem}"
                        alt="${produto.nome}">
                </td>

                <td>

                    <button
                        class="botao-quantidade"
                        onclick="diminuir(${produto.id})">

                        -

                    </button>

                    ${produto.quantidade}

                    <button
                        class="botao-quantidade"
                        onclick="aumentar(${produto.id})">

                        +

                    </button>

                </td>

                <td>
                    R$ ${produto.total
                .toFixed(2)
                .replace(".", ",")}
                </td>

            </tr>

        `;


        totalCarrinho += produto.total;

    });


    if (carrinho.length === 0) {

        output = `

            <tr>

                <td colspan="4">
                    Seu carrinho está vazio.
                </td>

            </tr>

        `;

    }


    tabela.innerHTML = output;


    document.getElementById("totalCarrinho").innerHTML =
        "Total da compra: R$ " +
        totalCarrinho
            .toFixed(2)
            .replace(".", ",");

}

function aumentar(id) {

    const produto =
        carrinho.find(produto => produto.id === id);


    if (!produto) {
        return;
    }


    produto.quantidade++;


    produto.total =
        produto.quantidade *
        produto.preco;


    preencherTabelaCarrinho();

    atualizarContadorCarrinho();

}

function diminuir(id) {

    const produto =
        carrinho.find(produto => produto.id === id);


    if (!produto) {
        return;
    }


    produto.quantidade--;


    if (produto.quantidade <= 0) {

        const indice =
            carrinho.indexOf(produto);

        carrinho.splice(indice, 1);

    } else {

        produto.total =
            produto.quantidade *
            produto.preco;

    }


    preencherTabelaCarrinho();

    atualizarContadorCarrinho();

}

function atualizarContadorCarrinho() {

    let quantidadeTotal = 0;


    carrinho.forEach(produto => {

        quantidadeTotal += produto.quantidade;

    });


    document.getElementById("contadorCarrinho").innerHTML =
        quantidadeTotal;

}

function abrirFinalizarCompra() {

    if (carrinho.length === 0) {

        modalMensagem(
            "Seu carrinho está vazio!"
        );

        return;

    }


    let totalCompra = 0;


    carrinho.forEach(produto => {

        totalCompra += produto.total;

    });


    document.getElementById("resumoCompra").innerHTML =
        "Total da compra: R$ " +
        totalCompra
            .toFixed(2)
            .replace(".", ",");


    document
        .getElementById("carrinhoCompras")
        .classList
        .add("oculto");


    document
        .getElementById("finalizarCompra")
        .classList
        .remove("oculto");

}

function fecharFinalizarCompra() {

    document
        .getElementById("finalizarCompra")
        .classList
        .add("oculto");

}

async function confirmarCompra() {

    const nome =
        document
            .getElementById("nomeCliente")
            .value
            .trim();


    const endereco =
        document
            .getElementById("enderecoCliente")
            .value
            .trim();


    const pagamento =
        document
            .getElementById("pagamento")
            .value;


    if (
        nome === "" ||
        endereco === "" ||
        pagamento === ""
    ) {

        modalMensagem(
            "Preencha todos os campos para finalizar a compra!"
        );

        return;

    }


    const itens = carrinho.map(produto => ({
        id: produto.id,
        quantidade: produto.quantidade
    }));


    try {

        const resposta = await fetch(`${API_URL}/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                endereco,
                pagamento,
                itens
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao finalizar a compra.");
        }


        carrinho.length = 0;

        preencherTabelaCarrinho();

        atualizarContadorCarrinho();

        fecharFinalizarCompra();

        document
            .getElementById("nomeCliente")
            .value = "";

        document
            .getElementById("enderecoCliente")
            .value = "";

        document
            .getElementById("pagamento")
            .value = "";


        modalMensagem(

            "Compra realizada com sucesso!<br><br>" +

            "Pedido nº " + dados.pedidoId + "<br><br>" +

            "Obrigado pela sua compra, " +

            nome +

            "!<br><br>" +

            "Forma de pagamento: " +

            pagamento

        );

    } catch (erro) {

        console.error("Erro ao confirmar compra:", erro);

        modalMensagem(
            "Não foi possível finalizar a compra. Verifique se o servidor está rodando e tente novamente."
        );

    }

}