<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportBlockController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Public Reports
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{slug}', [ReportController::class, 'show']);

// Public Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);


    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::post('/reports', [ReportController::class, 'store']);
    Route::put('/reports/{report}', [ReportController::class, 'update']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Report Blocks
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/{report}/blocks',
        [ReportBlockController::class, 'index']
    );

    Route::post(
        '/reports/{report}/blocks',
        [ReportBlockController::class, 'store']
    );

    Route::put(
        '/blocks/{block}',
        [ReportBlockController::class, 'update']
    );

    Route::delete(
        '/blocks/{block}',
        [ReportBlockController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Upload
    |--------------------------------------------------------------------------
    */

    Route::post('/upload/image', [UploadController::class, 'image']);
    Route::post('/upload/cover', [UploadController::class, 'cover']);


    /*
    |--------------------------------------------------------------------------
    | Projects
    |--------------------------------------------------------------------------
    */

    // Mengambil semua project untuk halaman admin
    Route::get('/admin/projects', [
        ProjectController::class,
        'adminIndex'
    ]);

    // Mengambil satu project berdasarkan ID untuk halaman edit
    Route::get('/admin/projects/{id}', [
        ProjectController::class,
        'adminShow'
    ]);

    // Menambahkan project
    Route::post('/projects', [
        ProjectController::class,
        'store'
    ]);

    // Mengubah project
    Route::put('/projects/{id}', [
        ProjectController::class,
        'update'
    ]);

    // Menghapus project
    Route::delete('/projects/{id}', [
        ProjectController::class,
        'destroy'
    ]);
});


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

// Contact form
Route::post('/contact', [MessageController::class, 'store']);

// Messages
Route::get('/messages', [MessageController::class, 'index']);
Route::delete('/messages/{message}', [MessageController::class, 'destroy']);