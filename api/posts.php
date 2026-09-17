<?php
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");

require __DIR__ . "/../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

// Ensure posts table exists in PostgreSQL and has all required columns and constraints
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Official Update',
        photo TEXT NULL,
        video TEXT NULL,
        audio TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("ALTER TABLE posts ALTER COLUMN user_id DROP NOT NULL");
    $pdo->exec("ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Official Update'");
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
    
    $adminPassword = trim($adminPassword);
    
    if ($adminPassword !== 'Admin@RHND2026') {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Incorrect Admin Password"]);
        exit;
    }
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($posts ?: []);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch posts: " . $e->getMessage()]);
    }
} 
elseif ($method === 'POST') {
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    if (!isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing title or content"]);
        exit;
    }
    
    $title = trim($data['title']);
    $content = trim($data['content']);
    $category = !empty($data['category']) ? trim($data['category']) : 'Official Update';
    $photo = !empty($data['photo']) ? $data['photo'] : null;
    $video = !empty($data['video']) ? $data['video'] : null;
    $audio = !empty($data['audio']) ? $data['audio'] : null;

    try {
        $stmt = $pdo->prepare("INSERT INTO posts (title, content, category, photo, video, audio) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $content, $category, $photo, $video, $audio]);
        $newId = (int)$pdo->lastInsertId();
        echo json_encode([
            "success" => true,
            "id" => $newId,
            "post" => [
                "id" => $newId,
                "title" => $title,
                "content" => $content,
                "category" => $category,
                "photo" => $photo,
                "video" => $video,
                "audio" => $audio,
                "created_at" => date('c')
            ]
        ]);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save post: " . $e->getMessage()]);
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
        echo json_encode(["success" => true, "id" => (int)$id]);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete post: " . $e->getMessage()]);
    }
}
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}