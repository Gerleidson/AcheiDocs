// Importa o Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

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
export function salvarDados(nome, documento, cidade, estado, telefone, tipo) {
    const db = getDatabase();
    const referencia = ref(db, 'documentos/');  // Usando referência para "documentos"
    
    // Gerar uma nova chave única automaticamente com push
    const novaReferencia = push(referencia);

    const dados = {
        nome,
        documento,
        cidade,
        estado,
        telefone,
        tipo,
        status: tipo === 'achado' ? 'Disponível para devolução' : 'Perdido'
    };

    // Salvando os dados no Firebase com uma chave gerada automaticamente
    set(novaReferencia, dados)
        .then(() => {
            alert("Documento cadastrado com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao salvar os dados:", error);
            alert("Erro ao salvar os dados. Tente novamente mais tarde.");
        });
}
