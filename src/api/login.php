<?php
require __DIR__ . "/../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
$stmt->execute([$data["email"]]);
$user = $stmt->fetch();

if ($user && password_verify($data["password"], $user["password_hash"])) {
    session_regenerate_id(true);
    $_SESSION["user_id"] = $user["id"];
    echo json_encode(["status" => "success"]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
}

