<?php
require __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["name"]) || !isset($data["email"]) || !isset($data["password"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$hash = password_hash($data["password"], PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$data["name"], $data["email"], $hash]);
    
    echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
} catch (\PDOException $e) {
    // Handle duplicate email or other errors
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}