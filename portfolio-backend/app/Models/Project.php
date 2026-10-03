<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'tech_stack',
        'cover_image',
        'github_url',
        'demo_url',
        'status',
    ];

    protected $casts = [
        'tech_stack' => 'array',
    ];
}