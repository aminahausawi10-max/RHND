<?php
require __DIR__ . "/../../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

// Admin Authentication Check for modifications
if ($method === 'POST' || $method === 'DELETE') {
    $adminPassword = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $adminPassword = $headers['X-Admin-Password'] ?? $headers['x-admin-password'] ?? $adminPassword;
    }
    
    if ($adminPassword !== 'Admin@RHND2026') {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Incorrect Admin Password"]);
        exit;
    }
}


if ($method === 'GET') {
    // Fetch all posts
    $stmt = $pdo->query("SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
    $posts = $stmt->fetchAll();
    echo json_encode($posts);
} 
elseif ($method === 'POST') {
    // Create a new post
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or content"]);
        exit;
    }
    
    // Hardcode user_id 1 for admin for now since we don't have session management yet
    $userId = 1; 
    
    $stmt = $pdo->prepare("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $data['title'], $data['content']]);
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
}
elseif ($method === 'DELETE') {
    // Delete a post
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing post ID"]);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true]);
}
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
