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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Frontend Developer, Backend Developer, Mobile Developer, etc
            $table->text('description')->nullable(); // Deskripsi pekerjaan
            $table->enum('type', ['it', 'operasional', 'admin', 'ceo'])->default('operasional'); // Tipe department
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
