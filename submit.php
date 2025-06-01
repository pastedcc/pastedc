<?php
header('Content-Type: application/json');

// Create storage directories if they don't exist
if (!file_exists('storage')) mkdir('storage');
if (!file_exists('logs')) mkdir('logs');

// Rate limiting (10 pastes/hour per IP)
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = "logs/rate_$ip.txt";
$rateLimit = 10;

if (file_exists($rateFile)) {
    $data = json_decode(file_get_contents($rateFile), true) ?: [];
    if ($data['count'] >= $rateLimit && time() - $data['timestamp'] < 3600) {
        die(json_encode(['error' => 'Rate limit exceeded. Try again later.']));
    }
}

// Get and validate input
$content = $_POST['content'] ?? '';
$expiry = $_POST['expiry'] ?? 'never';

if (empty(trim($content))) {
    die(json_encode(['error' => 'Paste content cannot be empty']));
}

// Generate unique ID
$pasteId = bin2hex(random_bytes(8));
$filename = "storage/$pasteId.txt";

// Save paste
file_put_contents($filename, $content);

// Update rate limiting
$rateData = [
    'count' => ($data['count'] ?? 0) + 1,
    'timestamp' => time()
];
file_put_contents($rateFile, json_encode($rateData));

// Return success
echo json_encode(['id' => $pasteId]);
?>
