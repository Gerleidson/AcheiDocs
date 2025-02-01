import { salvarDados } from './firebase.js'; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; 

const db = getDatabase();
const registrosPorPagina = 10;
let paginaAtual = 1;
const telefoneRegex = /^\(?\d{2}\)?\s?\d{5}-\d{4}$/;

// Função para salvar os dados do formulário no Firebase
document.getElementById('form-cadastro').addEventListener('submit', function (event) {
    event.preventDefault();

    const dados = coletarDadosFormulario();
    if (!validarFormulario(dados)) return;
    
    salvarDados(dados.nome, dados.documento, dados.cidade, dados.estado, dados.telefone, dados.tipo);
    this.reset();
});

// Coleta os dados do formulário
function coletarDadosFormulario() {
    return {
        nome: document.getElementById('nome').value,
        documento: document.getElementById('documento').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        telefone: document.getElementById('telefone').value,
        tipo: document.querySelector('input[name="tipo"]:checked') ? document.querySelector('input[name="tipo"]:checked').value : ''
    };
}

// Validação do formulário
function validarFormulario(dados) {
    if (!dados.nome || !dados.documento || !dados.cidade || !dados.estado || !dados.telefone || !dados.tipo) {
        alert("Por favor, preencha todos os campos.");
        return false;
    }

    if (!telefoneRegex.test(dados.telefone)) {
        alert("Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX.");
        return false;
    }
    return true;
}

// Validação e formatação do telefone
document.getElementById('telefone').addEventListener('input', function(event) {
    this.value = formatarTelefone(this.value);
});

function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length <= 2) return `(${telefone}`;
    if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)}`;
}

// Função de busca por nome
window.buscarCadastroPorNome = function() {
    const nomeBusca = document.getElementById('nome-busca').value.trim();
    if (!nomeBusca) return alert("Por favor, insira um nome para buscar.");

    const dbRef = ref(db, "documentos/");
    get(dbRef).then((snapshot) => {
        const dados = snapshot.exists() ? snapshot.val() : {};
        const registro = Object.values(dados).find(item => item.nome.toUpperCase() === nomeBusca.toUpperCase());
        exibirPopup(registro);
    }).catch((error) => {
        console.error("Erro ao buscar os dados:", error);
        exibirPopup(null);
    });

    document.getElementById('form-busca').reset();
}

// Exibe pop-up com resultados da busca
function exibirPopup(dados) {
    const message = dados ?
        `Resultado Encontrado:\n\nNome: ${dados.nome}\nDocumento: ${dados.documento}\nTelefone: ${dados.telefone}\nCidade: ${dados.cidade}\nEstado: ${dados.estado}\nStatus: ${dados.tipo}` :
        "Não há registro.";
    alert(message);
}

// Função para exibir documentos com paginação
function exibirDocumentosPaginados(pagina) {
    const referencia = ref(db, 'documentos/');
    get(referencia).then((snapshot) => {
        const documentos = snapshot.exists() ? snapshot.val() : {};
        const documentosPagina = paginarDocumentos(documentos, pagina);
        exibirDocumentosNaTabela(documentosPagina);
        atualizarNavegacao(pagina, Math.ceil(Object.keys(documentos).length / registrosPorPagina));
    }).catch((error) => {
        console.error("Erro ao buscar dados:", error);
    });
}

// Paginação dos documentos
function paginarDocumentos(documentos, pagina) {
    const documentosArray = Object.entries(documentos).map(([id, doc]) => ({ id, ...doc }));
    const inicio = (pagina - 1) * registrosPorPagina;
    return documentosArray.slice(inicio, inicio + registrosPorPagina);
}

// Exibe documentos na tabela
function exibirDocumentosNaTabela(documentos) {
    const tabela = document.querySelector('#tabela tbody');
    tabela.innerHTML = documentos.map(doc => `
        <tr>
            <td>${doc.nome}</td>
            <td>${doc.documento}</td>
            <td>${doc.cidade}</td>
            <td>${doc.estado}</td>
            <td>${doc.telefone}</td>
            <td>${doc.tipo}</td>
        </tr>
    `).join('');
}

// Atualiza navegação de página
function atualizarNavegacao(pagina, totalPaginas) {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    prevButton.disabled = pagina <= 1;
    nextButton.disabled = pagina >= totalPaginas;
    document.getElementById('pagina-atual').textContent = `Página ${pagina} de ${totalPaginas}`;
}

// Navegação entre páginas
document.getElementById('prev').addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        exibirDocumentosPaginados(paginaAtual);
    }
});

document.getElementById('next').addEventListener('click', () => {
    paginaAtual++;
    exibirDocumentosPaginados(paginaAtual);
});

// Exibir documentos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    exibirDocumentosPaginados(paginaAtual);
    exibirTotalCadastros();
});

// Exibir o total de cadastros
function exibirTotalCadastros() {
    const contador = document.getElementById('contador-registros');
    const referencia = ref(db, 'documentos/');
    get(referencia).then((snapshot) => {
        contador.textContent = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    }).catch((error) => {
        console.error("Erro ao buscar o total de cadastros:", error);
        contador.textContent = "Erro ao carregar o total de cadastros.";
    });
}

// Ações do link de doação
document.getElementById("doacao-link").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("popup").style.display = "flex";
});

document.getElementById("close-btn").addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
});

// Ações do link de dicas
document.getElementById('dicas-link').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('popup-dicas').style.display = 'flex';
});

document.getElementById('close-dicas').addEventListener('click', function() {
    document.getElementById('popup-dicas').style.display = 'none';
});

// Função para exibir o clima
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function successCallback(position) {
    const { latitude, longitude } = position.coords;
    fetchWeather(latitude, longitude);
}

function fetchWeather(lat, lon) {
    const apiKey = "16be4fa1c04079d1ea3e2f83fbb54d9f";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => console.error("Erro ao buscar dados climáticos:", error));
}

function displayWeather(data) {
    document.querySelector(".weather-city").textContent = data.name;
    document.querySelector(".weather-temp").textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector(".weather-desc").textContent = data.weather[0].description;
    document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

// Função para efeitos de zoom em rolagem
let lastScrollTop = 0;
window.addEventListener('scroll', checkFormVisibility);

function checkFormVisibility() {
    const forms = document.querySelectorAll('form');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    forms.forEach(form => {
        const formPosition = form.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (formPosition < windowHeight * 0.8 && !form.classList.contains('zoom-in') && scrollTop > lastScrollTop) {
            form.classList.add('zoom-in');
            form.classList.remove('zoom-out');
        } else if (scrollTop < lastScrollTop && formPosition > windowHeight * 0.8) {
            form.classList.add('zoom-out');
            form.classList.remove('zoom-in');
        }
    });
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}
