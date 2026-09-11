<?php
require __DIR__ . "/../../config/database.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

// Ensure media_items table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS media_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        media_type VARCHAR(50) NOT NULL DEFAULT 'Photo',
        url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $e) {
    // table might already exist
}

// Admin Auth check for write/delete
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
    try {
        $stmt = $pdo->query("SELECT * FROM media_items ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        echo json_encode($items);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['title']) || !isset($data['url'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or URL"]);
        exit;
    }

    $title = $data['title'];
    $media_type = $data['media_type'] ?? 'Photo';
    $url = $data['url'];
    $caption = $data['caption'] ?? '';

    try {
        $stmt = $pdo->prepare("INSERT INTO media_items (title, media_type, url, caption) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $media_type, $url, $caption]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing media ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM media_items WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
