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
        // Create chat_groups table
        Schema::create('chat_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama grup: "Tim IT", "Project X", dll
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_private')->default(false); // true = private chat 1-on-1
            $table->timestamps();
        });

        // Create chat_group_members table
        Schema::create('chat_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('chat_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_admin')->default(false); // Admin grup bisa manage member
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
        });

        // Modify messages table to use group_id
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('id')->constrained('chat_groups')->onDelete('cascade');
            // Keep existing columns for backward compatibility
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn('group_id');
        });
        
        Schema::dropIfExists('chat_group_members');
        Schema::dropIfExists('chat_groups');
    }
};
