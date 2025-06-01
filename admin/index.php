<?php
// Simple password protection
session_start();

if ($_POST['password'] === 'YOUR_ADMIN_PASSWORD') {
    $_SESSION['admin'] = true;
}

if (!$_SESSION['admin']) {
    echo '
    <form method="post">
        <input type="password" name="password" placeholder="Admin password">
        <button type="submit">Login</button>
    </form>
    ';
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
    <div class="container">
        <h1>Admin Panel</h1>
        <div class="stats">
            <h2>Recent Pastes</h2>
            <div id="paste-list"></div>
        </div>
        <button onclick="clearOldPastes()">Clear Expired Pastes</button>
        <a href="../">Back to pastebin</a>
    </div>
    <script src="../scripts/admin.js"></script>
</body>
</html>
