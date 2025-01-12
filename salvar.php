<?php
// Configurações do banco de dados
$host = "localhost"; // Altere para o host do seu banco
$dbname = "achados"; // Nome do banco de dados
$username = "root"; // Seu nome de usuário do MySQL
$password = ""; // Sua senha do MySQL

// Conexão com o banco de dados
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage();
    exit();
}

// Verifica se os dados foram recebidos
$data = json_decode(file_get_contents('php://input'), true);

// Verifica se os dados foram corretamente decodificados
if ($data) {
    $nome = $data['nome'];
    $documento = $data['documento'];
    $cidade = $data['cidade'];
    $estado = $data['estado'];
    $telefone = $data['telefone'];
    $tipo = $data['tipo'];

    // Preparando o SQL para inserção
    $sql = "INSERT INTO documentos (nome, documento, cidade, estado, telefone, tipo) 
            VALUES (:nome, :documento, :cidade, :estado, :telefone, :tipo)";
    
    // Executando a query
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':documento', $documento);
    $stmt->bindParam(':cidade', $cidade);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':tipo', $tipo);

    if ($stmt->execute()) {
        // Se tudo der certo, retornamos um JSON com sucesso
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar o documento.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos ou ausentes.']);
}
?>
