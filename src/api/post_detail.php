<?php
require __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];
$postId = $_GET["id"] ?? null;

if (!$postId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing post ID"]);
    exit;
}

if ($method === "GET") {
    $stmt = $pdo->prepare("SELECT posts.*, users.name as author FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    if ($post) {
        echo json_encode($post);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Not found"]);
    }
} elseif ($method === "DELETE") {
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
    $stmt->execute([$postId, $_SESSION["user_id"]]);
    echo json_encode(["status" => "success"]);
} else {
    http_response_code(405);
}

