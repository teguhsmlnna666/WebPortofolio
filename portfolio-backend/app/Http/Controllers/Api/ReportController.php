<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /**
     * Menampilkan semua laporan.
     */
    public function index(): JsonResponse
    {
        $reports = Report::with('blocks')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * Menampilkan satu laporan berdasarkan slug.
     */
    public function show(string $slug): JsonResponse
    {
        $report = Report::with('blocks')
            ->where('slug', $slug)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Membuat laporan baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:reports,slug'],
            'category' => ['required', 'string', 'max:100'],
            'week' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published'],
            'blocks' => ['nullable', 'array'],
            'blocks.*.type' => ['required', 'string', 'max:50'],
            'blocks.*.content' => ['nullable'],
            'blocks.*.metadata' => ['nullable', 'array'],
            'blocks.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $report = DB::transaction(function () use ($validated) {
            $report = Report::create([
                'title' => $validated['title'],
                'slug' => $validated['slug']
                    ?? Str::slug($validated['title']),
                'category' => $validated['category'],
                'week' => $validated['week'] ?? null,
                'description' => $validated['description'] ?? null,
                'cover_image' => $validated['cover_image'] ?? null,
                'status' => $validated['status'] ?? 'draft',
            ]);

            foreach ($validated['blocks'] ?? [] as $index => $block) {
                $report->blocks()->create([
                    'type' => $block['type'],
                    'content' => $block['content'] ?? null,
                    'metadata' => $block['metadata'] ?? null,
                    'sort_order' => $block['sort_order'] ?? $index,
                ]);
            }

            return $report;
        });

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dibuat.',
            'data' => $report->load('blocks'),
        ], 201);
    }

    /**
     * Mengubah laporan.
     */
    public function update(
        Request $request,
        Report $report
    ): JsonResponse {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'unique:reports,slug,' . $report->id,
            ],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'week' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        \Log::info('UPDATE REPORT', [
            'report_id' => $report->id,
            'cover_image_dari_request' => $request->input('cover_image'),
            'validated' => $validated,
        ]);

        $report->update([
            'title' => $validated['title'] ?? $report->title,
            'slug' => $validated['slug'] ?? $report->slug,
            'category' => $validated['category'] ?? $report->category,
            'week' => array_key_exists('week', $validated)
                ? $validated['week']
                : $report->week,
            'description' => array_key_exists('description', $validated)
                ? $validated['description']
                : $report->description,
            'cover_image' => array_key_exists('cover_image', $validated)
                ? $validated['cover_image']
                : $report->cover_image,
            'status' => $validated['status'] ?? $report->status,
        ]);

        $report->refresh();

        \Log::info('HASIL UPDATE REPORT', [
            'report_id' => $report->id,
            'cover_image_setelah_update' => $report->cover_image,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil diperbarui.',
            'data' => $report->load('blocks'),
        ]);
    }

    /**
     * Menghapus laporan.
     */
    public function destroy(Report $report): JsonResponse
    {
        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dihapus.',
        ]);
    }
}