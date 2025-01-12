import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

// Inicializando o Firebase corretamente com o db importado
const db = getDatabase();

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

// Função para buscar documentos por nome
function buscarDocumentosPorNome() {
    const nomeBusca = document.getElementById('nome-busca').value.trim().toLowerCase();

    // Verifica se o campo de busca está preenchido
    if (!nomeBusca) {
        alert("Por favor, insira um nome para buscar.");
        return;
    }

    const referencia = ref(db, 'documentos');
    const q = query(referencia, orderByChild('nome'), equalTo(nomeBusca)); // Faz a busca pelo nome

    get(q).then((snapshot) => {
        if (snapshot.exists()) {
            const documentos = snapshot.val();
            exibirDocumentosNaTabela(documentos);  // Exibe os documentos encontrados na tabela
        } else {
            alert("Nenhum documento encontrado com esse nome.");
        }
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
    });
}

// Função para exibir os documentos na tabela
function exibirDocumentosNaTabela(documentos) {
    const tabela = document.querySelector('#tabela tbody');
    tabela.innerHTML = '';  // Limpar tabela antes de adicionar novos dados

    for (const chave in documentos) {
        const doc = documentos[chave];
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
    }
}

// Função para exibir todos os documentos cadastrados
function exibirTodosDocumentos() {
    const referencia = ref(db, 'documentos/');
    get(referencia).then((snapshot) => {
        if (snapshot.exists()) {
            const documentos = snapshot.val();
            exibirDocumentosNaTabela(documentos);
        } else {
            console.log("Nenhum dado encontrado.");
        }
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
    });
}

// Evento de busca (chama a função ao clicar no botão de buscar)
document.querySelector('button[type="button"]').addEventListener('click', buscarDocumentosPorNome);

// Chama a função ao carregar a página para exibir todos os documentos
window.onload = exibirTodosDocumentos;
