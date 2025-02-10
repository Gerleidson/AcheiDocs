import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

// Inicializando o Firebase corretamente com o db importado
const db = getDatabase();

// Variáveis de controle de paginação
const registrosPorPagina = 10; // Exibir 10 registros por vez
let paginaAtual = 1; // Página inicial
const telefoneRegex = /^\(?\d{2}\)?\s?\d{5}-\d{4}$/; 


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

    // Validação do telefone
    if (!telefoneRegex.test(telefone)) {
        alert("Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX.");
        return;
    }
    
    // Chama a função para salvar no Firebase
    salvarDados(nome, documento, cidade, estado, telefone, tipo);
    
    // Limpa o formulário após enviar
    document.getElementById('form-cadastro').reset();
});

   // Validações
   const telefoneInput = document.getElementById('telefone');

   telefoneInput.addEventListener('input', function(event) {
    let telefone = telefoneInput.value.replace(/\D/g, '');
    if (telefone.length > 11) telefone = telefone.slice(0, 11);

    telefoneInput.value = telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
});


   


// Função para buscar o cadastro por nome
function buscarCadastroPorNome(event) {
    event.preventDefault(); // Impede o envio do formulário

    // Captura os valores dos campos
    const nomeBusca = document.getElementById('nome-busca');
    const estadoBusca = document.getElementById('estado-busca');
    const cidadeBusca = document.getElementById('cidade-busca');

    // Remove bordas vermelhas antes de validar novamente
    [nomeBusca, estadoBusca, cidadeBusca].forEach(campo => campo.classList.remove('campo-invalido'));

    // Verifica se algum campo está vazio
    let camposFaltando = [];
    if (!nomeBusca.value.trim()) {
        camposFaltando.push("Nome");
        nomeBusca.classList.add('campo-invalido'); // Adiciona borda vermelha
    }
    if (!estadoBusca.value.trim()) {
        camposFaltando.push("Estado");
        estadoBusca.classList.add('campo-invalido');
    }
    if (!cidadeBusca.value.trim()) {
        camposFaltando.push("Cidade");
        cidadeBusca.classList.add('campo-invalido');
    }

    // Se faltar algum campo, exibe o modal e para a busca
    if (camposFaltando.length > 0) {
        exibirModal("Erro", `Os seguintes campos precisam ser preenchidos: ${camposFaltando.join(", ")}`);
        return;
    }

    // Referência ao banco de dados do Firebase
    const dbRef = ref(db, "documentos/");

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            let encontrado = false;
            const dados = snapshot.val();

            // Verifica se há correspondência nos registros
            for (const id in dados) {
                const cadastro = dados[id];
                if (
                    cadastro.nome.toUpperCase() === nomeBusca.value.trim().toUpperCase() &&
                    cadastro.estado.toUpperCase() === estadoBusca.value.trim().toUpperCase() &&
                    cadastro.cidade.toUpperCase() === cidadeBusca.value.trim().toUpperCase()
                ) {
                    encontrado = true;
                    exibirModal("Resultado Encontrado", `
                        Nome: ${cadastro.nome} <br>
                        Documento: ${cadastro.documento} <br>
                        Telefone: ${cadastro.telefone} <br>
                        Cidade: ${cadastro.cidade} <br>
                        Estado: ${cadastro.estado} <br>
                        Status: ${cadastro.tipo}
                    `);
                    break;
                }
            }

            if (!encontrado) {
                exibirModal("Não Encontrado", "Nenhum registro corresponde à busca.");
            }
        } else {
            exibirModal("Não Encontrado", "Nenhum registro foi encontrado no banco de dados.");
        }

        // Limpa o formulário de busca após a execução
        document.getElementById('form-busca').reset();
    }).catch((error) => {
        console.error("Erro ao buscar os dados:", error);
        exibirModal("Erro", "Ocorreu um erro ao buscar os dados. Tente novamente.");
    });
}

// Adiciona o evento de busca ao formulário
document.getElementById('form-busca').addEventListener('submit', buscarCadastroPorNome);

// Função para exibir mensagens em um modal
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("modal").style.display = "none";
});

