<?php
// Configurações do banco de dados
$servername = "localhost";  // Nome do servidor
$username = "root";         // Nome de usuário do banco de dados
$password = "";             // Senha do banco de dados
$dbname = "achados_perdidos"; // Nome do banco de dados

// Criar conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Ler os dados JSON enviados
$data = json_decode(file_get_contents("php://input"), true);

// Verificar se os dados foram recebidos corretamente
if (isset($data['nome'], $data['documento'], $data['cidade'], $data['estado'], $data['telefone'], $data['tipo'])) {
    $nome = $data['nome'];
    $documento = $data['documento'];
    $telefone = $data['telefone'];
    $cidade = $data['cidade'];
    $estado = $data['estado'];
    $tipo = $data['tipo'];

    // Preparar a consulta SQL de inserção
    $sql = "INSERT INTO itens (nome, documento, telefone, cidade, estado, tipo) 
            VALUES ('$nome', '$documento', '$telefone', '$cidade', '$estado', '$tipo')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }

    // Fechar a conexão
    $conn->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
}
?>
