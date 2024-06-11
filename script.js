// Dados para armazenar os documentos
let documentos = [];

// Função para salvar os dados do formulário de achado
function salvarDocumentoAchado(event) {
    event.preventDefault(); // Impede o envio do formulário
    let nome = document.getElementById("nome-achado").value;
    let documento = document.getElementById("documento-achado").value;
    let cidade = document.getElementById("cidade-achado").value;
    let estado = document.getElementById("estado-achado").value;
    let telefone = document.getElementById("telefone-achado").value;
    documentos.push({ tipo: "achado", nome, documento, cidade, estado, telefone });
    exibirDocumentos();
    document.getElementById("form-achado").reset(); // Limpa os campos do formulário
}

// Função para salvar os dados do formulário de perdido
function salvarDocumentoPerdido(event) {
    event.preventDefault(); // Impede o envio do formulário
    let nome = document.getElementById("nome-perdido").value;
    let documento = document.getElementById("documento-perdido").value;
    let cidade = document.getElementById("cidade-perdido").value;
    let estado = document.getElementById("estado-perdido").value;
    let telefone = document.getElementById("telefone-perdido").value;
    documentos.push({ tipo: "perdido", nome, documento, cidade, estado, telefone });
    exibirDocumentos();
    document.getElementById("form-perdido").reset(); // Limpa os campos do formulário
}

// Função para exibir os documentos em uma tabela
function exibirDocumentos() {
    let tabela = document.getElementById("tabela");
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    // Criação dos títulos
    let titulos = tabela.createTHead();
    let tituloRow = titulos.insertRow();
    tituloRow.insertCell().textContent = "Nome";
    tituloRow.insertCell().textContent = "Documento";
    tituloRow.insertCell().textContent = "Cidade";
    tituloRow.insertCell().textContent = "Estado";
    tituloRow.insertCell().textContent = "Telefone";
    tituloRow.insertCell().textContent = "Status";

    // Preenchimento da tabela com os dados
    documentos.forEach((documento) => {
        let row = tabela.insertRow(); // Insere uma nova linha na tabela
        row.insertCell().textContent = documento.nome; // Nome
        row.insertCell().textContent = documento.documento; // Documento
        row.insertCell().textContent = documento.cidade; // Cidade
        row.insertCell().textContent = documento.estado; // Estado
        row.insertCell().textContent = documento.telefone; // Telefone
        row.insertCell().textContent = documento.tipo === "achado" ? "Achado" : "Perdido"; // Status
    });
}

// Adiciona os event listeners aos formulários
document.getElementById("form-achado").addEventListener("submit", salvarDocumentoAchado);
document.getElementById("form-perdido").addEventListener("submit", salvarDocumentoPerdido);

document.addEventListener("DOMContentLoaded", function() {
    const telefoneAchado = document.getElementById('telefone-achado');
    const telefonePerdido = document.getElementById('telefone-perdido');

    telefoneAchado.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    telefonePerdido.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });
});

// Função para alternar entre os formulários
function toggleFormulario(formulario) {
    var formAchado = document.getElementById('form-achado');
    var formPerdido = document.getElementById('form-perdido');
    if (formulario === 'achado') {
        formAchado.style.display = 'block';
        formPerdido.style.display = 'none';
    } else {
        formAchado.style.display = 'none';
        formPerdido.style.display = 'block';
    }
}

function buscarCadastroPorNome() {
    var nome = document.getElementById('nome-busca').value.trim().toLowerCase();
    var encontrou = false;
    var dadosEncontrados = '';

    // Procura pelo nome na tabela
    var table = document.getElementById('tabela');
    var rows = table.getElementsByTagName('tr');
    for (var i = 1; i < rows.length; i++) {
        var rowData = rows[i].getElementsByTagName('td');
        var rowNome = rowData[0].textContent.trim().toLowerCase(); // Converte o nome da tabela para minúsculas
        if (rowNome.includes(nome)) { // Verifica se o nome digitado está contido no nome da tabela
            encontrou = true;
            dadosEncontrados += 'Nome: ' + rowData[0].textContent + '\n';
            dadosEncontrados += 'Documento: ' + rowData[1].textContent + '\n';
            dadosEncontrados += 'Cidade: ' + rowData[2].textContent + '\n';
            dadosEncontrados += 'Estado: ' + rowData[3].textContent + '\n';
            dadosEncontrados += 'Telefone: ' + rowData[4].textContent + '\n';
            dadosEncontrados += 'Status: ' + rowData[5].textContent + '\n';
            break;
        }
    }

    if (encontrou) {
        window.alert('Documento encontrado na tabela!\n\n' + dadosEncontrados);
    } else {
        window.alert('Documento não encontrado na tabela.');
    }
    // Limpa o formulário
    document.getElementById('nome-busca').value = '';
}
