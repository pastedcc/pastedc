<?php
session_start();
if (!$_SESSION['admin']) die(json_encode(['error' => 'Unauthorized']));

header('Content-Type: application/json');

$pastes = [];
foreach (glob('storage/*.txt') as $file) {
    $id = basename($file, '.txt');
    $viewsFile = "logs/views_$id.txt";
    $views = file_exists($viewsFile) ? (int)file_get_contents($viewsFile) : 0;
    $pastes[] = [
        'id' => $id,
        'views' => $views,
        'created' => filemtime($file)
    ];
}

// Sort by most recent
usort($pastes, function($a, $b) {
    return $b['created'] - $a['created'];
});

echo json_encode(array_slice($pastes, 0
