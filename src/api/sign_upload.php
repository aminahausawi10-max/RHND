<?php
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Password");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$cloudName = "dpghoiocq";
$apiKey = "283943216837512";
$apiSecret = "y_c8wSat2wFRqfuIjFuAwkA1aKE";

$timestamp = time();
$paramsToSign = "timestamp=" . $timestamp;
$signature = sha1($paramsToSign . $apiSecret);

echo json_encode([
    "success" => true,
    "cloud_name" => $cloudName,
    "api_key" => $apiKey,
    "timestamp" => $timestamp,
    "signature" => $signature
]);
