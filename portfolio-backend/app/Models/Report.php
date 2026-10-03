<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'week',
        'description',
        'cover_image',
        'status',
    ];

    /**
     * Satu laporan memiliki banyak blok.
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(ReportBlock::class)
            ->orderBy('sort_order');
    }
}