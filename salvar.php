<?php
// Configuração de conexão com o banco de dados
$servername = "localhost";
$username = "root"; // Usuário padrão no XAMPP
$password = ""; // Senha em branco no XAMPP
$dbname = "acheidocs"; // Nome do banco de dados

// Criando a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificando a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Recebendo os dados do AJAX em formato JSON
$data = json_decode(file_get_contents("php://input"), true);

// Verificando se os dados foram recebidos corretamente
if (isset($data['nome']) && isset($data['documento']) && isset($data['cidade']) && isset($data['estado']) && isset($data['telefone']) && isset($data['tipo'])) {
    // Preparo da consulta SQL para inserção dos dados
    $nome = $conn->real_escape_string($data['nome']);
    $documento = $conn->real_escape_string($data['documento']);
    $cidade = $conn->real_escape_string($data['cidade']);
    $estado = $conn->real_escape_string($data['estado']);
    $telefone = $conn->real_escape_string($data['telefone']);
    $tipo = $conn->real_escape_string($data['tipo']);
    
    // Consulta SQL para inserir os dados no banco
    $sql = "INSERT INTO documentos (nome, documento, cidade, estado, telefone, tipo) VALUES ('$nome', '$documento', '$cidade', '$estado', '$telefone', '$tipo')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Documento cadastrado com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar documento: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
}

// Fechando a conexão com o banco
$conn->close();
?>
