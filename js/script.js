import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

// Inicializando o Firebase corretamente com o db importado
const db = getDatabase();

// Variáveis de controle de paginação
const registrosPorPagina = 10; // Exibir 10 registros por vez
let paginaAtual = 1; // Página inicial

// Função para salvar os dados do formulário no Firebase
document.getElementById('form-cadastro').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio do formulário tradicional

    // Coleta os dados do formulário
    const nome = document.getElementById('nome').value;
    const documento = document.getElementById('documento').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const telefone = document.getElementById('telefone').value;
    const tipo = document.querySelector('input[name="tipo"]:checked') ? document.querySelector('input[name="tipo"]:checked').value : '';

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!nome || !documento || !cidade || !estado || !telefone || !tipo) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Chama a função para salvar no Firebase
    salvarDados(nome, documento, cidade, estado, telefone, tipo);
});

// Função para buscar e exibir documentos com paginação
function exibirDocumentosPaginados(pagina) {
    const referencia = ref(db, 'documentos/');
    get(referencia).then((snapshot) => {
        if (snapshot.exists()) {
            const documentos = snapshot.val();
            const totalDocumentos = Object.keys(documentos).length; // Total de documentos cadastrados
            const totalPaginas = Math.ceil(totalDocumentos / registrosPorPagina); // Calcula o número total de páginas

            // Calcular a faixa de registros a exibir
            const inicio = (pagina - 1) * registrosPorPagina;
            const fim = inicio + registrosPorPagina;

            // Filtrando os documentos para a página atual
            const documentosPagina = Object.values(documentos).slice(inicio, fim);
            exibirDocumentosNaTabela(documentosPagina);

            // Atualizar a navegação de página
            atualizarNavegacao(pagina, totalPaginas);
        } else {
            console.log("Nenhum dado encontrado.");
        }
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
    });
}

// Função para exibir os documentos na tabela
function exibirDocumentosNaTabela(documentos) {
    const tabela = document.querySelector('#tabela tbody');
    tabela.innerHTML = '';  // Limpar tabela antes de adicionar novos dados

    documentos.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.nome}</td>
            <td>${doc.documento}</td>
            <td>${doc.cidade}</td>
            <td>${doc.estado}</td>
            <td>${doc.telefone}</td>
            <td>${doc.status}</td>
        `;
        tabela.appendChild(row);
    });
}

// Função para atualizar a navegação entre as páginas
function atualizarNavegacao(pagina, totalPaginas) {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    
    // Habilitar/desabilitar os botões de navegação
    prevButton.disabled = pagina === 1;
    nextButton.disabled = pagina === totalPaginas;

    // Atualizar número da página exibida
    document.getElementById('pagina-atual').textContent = `Página ${pagina} de ${totalPaginas}`;
}

// Função para ir para a página anterior
document.getElementById('prev').addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        exibirDocumentosPaginados(paginaAtual);
    }
});

// Função para ir para a próxima página
document.getElementById('next').addEventListener('click', () => {
    paginaAtual++;
    exibirDocumentosPaginados(paginaAtual);
});

// Chama a função ao carregar a página para exibir os documentos da primeira página
window.onload = () => exibirDocumentosPaginados(paginaAtual);

