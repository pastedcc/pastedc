<?php
$pasteId = $_GET['id'] ?? '';
$filename = "storage/$pasteId.txt";

if (!preg_match('/^[a-f0-9]{16}$/', $pasteId) || !file_exists($filename)) {
    http_response_code(404);
    die('Paste not found or has expired');
}

// Log view
$viewsFile = "logs/views_$pasteId.txt";
$views = file_exists($viewsFile) ? (int)file_get_contents($viewsFile) + 1 : 1;
file_put_contents($viewsFile, $views);

$content = htmlspecialchars(file_get_contents($filename));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paste <?= substr($pasteId, 0, 8) ?>...</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container">
        <pre><?= $content ?></pre>
        <div class="meta">Views: <?= $views ?></div>
    </div>
</body>
</html>
