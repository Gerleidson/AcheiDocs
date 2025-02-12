import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

// Inicializando o Firebase corretamente com o db importado
const db = getDatabase();

// Variáveis de controle de paginação
const registrosPorPagina = 10; // Exibir 10 registros por vez
let paginaAtual = 1; // Página inicial
const telefoneRegex = /^\(?\d{2}\)?\s?\d{5}-\d{4}$/; 


// Função para salvar os dados do formulário no Firebase
document.getElementById("form-cadastro").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    // Capturar os dados do formulário
    const nome = document.getElementById("nome").value;
    const documento = document.getElementById("documento").value;
    const telefone = document.getElementById("telefone").value;
    const estado = document.getElementById("estado-cadastro").value;
    const cidade = document.getElementById("cidade-cadastro").value;
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value || "Não especificado"; // Verifica se está selecionado

    // Verifica se os campos obrigatórios estão preenchidos
    if (!nome || !documento || !telefone || !estado || !cidade) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // Enviar os dados para o Firebase Realtime Database
    const novoCadastroRef = ref(db, "documentos");
    push(novoCadastroRef, {
        nome,
        documento,
        telefone,
        estado,
        cidade,
        tipo,
        status: "pendente"
    })
    .then(() => {
        alert("Documento cadastrado com sucesso!");
        document.getElementById("form-cadastro").reset(); // Limpa o formulário
    })
    .catch(error => {
        alert("Erro ao cadastrar. Tente novamente.");
    });
});

   // Validações
   const telefoneInput = document.getElementById('telefone');

   telefoneInput.addEventListener('input', function(event) {
    setTimeout(() => {
        let telefone = telefoneInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
        if (telefone.length <= 2) {
            telefone = `(${telefone}`;
        } else if (telefone.length <= 7) {
            telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
        } else {
            telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)}`;
        }
    
        telefoneInput.value = telefone;
    }, 50); // Pequeno delay para evitar erros de input rápido
});


   
// Função para buscar o cadastro por nome
function buscarCadastroPorNome(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Pegando os valores dos campos corretamente
    const nomeBusca = document.getElementById("nome-busca").value.trim();
    const estadoBusca = document.getElementById("estado-busca").value.trim();
    const cidadeBusca = document.getElementById("cidade-busca").value.trim();

    // Verifica se algum campo está vazio
    if (!nomeBusca || !estadoBusca || !cidadeBusca) {
        let mensagem = "Por favor, preencha os seguintes campos:\n";
        if (!nomeBusca) mensagem += "- Nome\n";
        if (!estadoBusca) mensagem += "- Estado\n";
        if (!cidadeBusca) mensagem += "- Cidade\n";
        alert(mensagem);
        return;
    }

    // Referência ao banco de dados do Firebase
    const dbRef = ref(db, "documentos/");

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            let encontrado = false;
            const dados = snapshot.val();

            for (const id in dados) {
                const cadastro = dados[id];

                if (
                    cadastro.nome?.trim().toUpperCase() === nomeBusca.toUpperCase() &&
                    cadastro.estado?.trim().toUpperCase() === estadoBusca.toUpperCase() &&
                    cadastro.cidade?.trim().toUpperCase() === cidadeBusca.toUpperCase()
                ) {
                    encontrado = true;
                    exibirPopup(cadastro);
                    break;
                }
            }

            if (!encontrado) {
                alert("Nenhum registro encontrado.");
            }
        } else {
            alert("Nenhum registro encontrado.");
        }

        document.getElementById("form-busca").reset();
    }).catch((error) => {
        console.error("Erro ao buscar os dados:", error);
        alert("Ocorreu um erro ao buscar os dados. Tente novamente.");
    });
}

// Função para exibir o pop-up com o resultado da busca ou mensagem de erro
function exibirPopup(dados) {
    alert(`
        Resultado Encontrado:
        
        Nome: ${dados.nome}
        Documento: ${dados.documento}
        Telefone: ${dados.telefone}
        Cidade: ${dados.cidade}
        Estado: ${dados.estado}
        Tipo: ${dados.tipo}
        Status: ${dados.status}  // Correção aqui
    `);
}


// Adiciona o listener de submit ao formulário
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("form-busca").addEventListener("submit", buscarCadastroPorNome);
});



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











    // URLs da API do IBGE
const urlEstados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const urlCidades = (uf) => `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;

// Selecionando os elementos de Estado e Cidade dos dois formulários
const estadoSelects = document.querySelectorAll(".select-estado");
const cidadeSelects = document.querySelectorAll(".select-cidade");

// Função para carregar os estados
function carregarEstados() {
    fetch(urlEstados)
        .then(res => res.json())
        .then(estados => {
            estados.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordenar por nome
            
            estadoSelects.forEach(select => {
                select.innerHTML = '<option value="">Selecione o estado</option>';
                estados.forEach(estado => {
                    select.innerHTML += `<option value="${estado.sigla}">${estado.nome}</option>`;
                });
            });
        })
        .catch(error => console.error("Erro ao carregar estados:", error));
}

// Função para carregar as cidades com base no estado selecionado
function carregarCidades(event) {
    const uf = event.target.value;
    const cidadeSelect = event.target.dataset.target; // Pega o ID do campo cidade correspondente
    const cidadeElement = document.getElementById(cidadeSelect);

    if (!uf) {
        cidadeElement.innerHTML = '<option value="">Selecione um estado primeiro</option>';
        cidadeElement.disabled = true;
        return;
    }

    fetch(urlCidades(uf))
        .then(res => res.json())
        .then(cidades => {
            cidadeElement.innerHTML = '<option value="">Selecione a cidade</option>';
            cidades.forEach(cidade => {
                cidadeElement.innerHTML += `<option value="${cidade.nome}">${cidade.nome}</option>`;
            });
            cidadeElement.disabled = false;
        })
        .catch(error => console.error("Erro ao carregar cidades:", error));
}

// Adicionar evento de mudança para cada select de estado
estadoSelects.forEach(select => {
    select.addEventListener("change", carregarCidades);
});

// Carregar os estados ao iniciar
carregarEstados();
