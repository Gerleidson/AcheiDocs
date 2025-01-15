import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get, onChildAdded, remove, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

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
    const documento = document.getElementById('documento').value; // Agora é um select
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value; // Estado como sigla
    const telefone = document.getElementById('telefone').value;
    const tipo = document.querySelector('input[name="tipo"]:checked') ? document.querySelector('input[name="tipo"]:checked').value : '';

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!nome || !documento || !cidade || !estado || !telefone || !tipo) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Adiciona a data de cadastro (timestamp) no momento do cadastro
    const dataCadastro = Date.now(); // Obtém o timestamp atual (em milissegundos)

    // Chama a função para salvar no Firebase, incluindo a data de cadastro
    salvarDados(nome, documento, cidade, estado, telefone, tipo, dataCadastro);

    // Limpa o formulário após o cadastro ser realizado
    document.getElementById('form-cadastro').reset();
});

// Função para buscar o cadastro por nome
function buscarCadastroPorNome() {
    const nomeBusca = document.getElementById('nome-busca').value.trim();
    if (nomeBusca === "") {
        alert("Por favor, insira um nome para buscar.");
        return;
    }

    // Referência ao banco de dados do Firebase
    const dbRef = ref(db, "documentos/");

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            let encontrado = false;
            const dados = snapshot.val(); // Obter os dados do banco

            // Verificando se algum item corresponde ao nome
            for (const id in dados) {
                if (dados[id].nome.toUpperCase() === nomeBusca.toUpperCase()) { // Comparação em maiúsculas
                    encontrado = true;
                    exibirPopup(dados[id]); // Exibe o pop-up com as informações do cadastro
                    break;
                }
            }

            if (!encontrado) {
                exibirPopup(null); // Exibe pop-up informando que não encontrou o item
            }
        } else {
            exibirPopup(null); // Exibe pop-up informando que não há registros
        }
    }).catch((error) => {
        console.error("Erro ao buscar os dados:", error);
        exibirPopup(null); // Exibe pop-up de erro
    });
}

// Função para exibir o pop-up com o resultado da busca ou mensagem de erro
function exibirPopup(dados) {
    if (dados) {
        // Se os dados forem encontrados, mostra um pop-up com as informações
        alert(`
            Resultado Encontrado:

            Nome: ${dados.nome}
            Documento: ${dados.documento}
            Telefone: ${dados.telefone}
            Cidade: ${dados.cidade}
            Estado: ${dados.estado}
            Status: ${dados.tipo}
        `);
    } else {
        // Caso contrário, mostra uma mensagem dizendo que não foi encontrado
        alert("Não há registro.");
    }
}

// Função para exibir documentos com paginação
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
            <td>${doc.tipo}</td>
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

// Função para observar novos documentos no Firebase e atualizar a tabela automaticamente
function ouvirNovosDocumentos() {
    const referencia = ref(db, 'documentos/');
    
    // Adiciona um listener para quando um novo dado é adicionado
    onChildAdded(referencia, (snapshot) => {
        const novoDocumento = snapshot.val();

        // Verificar se o novo documento precisa ser exibido na página atual
        const totalDocumentos = Object.keys(snapshot.val()).length;
        const totalPaginas = Math.ceil(totalDocumentos / registrosPorPagina);

        // Atualizar a tabela automaticamente
        if (paginaAtual <= totalPaginas) {
            exibirDocumentosPaginados(paginaAtual);
        }
    });
}

// Chama a função ao carregar a página para exibir os documentos da primeira página
window.onload = () => {
    exibirDocumentosPaginados(paginaAtual);
    ouvirNovosDocumentos(); // Chama a função para ouvir os novos documentos
};

// Tornar a função globalmente acessível
window.buscarCadastroPorNome = buscarCadastroPorNome;


// Aguarde o DOM estar carregado
  document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  });



  
 

// Mostrar o popup quando o link de doação for clicado
const doacaoLink = document.getElementById("doacao-link");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("close-btn");
const pixCopy = document.getElementById("pix-copy");

doacaoLink.addEventListener("click", (event) => {
    event.preventDefault();  // Impede que o link faça a navegação normal

    // Exibe o popup
    popup.style.display = "flex";
    
    // Gerar o QR Code para o PIX
    const pix = "27.201.781.0001/39"; // Substitua com sua chave PIX

    // Verifique se a chave PIX está no formato correto
    console.log("Gerando QR Code para:", pix);

    QRCode.toCanvas(document.getElementById("qrcode"), pix, (error) => {
        if (error) {
            console.error("Erro ao gerar QR Code:", error);
        } else {
            console.log("QR Code gerado com sucesso!");
        }
    });
});


// Fechar o popup
closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

// Tornar o PIX clicável e copiar para a área de transferência
pixCopy.addEventListener("click", () => {
    const pix = "27.201.781.0001/39"; // Substitua com sua chave PIX
    
    // Copiar o valor do PIX para a área de transferência
    navigator.clipboard.writeText(pix).then(() => {
        alert("Chave PIX copiada para a área de transferência!");
    }).catch((err) => {
        console.error("Erro ao copiar para a área de transferência", err);
    });
});