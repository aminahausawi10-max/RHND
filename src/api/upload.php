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
$adminPassword = '';
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    $adminPassword = $headers['X-Admin-Password'] ?? $headers['x-admin-password'] ?? '';
}
$adminPassword = $adminPassword ?: ($_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '');
if (trim($adminPassword) !== 'Admin@RHND2026') {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Accept video file upload
if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
    // Try reading raw body as base64 fallback
    $rawInput = file_get_contents("php://input");
    if ($rawInput) {
        $data = json_decode($rawInput, true);
        if (!empty($data['video_base64'])) {
            echo json_encode([
                "success" => true,
                "video" => $data['video_base64'],
                "method" => "base64"
            ]);
            exit;
        }
    }
    http_response_code(400);
    echo json_encode(["error" => "No video file received", "files" => $_FILES, "err" => $_FILES['video']['error'] ?? 'none']);
    exit;
}

$file = $_FILES['video'];
$fileData = file_get_contents($file['tmp_name']);
if ($fileData === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to read uploaded file"]);
    exit;
}

$mimeType = $file['type'] ?: 'video/mp4';
$base64 = 'data:' . $mimeType . ';base64,' . base64_encode($fileData);

echo json_encode([
    "success" => true,
    "video" => $base64,
    "size" => $file['size'],
    "method" => "upload"
]);
