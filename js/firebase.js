// Importando as funções necessárias do Firebase
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCmcDHVj8vdMZeLsnygh0jMjCfZ0Hyh8bY",
    authDomain: "acheidocs-c7b8f.firebaseapp.com",
    databaseURL: "https://acheidocs-c7b8f-default-rtdb.firebaseio.com/",
    projectId: "acheidocs-c7b8f",
    storageBucket: "acheidocs-c7b8f.appspot.com",
    messagingSenderId: "390960971384",
    appId: "1:390960971384:web:85ab3b905743a33930778d",
    measurementId: "G-S829CSFXDM"
};

// Inicializando o Firebase, se ainda não foi inicializado
if (!getApps().length) {
    initializeApp(firebaseConfig);
} else {
    getApp();  // Evitar duplicação de inicialização
}

// Função para salvar dados no banco (Firebase Realtime Database)
export function salvarDados(nome, documento, cidade, estado, telefone, tipo) {
    const db = getDatabase(); // Obtém o banco de dados
    const referencia = ref(db, 'documentos');  // 'documentos' como o nó principal
    const dados = {
        nome,
        documento,
        cidade,
        estado,
        telefone,
        tipo,
        status: tipo === 'achado' ? 'Disponível para devolução' : 'Perdido',
        dataCadastro
    };

    // Usando push() ao invés de set() para adicionar dados sem sobrescrever
    const novaReferencia = push(referencia); // 'push' cria uma chave única
    set(novaReferencia, dados)
        .then(() => {
            alert("Documento cadastrado com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao salvar os dados:", error);
            alert("Erro ao salvar os dados. Tente novamente mais tarde.");
        });
}

// Função para buscar dados do Firebase
export function buscarDadosDoFirebase() {
    const db = getDatabase(); // Obtém o banco de dados
    const referencia = ref(db, 'documentos/');  // Refere-se ao nó onde os documentos estão armazenados
    get(referencia)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const documentos = snapshot.val();
                console.log("Documentos:", documentos);
            } else {
                console.log("Nenhum dado encontrado.");
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar dados:", error);
        });
}
