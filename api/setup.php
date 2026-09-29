<?php
require __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

try {
    // Create users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        country VARCHAR(100) DEFAULT 'United Kingdom',
        member_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create posts table
    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Official Update',
        photo TEXT NULL,
        video TEXT NULL,
        audio TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create settings table
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        `key` VARCHAR(100) PRIMARY KEY,
        `value` TEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Create requests table
    $pdo->exec("CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create media table
    $pdo->exec("CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'image',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create entities table
    $pdo->exec("CREATE TABLE IF NOT EXISTS entities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        country VARCHAR(100) DEFAULT 'Nigeria',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed default settings
    $defaults = [
        'stat_members' => '1',
        'stat_news' => '3',
        'stat_requests' => '1',
        'stat_media' => '2',
        'founder_name' => 'Mr. Inuwa Ahmed',
        'founder_phone' => '07047000070'
    ];
    $ins = $pdo->prepare("INSERT IGNORE INTO settings (`key`, `value`) VALUES (?, ?)");
    foreach ($defaults as $k => $v) {
        $ins->execute([$k, $v]);
    }

    // Create default admin account
    $adminPass = password_hash('Admin@RHND2026', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (name, email, password_hash) VALUES ('Super Admin', 'admin@rhnd.com', ?)");
    $stmt->execute([$adminPass]);

    echo json_encode(["success" => true, "message" => "All tables created and seeded successfully!"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
