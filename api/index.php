<?php
// Simple Front Controller & Router

session_start();

$requestUri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$method = $_SERVER["REQUEST_METHOD"];

// Route mapping
if (strpos($requestUri, "/api/") === 0) {
    header("Content-Type: application/json");
    
    if (($requestUri === "/api/login" || $requestUri === "/api/login.php") && $method === "POST") {
        require __DIR__ . "/login.php";
    } elseif (($requestUri === "/api/register" || $requestUri === "/api/register.php") && $method === "POST") {
        require __DIR__ . "/register.php";
    } elseif ($requestUri === "/api/setup" || $requestUri === "/api/setup.php") {
        require __DIR__ . "/setup.php";
    } elseif ($requestUri === "/api/posts" || $requestUri === "/api/posts.php") {
        require __DIR__ . "/posts.php";
    } elseif ($requestUri === "/api/users" || $requestUri === "/api/users.php") {
        require __DIR__ . "/users.php";
    } elseif ($requestUri === "/api/requests" || $requestUri === "/api/requests.php") {
        require __DIR__ . "/requests.php";
    } elseif ($requestUri === "/api/media" || $requestUri === "/api/media.php") {
        require __DIR__ . "/media.php";
    } elseif ($requestUri === "/api/entities" || $requestUri === "/api/entities.php") {
        require __DIR__ . "/entities.php";
    } elseif ($requestUri === "/api/settings" || $requestUri === "/api/settings.php" || $requestUri === "/api/stats") {
        require __DIR__ . "/settings.php";
    } elseif (preg_match("#^/api/posts/(\d+)$#", $requestUri, $matches)) {
        $_GET["id"] = $matches[1];
        require __DIR__ . "/post_detail.php";
    } else {
        http_response_code(404);
        echo json_encode(["error" => "API endpoint not found: " . $requestUri]);
    }
    exit;
}

// Serve standard frontend
require __DIR__ . "/../templates/index.html";