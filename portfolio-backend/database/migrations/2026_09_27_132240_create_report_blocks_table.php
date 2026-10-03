<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_blocks', function (Blueprint $table) {
            $table->id();

            // Relasi ke laporan
            $table->foreignId('report_id')
                ->constrained('reports')
                ->cascadeOnDelete();

            // Tipe blok:
            // paragraph, heading, image, code, bullet_list,
            // numbered_list, quote, table, divider
            $table->string('type');

            // Isi utama blok
            $table->longText('content')->nullable();

            // Data tambahan dalam format JSON
            $table->json('metadata')->nullable();

            // Urutan blok dalam laporan
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            // Mempercepat pengambilan blok berdasarkan urutan
            $table->index(['report_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_blocks');
    }
};