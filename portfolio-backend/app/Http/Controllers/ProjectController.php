<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * Menampilkan semua project published.
     */

    public function adminIndex(): JsonResponse
    {
        $projects = Project::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function index(): JsonResponse
    {
        $projects = Project::where('status', 'published')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Menampilkan detail project berdasarkan slug.
     */
    public function show(string $slug): JsonResponse
    {
        $project = Project::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $project,
        ]);
    }

    /**
     * Menambahkan project baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'tech_stack' => ['nullable', 'array'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        $baseSlug = $validated['slug'];
        $counter = 1;

        while (Project::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter;
            $counter++;
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request
                ->file('cover_image')
                ->store('projects/covers', 'public');
        }

        $project = Project::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil ditambahkan.',
            'data' => $project,
        ], 201);
    }

    /**
     * Mengubah project.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'tech_stack' => ['nullable', 'array'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'status' => ['required', 'in:draft,published'],
        ]);

        if ($validated['title'] !== $project->title) {
            $newSlug = Str::slug($validated['title']);

            $baseSlug = $newSlug;
            $counter = 1;

            while (
                Project::where('slug', $newSlug)
                    ->where('id', '!=', $project->id)
                    ->exists()
            ) {
                $newSlug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $newSlug;
        }

        if ($request->hasFile('cover_image')) {
            if ($project->cover_image) {
                Storage::disk('public')->delete($project->cover_image);
            }

            $validated['cover_image'] = $request
                ->file('cover_image')
                ->store('projects/covers', 'public');
        }

        $project->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil diperbarui.',
            'data' => $project->fresh(),
        ]);
    }

    /**
     * Menghapus project.
     */
    public function destroy(int $id): JsonResponse
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan.',
            ], 404);
        }

        if ($project->cover_image) {
            Storage::disk('public')->delete($project->cover_image);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil dihapus.',
        ]);
    }

    public function adminShow(int $id): JsonResponse
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $project,
        ]);
    }
}