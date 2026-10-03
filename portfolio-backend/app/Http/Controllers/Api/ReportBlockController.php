<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportBlockController extends Controller
{
    /**
     * Menampilkan semua block dari sebuah laporan.
     */
    public function index(Report $report): JsonResponse
    {
        $blocks = $report->blocks;

        return response()->json([
            'success' => true,
            'data' => $blocks,
        ]);
    }

    /**
     * Menambahkan block baru ke laporan.
     */
    public function store(
        Request $request,
        Report $report
    ): JsonResponse {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:50'],
            'content' => ['nullable'],
            'metadata' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $block = $report->blocks()->create([
            'type' => $validated['type'],
            'content' => $validated['content'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
            'sort_order' => $validated['sort_order']
                ?? ($report->blocks()->max('sort_order') + 1),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Block berhasil ditambahkan.',
            'data' => $block,
        ], 201);
    }

    /**
     * Mengubah block.
     */
    public function update(
        Request $request,
        ReportBlock $block
    ): JsonResponse {
        $validated = $request->validate([
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'content' => ['nullable'],
            'metadata' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $block->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Block berhasil diperbarui.',
            'data' => $block->fresh(),
        ]);
    }

    /**
     * Menghapus block.
     */
    public function destroy(ReportBlock $block): JsonResponse
    {
        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Block berhasil dihapus.',
        ]);
    }
}