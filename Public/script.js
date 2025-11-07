document.addEventListener('DOMContentLoaded', () => {
    // ================================================================
    // CONTROLE DE TEMA
    // ================================================================
    const themeToggleButton = document.getElementById('theme-toggle-button'); // botão de alternância de tema
    const themeIcon = document.getElementById('theme-icon'); // ícone do tema

    const setTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark');
            themeIcon.textContent = 'light_mode';
            localStorage.setItem('theme', 'dark'); //salve a preferência do tema
        } else {
            document.body.classList.remove('dark');
            themeIcon.textContent = 'dark_mode';
            localStorage.setItem('theme', 'light');
        }
    };

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isInitiallyDark = savedTheme === 'dark' || (savedTheme === null && systemPrefersDark);
    setTheme(isInitiallyDark);
    // Definir o tema inicial com base na preferência salva ou na preferência do sistema
    themeToggleButton?.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark');
        setTheme(!isCurrentlyDark);
    });
    // Atualizar tema se a preferência do sistema mudar (se nenhuma preferência salva)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
            setTheme(e.matches);
        }
    });

    // ================================================================
    //  LEITURA AUTOMÁTICA DO EXCEL
    // ================================================================
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    const searchInput = document.getElementById("search-product");
    const brandSelect = document.getElementById("brand");
    const itemSelect = document.getElementById("item"); 
    
    let todosOsDados = [];
    // Função para carregar o arquivo Excel
    async function carregarExcel() {
        try {
            const response = await fetch("produtos.xlsx");
            const arrayBuffer = await response.arrayBuffer();

            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const primeiraAba = workbook.SheetNames[0];
            const planilha = workbook.Sheets[primeiraAba];
            const dados = XLSX.utils.sheet_to_json(planilha, { raw: false });

            todosOsDados = dados;

            preencherFiltros(dados);
            exibirTabela(dados);
            configurarAutoComplete(searchInput, dados);
        } catch (err) {
            console.error("Erro ao carregar o Excel:", err);
        }
    }

    function exibirTabela(dados) {
        tabelaBody.innerHTML = "";
        dados.forEach(linha => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="SKU">${linha.SKU || ""}</td>
                <td data-label="Marca">${linha.Marca || ""}</td>
                <td data-label="Item">${linha.Item || ""}</td>
                <td data-label="Descrição">${linha.Descrição || ""}</td>
            `;
            tabelaBody.appendChild(tr);
        });
    }

    // ================================================================
    // PREENCHER COMBOS DE MARCA E ITEM
    // ================================================================
    function preencherFiltros(dados) {
        const marcas = [...new Set(dados.map(d => d.Marca).filter(Boolean))].sort();
        const itens = [...new Set(dados.map(d => d.Item).filter(Boolean))].sort();

        // Marcas
        brandSelect.innerHTML = `<option value="">Todas as marcas</option>`;
        marcas.forEach(marca => {
            const opt = document.createElement("option");
            opt.value = marca;
            opt.textContent = marca;
            brandSelect.appendChild(opt);
        });

        // Itens
        itemSelect.innerHTML = `<option value="">Todos os itens</option>`;
        itens.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item;
            opt.textContent = item;
            itemSelect.appendChild(opt);
        });
    }

    // ================================================================
    // FILTRO DE PESQUISA E SELETORES
    // ================================================================
    function filtrarTabela() {
        const termo = searchInput.value.toLowerCase().trim();
        const marcaSelecionada = brandSelect.value;
        const itemSelecionado = itemSelect.value;

        const filtrados = todosOsDados.filter(linha => {
            const matchTermo =
                !termo ||
                (linha.SKU && linha.SKU.toLowerCase().includes(termo)) ||
                (linha.Marca && linha.Marca.toLowerCase().includes(termo)) ||
                (linha.Item && linha.Item.toLowerCase().includes(termo)) ||
                (linha.Descrição && linha.Descrição.toLowerCase().includes(termo));

            const matchMarca = !marcaSelecionada || linha.Marca === marcaSelecionada;
            const matchItem = !itemSelecionado || linha.Item === itemSelecionado;

            return matchTermo && matchMarca && matchItem;
        });

        exibirTabela(filtrados);
    }

    brandSelect.addEventListener("change", filtrarTabela);
    itemSelect.addEventListener("change", filtrarTabela);
    searchInput.addEventListener("input", filtrarTabela);

    // ================================================================
    // AUTOCOMPLETE NA BARRA DE PESQUISA
    // ================================================================
    function configurarAutoComplete(input, dados) {
        let listaSugestoes = document.createElement("ul");
        listaSugestoes.classList.add("autocomplete-list");
        input.parentNode.appendChild(listaSugestoes);

        input.addEventListener("input", () => {
            const valor = input.value.toLowerCase().trim();
            listaSugestoes.innerHTML = "";

            if (!valor) return;

            const sugestoes = [
                ...new Set(
                    dados
                        .flatMap(d => [d.SKU, d.Marca, d.Item, d.Descrição])
                        .filter(v => v && v.toLowerCase().includes(valor))
                ),
            ].slice(0, 8); // limita 8 sugestões

            sugestoes.forEach(s => {
                const li = document.createElement("li");
                li.textContent = s;
                li.addEventListener("click", () => {
                    input.value = s;
                    listaSugestoes.innerHTML = "";
                    filtrarTabela();
                });
                listaSugestoes.appendChild(li);
            });
        });

        // Fechar ao clicar fora
        document.addEventListener("click", (e) => {
            if (!input.contains(e.target)) {
                listaSugestoes.innerHTML = "";
            }
        });
    }

    carregarExcel();
});

// ================================================================
// SENHA PARA ÁREA ADMINISTRATIVA     
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.querySelector(".admin-button");

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      // Em vez de pedir senha aqui, redireciona para a página de login
      window.location.href = "/login";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
    // A função 'fetch' faz a requisição para a rota que criamos no server.js
    fetch('/api/total-produtos')
        .then(response => {
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error('Falha na resposta da rede: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Garante que o objeto retornado contém o campo 'count'
            const totalProdutos = data.count; 
            
            // Localiza e atualiza o elemento HTML
            const summaryElement = document.querySelector(".summary-bar p");
            
            if (summaryElement !== null && typeof totalProdutos === 'number') {
                summaryElement.textContent = `${totalProdutos} produtos cadastrados`;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar a contagem:', error);
            // Opcional: Atualiza com uma mensagem de erro ou valor de fallback
            const summaryElement = document.querySelector(".summary-bar p");
            if (summaryElement) {
                summaryElement.textContent = "Erro ao carregar contagem.";
            }
        });
});