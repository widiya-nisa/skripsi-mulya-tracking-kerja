<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #333; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #001f3f; padding-bottom: 15px; }
        .header h1 { font-size: 18px; color: #001f3f; margin-bottom: 5px; }
        .header p { font-size: 9px; color: #666; }
        .meta { margin-bottom: 15px; font-size: 9px; }
        .stats { display: flex; margin-bottom: 15px; }
        .stat-box { flex: 1; padding: 10px; margin-right: 10px; background-color: #f5f5f5; border-left: 3px solid #001f3f; }
        .stat-box:last-child { margin-right: 0; }
        .stat-box h3 { font-size: 10px; color: #666; margin-bottom: 5px; }
        .stat-box p { font-size: 16px; font-weight: bold; color: #001f3f; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #001f3f; color: white; padding: 8px; text-align: left; font-size: 9px; font-weight: bold; }
        td { border-bottom: 1px solid #ddd; padding: 6px 8px; font-size: 9px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: bold; }
        .badge-success { background-color: #4CAF50; color: white; }
        .badge-warning { background-color: #FF9800; color: white; }
        .badge-danger { background-color: #f44336; color: white; }
        .badge-info { background-color: #2196F3; color: white; }
        .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Periode: {{ $date_range }}</p>
    </div>
    <div class="meta">
        <p><strong>Dibuat oleh:</strong> {{ $generated_by }} | <strong>Tanggal:</strong> {{ $generated_at }}</p>
    </div>
    <div class="stats">
        <div class="stat-box">
            <h3>Total Cuti</h3>
            <p>{{ $stats['total'] }}</p>
        </div>
        <div class="stat-box">
            <h3>Pending</h3>
            <p>{{ $stats['pending'] }}</p>
        </div>
        <div class="stat-box">
            <h3>Disetujui</h3>
            <p>{{ $stats['approved'] }}</p>
        </div>
        <div class="stat-box">
            <h3>Ditolak</h3>
            <p>{{ $stats['rejected'] }}</p>
        </div>
        <div class="stat-box">
            <h3>Total Hari</h3>
            <p>{{ $stats['total_days'] }}</p>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="15%">Karyawan</th>
                <th width="10%">Jenis</th>
                <th width="10%">Mulai</th>
                <th width="10%">Selesai</th>
                <th width="5%">Hari</th>
                <th width="27%">Alasan</th>
                <th width="10%">Status</th>
                <th width="10%">Disetujui</th>
            </tr>
        </thead>
        <tbody>
            @forelse($leaves as $index => $leave)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $leave->user->name ?? '-' }}</td>
                <td>
                    @if($leave->type === 'annual') Tahunan
                    @elseif($leave->type === 'sick') Sakit
                    @elseif($leave->type === 'permission') Izin
                    @else Tanpa Gaji
                    @endif
                </td>
                <td>{{ \Carbon\Carbon::parse($leave->start_date)->format('d M Y') }}</td>
                <td>{{ \Carbon\Carbon::parse($leave->end_date)->format('d M Y') }}</td>
                <td style="text-align: center;">{{ $leave->days_count }}</td>
                <td>{{ Str::limit($leave->reason, 80) }}</td>
                <td>
                    @if($leave->status === 'approved')
                        <span class="badge badge-success">Disetujui</span>
                    @elseif($leave->status === 'pending')
                        <span class="badge badge-warning">Pending</span>
                    @elseif($leave->status === 'rejected')
                        <span class="badge badge-danger">Ditolak</span>
                    @else
                        <span class="badge badge-info">Dibatalkan</span>
                    @endif
                </td>
                <td style="font-size: 8px;">{{ $leave->approver->name ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">Tidak ada data cuti</td>
            </tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>Dokumen ini digenerate otomatis oleh Sistem Tracking Kerja - {{ now()->format('Y') }}</p>
    </div>
</body>
</html>
