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
    documentos.push({ tipo: "achado", nome, documento, cidade, estado, telefone, });
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
    documentos.push({ tipo: "perdido", nome, documento, cidade, estado, telefone,  });
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
    tituloRow.insertCell(0).textContent = "Número";
    tituloRow.insertCell(1).textContent = "Nome";
    tituloRow.insertCell(2).textContent = "Documento";
    tituloRow.insertCell(3).textContent = "Cidade";
    tituloRow.insertCell(4).textContent = "Estado";
    tituloRow.insertCell(5).textContent = "Telefone";
    tituloRow.insertCell(6).textContent = "Status";

    // Preenchimento da tabela com os dados
    documentos.forEach((documento, index) => {
        let row = tabela.insertRow(); // Insere uma nova linha na tabela
        row.insertCell(0).textContent = index + 1; // Número do documento
        row.insertCell(1).textContent = documento.nome; // Nome
        row.insertCell(2).textContent = documento.documento; // Documento
        row.insertCell(3).textContent = documento.cidade; // Cidade
        row.insertCell(4).textContent = documento.estado; // Estado
        row.insertCell(5).textContent = documento.telefone; // Telefone
        row.insertCell(6).textContent = documento.tipo === "achado" ? "Achado" : "Perdido"; // Status
    });
}

// Adiciona os event listeners aos formulários
document.getElementById("form-achado").addEventListener("submit", salvarDocumentoAchado);
document.getElementById("form-perdido").addEventListener("submit", salvarDocumentoPerdido);


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
        var rowNome = rowData[1].textContent.trim().toLowerCase();
        if (rowNome === nome) {
            encontrou = true;
            dadosEncontrados += 'Código: ' + rowData[0].textContent + '\n';
            dadosEncontrados += 'Nome: ' + rowData[1].textContent + '\n';
            dadosEncontrados += 'Documento: ' + rowData[2].textContent + '\n';
            dadosEncontrados += 'Cidade: ' + rowData[3].textContent + '\n';
            dadosEncontrados += 'Estado: ' + rowData[4].textContent + '\n';
            dadosEncontrados += 'Telefone: ' + rowData[5].textContent + '\n';
            dadosEncontrados += 'Status: ' + rowData[6].textContent + '\n';
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
