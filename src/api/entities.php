<?php
require __DIR__ . "/../../config/database.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

// Ensure entities table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS entities (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        leader VARCHAR(150),
        description TEXT,
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed defaults if empty
    $check = $pdo->query("SELECT COUNT(*) FROM entities")->fetchColumn();
    if ($check == 0) {
        $seeds = [
            ['Ministry', 'Federal Ministry of Foreign Affairs', 'Amb. Yusuf Maitama Tuggar (Minister)', 'Promoting Nigeria national interests and providing diplomatic & consular representation globally.', 'https://foreignaffairs.gov.ng'],
            ['Ministry', 'Federal Ministry of Interior', 'Dr. Olubunmi Tunji-Ojo (Minister)', 'Oversees homeland security, citizenship, passport administration, and immigration services.', 'https://interior.gov.ng'],
            ['Ministry', 'Federal Ministry of Finance', 'Mr. Wale Edun (Minister)', 'Formulates fiscal policies and manages economic resources and diaspora investment frameworks.', 'https://finance.gov.ng'],
            ['Ministry', 'Ministry of Communications & Digital Economy', 'Dr. Bosun Tijani (Minister)', 'Facilitating digital transformation, talent export programs, and tech partnerships worldwide.', 'https://fmcide.gov.ng'],
            ['Agency', 'NiDCOM - Nigerians in Diaspora Commission', 'Hon. Abike Dabiri-Erewa (CEO/Chairman)', 'Dedicated government commission for diaspora engagement, welfare, empowerment, and national development.', 'https://nidcom.gov.ng'],
            ['Agency', 'Nigeria Immigration Service (NIS)', 'Comptroller-General', 'Responsible for issuance of Nigerian standard passports, visa services, and border management.', 'https://immigration.gov.ng'],
            ['Agency', 'National Identity Management Commission (NIMC)', 'Director-General', 'Manages the National Identity Database and oversees diaspora National Identification Number (NIN) enrollment.', 'https://nimc.gov.ng'],
            ['Agency', 'Nigerian Investment Promotion Commission (NIPC)', 'Executive Secretary', 'Encourages, promotes, and coordinates diaspora and foreign direct investments into Nigeria.', 'https://nipc.gov.ng']
        ];
        $insert = $pdo->prepare("INSERT INTO entities (type, name, leader, description, website) VALUES (?, ?, ?, ?, ?)");
        foreach ($seeds as $s) {
            $insert->execute($s);
        }
    }
} catch (Exception $e) {
    // ignore
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
    $type = $_GET['type'] ?? null;
    try {
        if ($type) {
            $stmt = $pdo->prepare("SELECT * FROM entities WHERE LOWER(type) = LOWER(?) ORDER BY id ASC");
            $stmt->execute([$type]);
        } else {
            $stmt = $pdo->query("SELECT * FROM entities ORDER BY id ASC");
        }
        $entities = $stmt->fetchAll();
        echo json_encode($entities);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['name']) || !isset($data['type'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing entity name or type"]);
        exit;
    }

    $type = $data['type'];
    $name = $data['name'];
    $leader = $data['leader'] ?? '';
    $description = $data['description'] ?? '';
    $website = $data['website'] ?? 'https://gov.ng';

    try {
        $stmt = $pdo->prepare("INSERT INTO entities (type, name, leader, description, website) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$type, $name, $leader, $description, $website]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing entity ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM entities WHERE id = ?");
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