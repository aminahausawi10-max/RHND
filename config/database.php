<?php
// HARDCODED DATABASE URL FOR VERCEL
$dbUrl = "postgresql://neondb_owner:npg_DpIVbjQh3Rz5@ep-green-breeze-at2cczuz-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Parse postgres URL: postgres://user:password@host:port/dbname
$parsedUrl = parse_url($dbUrl);
$host = $parsedUrl["host"];
$port = $parsedUrl["port"] ?? 5432;
$user = $parsedUrl["user"];
$pass = $parsedUrl["pass"];
$db = ltrim($parsedUrl["path"], "/");

$dsn = "pgsql:host=$host;port=$port;dbname=$db;sslmode=require";
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