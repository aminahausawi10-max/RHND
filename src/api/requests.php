<?php
require __DIR__ . "/../../config/database.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

// Ensure requests table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        country VARCHAR(100) DEFAULT 'Nigeria',
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $e) {
    // table might already exist
}

// Admin Auth check for DELETE or status update
if ($method === 'DELETE' || ($method === 'PUT')) {
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
        $stmt = $pdo->query("SELECT * FROM requests ORDER BY created_at DESC");
        $requests = $stmt->fetchAll();
        echo json_encode($requests);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if updating status
    if (isset($_GET['action']) && $_GET['action'] === 'status') {
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        $status = $data['status'] ?? 'Resolved';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing request ID"]);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode(["success" => true, "status" => $status]);
        exit;
    }

    if (!isset($data['subject']) || !isset($data['details'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing subject or details"]);
        exit;
    }

    $name = $data['name'] ?? 'Diaspora Member';
    $email = $data['email'] ?? 'member@rhnd.com';
    $country = $data['country'] ?? 'Diaspora';
    $category = $data['category'] ?? 'Consular Support';
    $subject = $data['subject'];
    $details = $data['details'];

    try {
        $stmt = $pdo->prepare("INSERT INTO requests (name, email, country, category, subject, details) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $country, $category, $subject, $details]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing request ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM requests WHERE id = ?");
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