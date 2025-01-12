<?php
// Conectar ao banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "achados_perdidos";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Buscar dados na tabela
$sql = "SELECT * FROM itens";
$result = $conn->query($sql);

// Exibir os dados na tabela
if ($result->num_rows > 0) {
    // Gerar a tabela com os dados
    echo "<table class='table table-striped table-bordered' id='tabela'>";
    echo "<thead class='thead-light'>
            <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>Contato</th>
                <th>Status</th>
            </tr>
          </thead>";
    echo "<tbody>";

    while($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>" . $row["nome"] . "</td>
                <td>" . $row["documento"] . "</td>
                <td>" . $row["cidade"] . "</td>
                <td>" . $row["estado"] . "</td>
                <td>" . $row["telefone"] . "</td>
                <td>" . $row["tipo"] . "</td>
              </tr>";
    }

    echo "</tbody></table>";
} else {
    echo "Nenhum item encontrado.";
}

$conn->close();
?>
