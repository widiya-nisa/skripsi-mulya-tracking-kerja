<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #001f3f; padding-bottom: 15px; }
        .header h1 { font-size: 20px; color: #001f3f; margin-bottom: 5px; }
        .header p { font-size: 10px; color: #666; }
        .meta { margin-bottom: 15px; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #001f3f; color: white; padding: 10px; text-align: left; font-size: 10px; font-weight: bold; }
        td { border-bottom: 1px solid #ddd; padding: 8px 10px; font-size: 10px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 9px; font-weight: bold; }
        .badge-success { background-color: #4CAF50; color: white; }
        .badge-info { background-color: #2196F3; color: white; }
        .badge-warning { background-color: #FF9800; color: white; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Daftar Lengkap Karyawan</p>
    </div>
    <div class="meta">
        <p><strong>Dibuat oleh:</strong> {{ $generated_by }} | <strong>Tanggal:</strong> {{ $generated_at }}</p>
        <p><strong>Total Karyawan:</strong> {{ $employees->count() }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="6%">NIK</th>
                <th width="18%">Nama Lengkap</th>
                <th width="15%">Posisi</th>
                <th width="10%">Department</th>
                <th width="12%">Email</th>
                <th width="10%">Telepon</th>
                <th width="10%">Tgl Bergabung</th>
                <th width="15%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($employees as $index => $employee)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $employee->nik ?? '-' }}</td>
                <td>{{ $employee->full_name }}</td>
                <td>{{ $employee->position ?? '-' }}</td>
                <td>{{ $employee->user->department ?? '-' }}</td>
                <td style="font-size: 8px;">{{ $employee->user->email ?? '-' }}</td>
                <td>{{ $employee->phone ?? '-' }}</td>
                <td>{{ $employee->join_date ? \Carbon\Carbon::parse($employee->join_date)->format('d M Y') : '-' }}</td>
                <td>
                    @if($employee->employment_status === 'permanent')
                        <span class="badge badge-success">Tetap</span>
                    @elseif($employee->employment_status === 'contract')
                        <span class="badge badge-info">Kontrak</span>
                    @elseif($employee->employment_status === 'probation')
                        <span class="badge badge-warning">Probation</span>
                    @else
                        <span class="badge badge-info">Magang</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">Tidak ada data karyawan</td>
            </tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>Dokumen ini digenerate otomatis oleh Sistem Tracking Kerja - {{ now()->format('Y') }}</p>
    </div>
</body>
</html>
