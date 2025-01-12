<?php
// Conectar ao banco de dados
$servername = "localhost";
$username = "root"; // Seu nome de usuário do banco de dados
$password = ""; // Sua senha do banco de dados
$dbname = "achados_perdidos"; // Nome do banco de dados

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Obter dados do formulário
$nome = $_POST['nome'];
$documento = $_POST['documento'];
$telefone = $_POST['telefone'];
$cidade = $_POST['cidade'];
$estado = $_POST['estado'];
$tipo = $_POST['tipo']; // achado ou perdido

// Usando prepared statements para evitar SQL Injection
$stmt = $conn->prepare("INSERT INTO itens (nome, documento, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $nome, $documento, $telefone, $cidade, $estado, $tipo);

if ($stmt->execute()) {
    echo "Novo item cadastrado com sucesso!";
} else {
    echo "Erro ao cadastrar item: " . $stmt->error;
}

// Fechar a conexão
$stmt->close();
$conn->close();
?>
