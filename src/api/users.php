<?php
require __DIR__ . "/../../config/database.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

// Ensure users table has country column
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United Kingdom'");
} catch(Exception $e) {}

// Admin Auth check for write/delete
if ($method === 'DELETE') {
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
        $stmt = $pdo->query("SELECT id, name, email, COALESCE(country, 'United Kingdom') AS country, created_at FROM users ORDER BY id DESC");
        $users = $stmt->fetchAll();
        echo json_encode($users);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing name, email or password"]);
        exit;
    }
    try {
        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $country = $data['country'] ?? 'United Kingdom';
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, country) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $hash, $country]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["error" => "User creation failed (Email may already exist)"]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing user ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
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
