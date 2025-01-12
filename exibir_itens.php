<?php
// Definindo as configurações de conexão ao banco de dados
$servername = "localhost";   // Nome do servidor (geralmente 'localhost')
$username = "root";          // Seu nome de usuário do banco de dados
$password = "";              // Sua senha do banco de dados
$dbname = "achados_perdidos"; // Nome do banco de dados

// Criar a conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);  // Caso a conexão falhe
}

// Definindo a consulta SQL para buscar os itens cadastrados
$sql = "SELECT nome, documento, cidade, estado, telefone, tipo FROM itens";

// Executando a consulta SQL
$result = $conn->query($sql);

// Verificando se há resultados
if ($result->num_rows > 0) {
    // Iniciando a tabela HTML
    echo "<table border='1'>";
    echo "<thead>";
    echo "<tr>";
    echo "<th>Nome</th><th>Documento</th><th>Cidade</th><th>Estado</th><th>Telefone</th><th>Tipo</th>";
    echo "</tr>";
    echo "</thead>";
    echo "<tbody>";

    // Exibindo os resultados em cada linha da tabela
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row["nome"] . "</td>";
        echo "<td>" . $row["documento"] . "</td>";
        echo "<td>" . $row["cidade"] . "</td>";
        echo "<td>" . $row["estado"] . "</td>";
        echo "<td>" . $row["telefone"] . "</td>";
        echo "<td>" . $row["tipo"] . "</td>";
        echo "</tr>";
    }

    echo "</tbody>";
    echo "</table>";

} else {
    // Caso não haja itens cadastrados
    echo "Nenhum item encontrado";
}

// Fechando a conexão com o banco de dados
$conn->close();
?>
