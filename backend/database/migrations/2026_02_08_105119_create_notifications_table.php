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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Penerima notifikasi
            $table->string('type'); // target_assigned, comment_added, deadline_approaching, leave_approved, etc
            $table->string('title'); // Notification title
            $table->text('message'); // Notification message
            $table->string('link')->nullable(); // URL untuk redirect
            $table->string('related_type')->nullable(); // Model type (WorkTarget, Leave, etc)
            $table->unsignedBigInteger('related_id')->nullable(); // Model ID
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
