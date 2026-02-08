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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Karyawan yang mengajukan
            $table->enum('type', ['annual', 'sick', 'permission', 'unpaid']); // cuti tahunan, sakit, izin, unpaid
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('days_count'); // Total hari cuti
            $table->text('reason'); // Alasan cuti
            $table->string('attachment')->nullable(); // Surat dokter, dll
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Manager yang approve
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable(); // Alasan ditolak
            $table->text('notes')->nullable(); // Catatan tambahan
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
