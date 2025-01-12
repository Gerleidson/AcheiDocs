import { salvarDados } from './firebase.js'; // Caminho correto no seu projeto
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Função para buscar e exibir os dados na tabela
function exibirDocumentos() {
    const db = getDatabase();
    const referencia = ref(db, 'documentos/');

    get(referencia).then((snapshot) => {
        if (snapshot.exists()) {
            const documentos = snapshot.val();
            const tabela = document.querySelector('#tabela tbody');
            tabela.innerHTML = ''; // Limpar tabela antes de adicionar novos dados

            // Percorrer os documentos e preencher a tabela
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
        } else {
            console.log("Nenhum dado encontrado.");
        }
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
    });
}

// Chama a função ao carregar a página
window.onload = exibirDocumentos;
