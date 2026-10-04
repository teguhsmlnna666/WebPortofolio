<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Di database baru kolom ini sudah dibuat oleh create_messages_table.
        if (Schema::hasColumn('messages', 'subject')) {
            return;
        }

        Schema::table('messages', function (Blueprint $table) {
            $table->string('subject')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('subject');
        });
    }
};