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
        // Drop unused tables
        Schema::dropIfExists('leads');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('sales_targets');
        Schema::dropIfExists('marketing_campaigns');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('time_logs');
        
        // Add manager_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('role')->constrained('users')->onDelete('set null');
        });
        
        // Create work_targets table (target kerja dari manager)
        Schema::create('work_targets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade'); // Manager yang assign
            $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade'); // Developer yang dikasih target
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'overdue'])->default('pending');
            $table->date('deadline');
            $table->timestamps();
        });
        
        // Create work_progress table (progress dari developer)
        Schema::create('work_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_target_id')->constrained('work_targets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Developer yang input progress
            $table->text('progress_note');
            $table->string('attachment')->nullable(); // Path to screenshot/foto
            $table->integer('percentage')->default(0); // Progress percentage 0-100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_progress');
        Schema::dropIfExists('work_targets');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn('manager_id');
        });
        
        // Recreate dropped tables (optional, for rollback)
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }
};
