<?php
require __DIR__ . "/../config/database.php";

$email = 'admin@rhnd.com';
$password = 'AdminPassword123!';
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES ('Super Admin', ?, ?) ON CONFLICT (email) DO NOTHING");
    $stmt->execute([$email, $hash]);
    echo "Admin account created successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
