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
    const documento = document.getElementById('documento').value; // Agora é um select
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value; // Estado como sigla
    const telefone = document.getElementById('telefone').value;
    const tipo = document.querySelector('input[name="tipo"]:checked') ? document.querySelector('input[name="tipo"]:checked').value : '';

    // Validações
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', () => {
        const telefoneVal = telefoneInput.value.trim();
        if (!telefoneRegex.test(telefoneVal)) {
            telefoneInput.style.borderColor = 'red'; // Indicar erro
        } else {
            telefoneInput.style.borderColor = 'green'; // Indicar válido
        }
    });
    

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
            <td>${doc.tipo}</td> <!-- Corrigido para 'tipo' -->
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
    const valor = "10.00"; // Valor da transação
    const nomeRecebedor = "Gerleidson Bomfim"; // Nome do recebedor
    const cidadeRecebedor = "Camaçari"; // Cidade do recebedor
    const txid = "1234567890"; // TXID

    
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


// Função para exibir o total de cadastros
function exibirTotalCadastros() {
    const contador = document.getElementById('contador-registros'); // Elemento para exibir o total

    // Referência ao nó "documentos" no Firebase
    const referencia = ref(db, 'documentos/');

    // Buscar os dados do Firebase
    get(referencia).then((snapshot) => {
        if (snapshot.exists()) {
            const totalRegistros = Object.keys(snapshot.val()).length; // Conta o número de registros
            contador.textContent = `${totalRegistros}`; // Atualiza o contador no DOM
        } else {
            contador.textContent = "Total de Cadastros: 0"; // Exibe 0 se não houver dados
        }
    }).catch((error) => {
        console.error("Erro ao buscar o total de cadastros:", error);
        contador.textContent = "Erro ao carregar o total de cadastros.";
    });
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', exibirTotalCadastros);

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
