<?php
// Configurações de cabeçalhos para retorno em JSON
header('Content-Type: application/json');

// Configurações de conexão com o banco de dados
$servername = "localhost"; // Nome do servidor
$username = "root"; // Usuário do banco de dados
$password = ""; // Senha do banco de dados
$dbname = "documentos"; // Nome do banco de dados

// Conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão falhou
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Falha na conexão com o banco de dados: " . $conn->connect_error]);
    exit;
}

// Verifica se os dados foram enviados via POST
if (isset($_POST['nome'], $_POST['documento'], $_POST['cidade'], $_POST['estado'], $_POST['telefone'], $_POST['tipo'])) {
    // Obtém os valores enviados pelo formulário
    $nome = $_POST['nome'];
    $documento = $_POST['documento'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];
    $telefone = $_POST['telefone'];
    $tipo = $_POST['tipo'];

    // Prepara a consulta SQL para inserir os dados
    $sql = "INSERT INTO itens (nome, documento, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?)";

    // Prepara e vincula os parâmetros para evitar SQL Injection
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ssssss", $nome, $documento, $telefone, $cidade, $estado, $tipo);

        // Tenta executar a consulta
        if ($stmt->execute()) {
            // Resposta de sucesso
            echo json_encode(["success" => true, "message" => "Documento cadastrado com sucesso!"]);
        } else {
            // Erro ao executar a consulta
            echo json_encode(["success" => false, "message" => "Erro ao salvar o documento: " . $stmt->error]);
        }

        // Fecha o statement
        $stmt->close();
    } else {
        // Erro ao preparar a consulta
        echo json_encode(["success" => false, "message" => "Erro ao preparar a consulta: " . $conn->error]);
    }
} else {
    // Dados incompletos
    echo json_encode(["success" => false, "message" => "Por favor, preencha todos os campos."]);
}

// Fecha a conexão com o banco
$conn->close();
?>
