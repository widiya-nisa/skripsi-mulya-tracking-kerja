<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressAttachment extends Model
{
    protected $fillable = [
        'work_progress_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
    ];

    /**
     * Get the progress that owns the attachment
     */
    public function workProgress()
    {
        return $this->belongsTo(WorkProgress::class, 'work_progress_id');
    }

    /**
     * Get the user who uploaded the file
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get file size in human readable format
     */
    public function getFileSizeHumanAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
