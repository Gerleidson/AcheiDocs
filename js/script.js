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
            const dados = snapshot.val();

            // Verificando se algum item corresponde ao nome
            for (const id in dados) {
                if (dados[id].nome.toUpperCase() === nomeBusca.toUpperCase()) {
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

    // Limpa o formulário de busca após executar
    document.getElementById('form-busca').reset();
}


// Função para exibir o pop-up com o resultado da busca ou mensagem de erro
function exibirPopup(dados) {
    if (dados) {
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
        alert(`Nenhum registro encontrado para o nome "${nomeBusca}".`);
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


// Função para exibir o clima na tela
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
    alert("Seu navegador não suporta geolocalização.");
}

function successCallback(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetchWeather(latitude, longitude);
}

function errorCallback(error) {
    const weatherCity = document.querySelector(".weather-city");
    weatherCity.textContent = "Erro ao obter localização";
    console.error("Erro ao obter localização:", error);
}

function fetchWeather(lat, lon) {
    const apiKey = "16be4fa1c04079d1ea3e2f83fbb54d9f"; // Substitua pela sua chave da OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao buscar dados da API");
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error("Erro ao buscar dados climáticos:", error);
            const weatherCity = document.querySelector(".weather-city");
            weatherCity.textContent = "Erro ao carregar clima";
        });
}

function displayWeather(data) {
    const city = data.name;
    const temperature = Math.round(data.main.temp); // Arredonda a temperatura
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    document.querySelector(".weather-city").textContent = city;
    document.querySelector(".weather-temp").textContent = `${temperature}°C`;
    document.querySelector(".weather-desc").textContent = description;
    const weatherIcon = document.querySelector(".weather-icon");
    weatherIcon.src = iconUrl;
    weatherIcon.style.display = "inline";
}

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