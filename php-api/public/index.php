<?php

require_once __DIR__ . '/../src/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

function json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

if ($path === '/health' && $method === 'GET') {
    try {
        db()->query('SELECT 1');
        echo json_encode(['ok' => true, 'service' => 'php-api', 'db' => 'connected']);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'service' => 'php-api', 'db' => 'error']);
    }
    exit;
}

if ($path === '/users' && $method === 'GET') {
    $stmt = db()->query('SELECT id, email, name, created_at FROM users ORDER BY id DESC LIMIT 100');
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($path === '/users' && $method === 'POST') {
    $body = json_input();
    if (empty($body['email']) || empty($body['password']) || empty($body['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'email, password and name are required']);
        exit;
    }

    try {
        $stmt = db()->prepare('INSERT INTO users (email, password, name) VALUES (:email, :password, :name)');
        $stmt->execute([
            ':email' => $body['email'],
            ':password' => $body['password'],
            ':name' => $body['name']
        ]);
        http_response_code(201);
        echo json_encode(['message' => 'user created']);
    } catch (Throwable $e) {
        http_response_code(409);
        echo json_encode(['error' => 'user already exists or invalid payload']);
    }
    exit;
}

if ($path === '/auth/login' && $method === 'POST') {
    $body = json_input();
    if (empty($body['email']) || empty($body['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'email and password are required']);
        exit;
    }

    $stmt = db()->prepare('SELECT id, email, name FROM users WHERE email = :email AND password = :password LIMIT 1');
    $stmt->execute([
        ':email' => $body['email'],
        ':password' => $body['password']
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'invalid credentials']);
        exit;
    }

    echo json_encode([
        'token' => 'dev-token-' . $user['id'],
        'user' => $user
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'route not found']);
