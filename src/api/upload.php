<?php
@ini_set('memory_limit', '512M');
@ini_set('upload_max_filesize', '200M');
@ini_set('post_max_size', '200M');
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Password");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Admin auth
$adminPassword = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    $adminPassword = $headers['X-Admin-Password'] ?? $headers['x-admin-password'] ?? $adminPassword;
}
$adminPassword = $adminPassword ?: ($_POST['admin_password'] ?? $_GET['admin_password'] ?? '');
if (trim($adminPassword) !== 'Admin@RHND2026') {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized: Incorrect Admin Password"]);
    exit;
}

$uploadedFile = $_FILES['video'] ?? $_FILES['file'] ?? $_FILES['photo'] ?? null;

if (!$uploadedFile || $uploadedFile['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        "error" => "No file uploaded or upload error occurred",
        "code" => $uploadedFile['error'] ?? 'missing'
    ]);
    exit;
}

$cloudName = "dpghoiocq";
$apiKey = "283943216837512";
$apiSecret = "y_c8wSat2wFRqfuIjFuAwkA1aKE";
$timestamp = time();
$signature = sha1("timestamp=" . $timestamp . $apiSecret);

$mimeType = $uploadedFile['type'] ?? '';
$resourceType = 'auto';

$cfile = new CURLFile($uploadedFile['tmp_name'], $uploadedFile['type'], $uploadedFile['name']);

$postFields = [
    'file' => $cfile,
    'api_key' => $apiKey,
    'timestamp' => $timestamp,
    'signature' => $signature
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode(["error" => "Cloudinary cURL error: " . $curlErr]);
    exit;
}

$resData = json_decode($response, true);
if ($httpCode >= 200 && $httpCode < 300 && !empty($resData['secure_url'])) {
    echo json_encode([
        "success" => true,
        "url" => $resData['secure_url'],
        "video" => $resData['secure_url'],
        "public_id" => $resData['public_id'] ?? null,
        "format" => $resData['format'] ?? null,
        "bytes" => $resData['bytes'] ?? $uploadedFile['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "error" => $resData['error']['message'] ?? ("Cloud storage upload failed with HTTP " . $httpCode),
        "raw" => $resData
    ]);
}
