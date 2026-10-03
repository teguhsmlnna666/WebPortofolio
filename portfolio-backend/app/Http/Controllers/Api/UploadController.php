<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $path = $validated['image']->store(
            'reports/images',
            'public'
        );

        return response()->json([
            'success' => true,
            'message' => 'Gambar berhasil diupload.',
            'data' => [
                'path' => $path,
                'url' => asset('storage/' . $path),
            ],
        ]);
    }

    public function cover(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $path = $validated['image']->store(
            'reports/covers',
            'public'
        );

        return response()->json([
            'success' => true,
            'message' => 'Cover berhasil diupload.',
            'data' => [
                'path' => $path,
                'url' => asset('storage/' . $path),
            ],
        ]);
    }
}