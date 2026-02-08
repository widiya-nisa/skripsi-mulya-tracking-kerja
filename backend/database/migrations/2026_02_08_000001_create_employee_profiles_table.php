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
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Data Pribadi
            $table->string('nik')->unique()->nullable(); // NIK KTP
            $table->string('full_name');
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_place', 100)->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            
            // Data Pekerjaan
            $table->date('join_date')->nullable();
            $table->string('employee_id', 50)->unique()->nullable(); // ID Karyawan internal
            $table->string('position')->nullable(); // Posisi/Jabatan
            $table->enum('employment_status', ['permanent', 'contract', 'probation', 'internship'])->default('probation');
            $table->decimal('salary', 15, 2)->nullable();
            
            // Pendidikan
            $table->string('last_education', 50)->nullable(); // SD, SMP, SMA, D3, S1, S2, S3
            $table->string('institution', 200)->nullable(); // Nama institusi pendidikan
            $table->string('major', 100)->nullable(); // Jurusan
            $table->year('graduation_year')->nullable();
            
            // Kontak Darurat
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relation', 50)->nullable(); // Hubungan (ayah, ibu, saudara, dll)
            
            // Upload Dokumen
            $table->string('ktp_file')->nullable(); // Path file KTP
            $table->string('ijazah_file')->nullable(); // Path file Ijazah
            $table->string('cv_file')->nullable(); // Path file CV
            $table->string('photo')->nullable(); // Foto profil
            
            // Bank Account
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_name', 100)->nullable();
            
            // Status
            $table->boolean('is_verified')->default(false); // Verifikasi admin
            $table->text('notes')->nullable(); // Catatan admin
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
