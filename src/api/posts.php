<?php
require __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT posts.*, users.name as author FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC");
    $posts = $stmt->fetchAll();
    echo json_encode($posts);
} elseif ($method === "POST") {
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data["title"]) || !isset($data["content"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or content"]);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION["user_id"], $data["title"], $data["content"]]);
    echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
} else {
    http_response_code(405);
}

