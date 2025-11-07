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