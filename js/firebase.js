// Importando o Firebase com a abordagem modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCmcDHVj8vdMZeLsnygh0jMjCfZ0Hyh8bY",  // sua chave da API
    authDomain: "acheidocs-c7b8f.firebaseapp.com",  // domínio para autenticação
    databaseURL: "https://acheidocs-c7b8f-default-rtdb.firebaseio.com/",  // URL do seu Firebase Realtime Database
    projectId: "acheidocs-c7b8f",  // ID do seu projeto no Firebase
    storageBucket: "acheidocs-c7b8f.appspot.com",  // bucket de armazenamento
    messagingSenderId: "390960971384",  // ID do remetente
    appId: "1:390960971384:web:85ab3b905743a33930778d",  // ID do aplicativo
    measurementId: "G-S829CSFXDM"  // ID de medição do Firebase Analytics
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Função para salvar dados no banco (Firebase Realtime Database)
export function salvarDados(nome, documento, cidade, estado, telefone, tipo) {
    const db = getDatabase();
    const referencia = ref(db, 'documentos'); // Referência ao nó "documentos"
    const dados = {
        nome,
        documento,
        cidade,
        estado,
        telefone,
        tipo,
        status: tipo === 'achado' ? 'Disponível para devolução' : 'Perdido'
    };

    // Usando push() para criar um novo identificador único para cada entrada
    const novaReferencia = push(referencia); // Push cria um ID único
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
    const db = getDatabase(); // Aqui a função getDatabase() é corretamente chamada
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
