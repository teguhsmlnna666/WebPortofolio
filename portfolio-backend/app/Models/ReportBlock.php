<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'type',
        'content',
        'metadata',
        'sort_order',
    ];

    /**
     * Metadata disimpan sebagai JSON
     * dan otomatis diubah menjadi array PHP.
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Satu blok dimiliki oleh satu laporan.
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}