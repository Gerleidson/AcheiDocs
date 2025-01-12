// Importa o Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCmcDHVj8vdMZeLsnygh0jMjCfZ0Hyh8bY",
    authDomain: "acheidocs-c7b8f.firebaseapp.com",
    projectId: "acheidocs-c7b8f",
    storageBucket: "acheidocs-c7b8f.firebasestorage.app",
    messagingSenderId: "390960971384",
    appId: "1:390960971384:web:85ab3b905743a33930778d",
    measurementId: "G-S829CSFXDM"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para salvar dados no banco (Firebase Realtime Database)
import { salvarDados } from './firebase.js';

document.getElementById('form-cadastro').addEventListener('submit', function(event) {
    event.preventDefault();

    // Coleta os dados do formulário
    const uid = Date.now(); // Gerando um UID único para o usuário
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

    // Salva os dados no Firebase
    salvarDados(uid, nome, documento, cidade, estado, telefone, tipo);
});


export { salvarDados };

