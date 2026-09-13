<?php
require __DIR__ . "/../../config/database.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

// Ensure settings table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Seed defaults if empty
    $chk = $pdo->query("SELECT COUNT(*) FROM settings")->fetchColumn();
    if ($chk == 0) {
        $defaults = [
            'stat_members' => '1',
            'stat_news' => '3',
            'stat_requests' => '1',
            'stat_media' => '2',
            'founder_name' => 'Alh. Inuwa Ahmed',
            'founder_phone' => '07047000070'
        ];
        $ins = $pdo->prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
        foreach ($defaults as $k => $v) {
            $ins->execute([$k, $v]);
        }
    }
} catch (Exception $e) {}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT key, value FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key']] = $row['value'];
        }
        echo json_encode($settings);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $adminPassword = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $adminPassword = $headers['X-Admin-Password'] ?? $headers['x-admin-password'] ?? $adminPassword;
    }
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check credentials (or allow if payload has admin password)
    if ($adminPassword !== 'Admin@RHND2026' && ($data['adminPassword'] ?? '') !== 'Admin@RHND2026') {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Incorrect Admin Password"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP");
        
        if (isset($data['key']) && isset($data['value'])) {
            $stmt->execute([$data['key'], (string)$data['value']]);
        }
        if (isset($data['settings']) && is_array($data['settings'])) {
            foreach ($data['settings'] as $k => $v) {
                $stmt->execute([$k, (string)$v]);
            }
        }
        
        echo json_encode(["success" => true, "message" => "Settings updated successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $key = $_GET['key'] ?? null;
    if ($key) {
        try {
            $stmt = $pdo->prepare("DELETE FROM settings WHERE key = ?");
            $stmt->execute([$key]);
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
