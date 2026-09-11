<?php
// Use DATABASE_URL environment variable provided by Neon/Vercel
$dbUrl = getenv("DATABASE_URL") ?: $_ENV["DATABASE_URL"] ?? null;

if (!$dbUrl) {
    die(json_encode(["error" => "DATABASE_URL environment variable is not set."]));
}

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

