<?php

/*
 * Entry point Laravel untuk shared hosting (Hostinger).
 *
 * File ini berada di web root subdomain, berdampingan dengan hasil build React.
 * Kode Laravel (folder "teguh-app") disimpan DI LUAR web root supaya .env dan
 * source tidak bisa diakses dari browser. Folder itu dicari otomatis ke atas
 * dari lokasi file ini, jadi tidak ada path yang perlu diedit.
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$appPath = null;
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
    if (is_file($dir.'/teguh-app/vendor/autoload.php')) {
        $appPath = $dir.'/teguh-app';
        break;
    }
    $parent = dirname($dir);
    if ($parent === $dir) {
        break;
    }
    $dir = $parent;
}

if ($appPath === null) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Folder 'teguh-app' tidak ditemukan.\nPastikan teguh-app.zip sudah di-extract di folder domain (sejajar dengan public_html).");
}

if (file_exists($maintenance = $appPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $appPath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $appPath.'/bootstrap/app.php';

// Web root ini berperan sebagai folder "public" Laravel.
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
