import { salvarDados } from './firebase.js'; // Função para salvar no Firebase

// Função para salvar os dados do formulário no Firebase e via fetch
document.getElementById('form-cadastro').addEventListener('submit', async function (event) {
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

    // Criação de um objeto com os dados do formulário
    const dados = {
        nome,
        documento,
        cidade,
        estado,
        telefone,
        tipo,
    };

    try {
        // Salva os dados no Firebase
        const uid = Date.now(); // Gera um UID único com base no timestamp
        await salvarDados(uid, dados);

        // Envia os dados via fetch para o PHP (caso necessário)
        const response = await fetch('salvar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
            },
            body: JSON.stringify(dados), // Converte os dados para JSON
        });

        const result = await response.json(); // Espera a resposta do PHP

        if (result.success) {
            alert('Documento cadastrado com sucesso!');
            document.getElementById('form-cadastro').reset(); // Limpa o formulário
            exibirDocumentos(); // Atualiza a tabela com os dados cadastrados
        } else {
            alert('Erro ao cadastrar documento: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        alert('Erro ao salvar os dados. Tente novamente mais tarde.');
    }
});

// Função para formatar o telefone (somente números)
document.addEventListener('DOMContentLoaded', function () {
    const telefone = document.getElementById('telefone');

    telefone.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, ''); // Remove tudo que não for número
    });
});

// Função para alternar o placeholder do campo "documento"
function toggleForm(tipo) {
    const campoDocumento = document.getElementById('documento');
    if (tipo === 'achado') {
        campoDocumento.placeholder = "Identifique o documento achado, exemplo: RG, CPF...";
    } else if (tipo === 'perdido') {
        campoDocumento.placeholder = "Identifique o documento perdido, exemplo: RG, CPF...";
    }
}

// Função para buscar documentos por nome na tabela
function buscarCadastroPorNome() {
    const nome = document.getElementById('nome-busca').value.trim().toLowerCase();
    let encontrou = false;
    let dadosEncontrados = '';

    // Realiza a busca de documentos pela tabela
    const table = document.getElementById('tabela');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i].getElementsByTagName('td');
        const rowNome = rowData[0].textContent.trim().toLowerCase(); // Converte o nome da tabela para minúsculas
        if (rowNome.includes(nome)) { // Verifica se o nome digitado está contido no nome da tabela
            encontrou = true;
            dadosEncontrados += `Nome: ${rowData[0].textContent}\n`;
            dadosEncontrados += `Documento: ${rowData[1].textContent}\n`;
            dadosEncontrados += `Cidade: ${rowData[2].textContent}\n`;
            dadosEncontrados += `Estado: ${rowData[3].textContent}\n`;
            dadosEncontrados += `Telefone: ${rowData[4].textContent}\n`;
            dadosEncontrados += `Status: ${rowData[5].textContent}\n`;
            break;
        }
    }

    if (encontrou) {
        alert('Documento encontrado na tabela!\n\n' + dadosEncontrados);
    } else {
        alert('Documento não encontrado na tabela.');
    }

    // Limpa o formulário de busca
    document.getElementById('nome-busca').value = '';
}

// Função para exibir documentos (exemplo de fetch para tabela)
async function exibirDocumentos() {
    console.log('Carregando documentos...');
    // Exemplo de integração com Firebase ou API para exibir os dados na tabela
}

export { buscarCadastroPorNome, toggleForm };
