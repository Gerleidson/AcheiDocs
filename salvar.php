<?php
// Configurações de cabeçalhos para permitir requisições AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permite requisição de qualquer origem

// Conexão com o banco de dados
$servername = "localhost"; // Alterar para seu servidor
$username = "root"; // Seu usuário do banco de dados
$password = ""; // Sua senha do banco de dados
$dbname = "documentos"; // Nome do banco de dados

$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão falhou
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Falha na conexão com o banco de dados"]));
}

// Recebe os dados em formato JSON
$data = json_decode(file_get_contents('php://input'), true);

// Verifica se os dados foram recebidos corretamente
if (isset($data['nome']) && isset($data['documento']) && isset($data['cidade']) && isset($data['estado']) && isset($data['telefone']) && isset($data['tipo'])) {
    $nome = $data['nome'];
    $documento = $data['documento'];
    $cidade = $data['cidade'];
    $estado = $data['estado'];
    $telefone = $data['telefone'];
    $tipo = $data['tipo'];

    // Prepara a consulta SQL para inserir os dados no banco
    $sql = "INSERT INTO itens (nome, documento, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?)";

    // Prepara e vincula os parâmetros para evitar SQL Injection
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ssssss", $nome, $documento, $telefone, $cidade, $estado, $tipo);

        // Tenta executar a consulta
        if ($stmt->execute()) {
            // Resposta de sucesso
            echo json_encode(["success" => true, "message" => "Documento cadastrado com sucesso!"]);
        } else {
            // Resposta de erro
            echo json_encode(["success" => false, "message" => "Erro ao salvar o documento."]);
        }

        // Fecha o statement
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao preparar a consulta."]);
    }
} else {
    // Dados incompletos
    echo json_encode(["success" => false, "message" => "Por favor, preencha todos os campos."]);
}

// Fecha a conexão com o banco
$conn->close();
?>
