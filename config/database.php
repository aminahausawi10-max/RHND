<?php
// Configuration for WhoGoHost (MySQL/MariaDB)
$host    = 'localhost';
$db      = 'rhnddias_diasporaa';
$user    = 'rhnddias_diasporaa';
$pass    = 'YFPDsfH9J6BqnG84nWZH';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die(json_encode(["error" => "Database connection failed: " . $e->getMessage()]));
}