// Função para exibir mensagens no modal
function exibirModal(titulo, mensagem) {
    console.log("Abrindo modal:", titulo, mensagem);

    const modal = document.getElementById("modal");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalMensagem = document.getElementById("modal-mensagem");

    if (modal) { 
        modalTitulo.innerHTML = titulo;
        modalMensagem.innerHTML = mensagem;
        modal.style.display = "flex"; // Verifique se o modal tem "display: none" no CSS
    } else {
        console.error("Elemento modal não encontrado.");
    }
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
            <td>${doc.tipo}</td> <!-- Corrigido para 'tipo' -->
        `;
        tabela.appendChild(row);
    });
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
    buscarDadosFirebase((documentos) => {
        if (documentos) {
            const totalDocumentos = Object.keys(documentos).length;
            const totalPaginas = Math.ceil(totalDocumentos / registrosPorPagina);

            // Verifica se há pelo menos 10 registros antes de permitir avançar
            if (totalDocumentos > registrosPorPagina && paginaAtual < totalPaginas) {
                paginaAtual++;
                exibirDocumentosPaginados(paginaAtual);
            } else {
                alert("Não há registros suficientes para avançar para a próxima página.");
            }
        }
    });
});


// Chama a função ao carregar a página para exibir os documentos da primeira página
document.addEventListener('DOMContentLoaded', () => {
    exibirDocumentosPaginados(paginaAtual);
    exibirTotalCadastros();
});

// Função única para buscar os dados do Firebase e processá-los conforme necessário
function buscarDadosFirebase(callback) {
    const referencia = ref(db, 'documentos/');
    get(referencia).then((snapshot) => {
        if (snapshot.exists()) {
            const dados = snapshot.val();
            callback(dados); // Chama a função correspondente com os dados obtidos
        } else {
            callback(null); // Caso não existam registros
        }
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
        callback(null);
    });
}

// Função para exibir documentos com paginação
function exibirDocumentosPaginados(pagina) {
    buscarDadosFirebase((documentos) => {
        if (documentos) {
            const totalDocumentos = Object.keys(documentos).length;
            const totalPaginas = Math.ceil(totalDocumentos / registrosPorPagina);
            const inicio = (pagina - 1) * registrosPorPagina;
            const fim = inicio + registrosPorPagina;

            const documentosPagina = Object.entries(documentos)
                .slice(inicio, fim)
                .map(([id, doc]) => ({ id, ...doc }));
            
            exibirDocumentosNaTabela(documentosPagina);
            atualizarNavegacao(pagina, totalPaginas);
        } else {
            console.log("Nenhum dado encontrado.");
        }
    });
}

// Função para exibir o total de cadastros
function exibirTotalCadastros() {
    const contador = document.getElementById('contador-registros');
    buscarDadosFirebase((documentos) => {
        if (documentos) {
            contador.textContent = `${Object.keys(documentos).length}`;
        } else {
            contador.textContent = "Total de Cadastros: 0";
        }
    });
}


// Tornar a função globalmente acessível
window.buscarCadastroPorNome = buscarCadastroPorNome;

// Mostrar o popup quando o link de doação for clicado
const doacaoLink = document.getElementById("doacao-link");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("close-btn");
const pixCopy = document.getElementById("pix-copy");

doacaoLink.addEventListener("click", (event) => {
    event.preventDefault();

    // Exibe o popup
    popup.style.display = "flex";

    // Dados do PIX
    const chavePix = "27.201.781/0001-39"; // Chave PIX
    const nomeRecebedor = "Gerleidson Bomfim"; // Nome do recebedor
    const cidadeRecebedor = "Camaçari"; // Cidade do recebedor
    
});


// Fechar o popup
closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

// Tornar o PIX clicável e copiar para a área de transferência
pixCopy.addEventListener("click", () => {
    const pix = "27.201.781/0001-39"; // Substitua com sua chave PIX
    
    // Copiar o valor do PIX para a área de transferência
    navigator.clipboard.writeText(pix).then(() => {
        alert("Chave PIX copiada para a área de transferência!");
    }).catch((err) => {
        console.error("Erro ao copiar para a área de transferência", err);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Código do hamburguer: Adiciona o evento de clique no ícone
    document.getElementById('hamburger-icon').addEventListener('click', function() {
        const navLinks = document.getElementById('nav-links');
        navLinks.classList.toggle('active'); // Alterna a classe 'active' para exibir/ocultar o menu
    });
});


// Obtendo os elementos do popup e botão de fechamento
const dicasLink = document.getElementById('dicas-link');
const popupDicas = document.getElementById('popup-dicas');
const closeDicas = document.getElementById('close-dicas');

// Abrir o popup quando o link for clicado
dicasLink.addEventListener('click', function(e) {
    e.preventDefault();
    popupDicas.style.display = 'flex'; // Torna o popup visível
});

// Fechar o popup quando o botão de fechar for clicado
closeDicas.addEventListener('click', function() {
    popupDicas.style.display = 'none'; // Esconde o popup
});

// Fechar o popup clicando fora do conteúdo
popupDicas.addEventListener('click', function(e) {
    if (e.target === popupDicas) {
        popupDicas.style.display = 'none';
    }
});

// Função para os efeitos zoom in e zoom out
let lastScrollTop = 0; // Armazena a posição da rolagem anterior

// Função que verifica a visibilidade e a direção da rolagem
function checkFormVisibility() {
    const forms = document.querySelectorAll('form');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop; // Posição atual da rolagem

    forms.forEach(form => {
        const formPosition = form.getBoundingClientRect().top; // Posição do formulário
        const windowHeight = window.innerHeight; // Altura da janela

        // Se o formulário estiver na tela e a rolagem for para baixo, aplica o zoom-in
        if (formPosition < windowHeight * 0.8 && !form.classList.contains('zoom-in') && scrollTop > lastScrollTop) {
            form.classList.add('zoom-in');
            form.classList.remove('zoom-out'); // Remove o zoom-out, caso esteja ativo
        }
        // Se a rolagem for para cima, aplica o zoom-out
        else if (scrollTop < lastScrollTop && formPosition > windowHeight * 0.8) {
            form.classList.add('zoom-out');
            form.classList.remove('zoom-in'); // Remove o zoom-in, caso esteja ativo
        }
    });

    // Atualiza a posição da rolagem para a próxima comparação
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Impede rolar para valores negativos
}

// Chama a função quando a página carrega e quando o usuário rola a página
window.addEventListener('scroll', checkFormVisibility);
window.addEventListener('load', checkFormVisibility);


// Obtendo todos os botões de perguntas
const faqQuestions = document.querySelectorAll('.faq-question');

// Adicionando evento de clique para cada pergunta
faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        // Alterna a exibição da resposta
        const answer = this.nextElementSibling;
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
        } else {
            answer.style.display = 'block';
        }
    });
});