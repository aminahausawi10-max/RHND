<?php
// Simple Front Controller & Router

session_start();

$requestUri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$method = $_SERVER["REQUEST_METHOD"];

// Route mapping
if (strpos($requestUri, "/api/") === 0) {
    header("Content-Type: application/json");
    
    if ($requestUri === "/api/login" && $method === "POST") {
        require __DIR__ . "/../src/api/login.php";
    } elseif ($requestUri === "/api/register" && $method === "POST") {
        require __DIR__ . "/../src/api/register.php";
    } elseif ($requestUri === "/api/setup") {
        require __DIR__ . "/setup.php";
    } elseif ($requestUri === "/api/posts") {
        require __DIR__ . "/../src/api/posts.php";
    } elseif ($requestUri === "/api/users") {
        require __DIR__ . "/../src/api/users.php";
    } elseif ($requestUri === "/api/requests") {
        require __DIR__ . "/../src/api/requests.php";
    } elseif ($requestUri === "/api/media") {
        require __DIR__ . "/../src/api/media.php";
    } elseif ($requestUri === "/api/entities") {
        require __DIR__ . "/../src/api/entities.php";
    } elseif (preg_match("#^/api/posts/(\d+)$#", $requestUri, $matches)) {
        $_GET["id"] = $matches[1];
        require __DIR__ . "/../src/api/post_detail.php";
    } else {
        http_response_code(404);
        echo json_encode(["error" => "API endpoint not found"]);
    }
    exit;
}

// Serve standard frontend
require __DIR__ . "/../templates/index.html";

