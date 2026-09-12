<?php
require __DIR__ . "/../../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

// Ensure posts table exists in PostgreSQL and has photo, video, audio columns
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        photo TEXT NULL,
        video TEXT NULL,
        audio TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS photo TEXT NULL");
    $pdo->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS video TEXT NULL");
    $pdo->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio TEXT NULL");
} catch (\Exception $e) {
    // Ignore if table exists or permission quirks
}

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
    try {
        $stmt = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC");
        $posts = $stmt->fetchAll();
        echo json_encode($posts ?: []);
    } catch (\Exception $e) {
        echo json_encode([]);
    }
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or content"]);
        exit;
    }
    
    $photo = $data['photo'] ?? null;
    $video = $data['video'] ?? null;
    $audio = $data['audio'] ?? null;

    try {
        $stmt = $pdo->prepare("INSERT INTO posts (title, content, photo, video, audio) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['title'], $data['content'], $photo, $video, $audio]);
        $newId = $pdo->lastInsertId();
        echo json_encode(["success" => true, "id" => $newId]);
    } catch (\Exception $e) {
        // Fallback for older schemas
        try {
            $stmt = $pdo->prepare("INSERT INTO posts (title, content) VALUES (?, ?)");
            $stmt->execute([$data['title'], $data['content']]);
            $newId = $pdo->lastInsertId();
            echo json_encode(["success" => true, "id" => $newId]);
        } catch (\Exception $e2) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save post: " . $e2->getMessage()]);
        }
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing post ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete post: " . $e->getMessage()]);
    }
}
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
