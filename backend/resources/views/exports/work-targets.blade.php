<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #001f3f;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 18px;
            color: #001f3f;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 9px;
            color: #666;
        }
        .meta {
            margin-bottom: 15px;
            font-size: 9px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #001f3f;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }
        td {
            border-bottom: 1px solid #ddd;
            padding: 6px 8px;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-success { background-color: #4CAF50; color: white; }
        .badge-warning { background-color: #FF9800; color: white; }
        .badge-danger { background-color: #f44336; color: white; }
        .badge-info { background-color: #2196F3; color: white; }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #999;
        }
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

    <table>
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="15%">Karyawan</th>
                <th width="22%">Target Pekerjaan</th>
                <th width="15%">Manager</th>
                <th width="10%">Deadline</th>
                <th width="25%">Deskripsi</th>
                <th width="10%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($targets as $index => $target)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $target->assignedUser->name ?? '-' }}</td>
                <td>{{ $target->title }}</td>
                <td>{{ $target->manager->name ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($target->deadline)->format('d M Y') }}</td>
                <td>{{ Str::limit($target->description ?? '-', 80) }}</td>
                <td>
                    @if($target->status === 'completed')
                        <span class="badge badge-success">Selesai</span>
                    @elseif($target->status === 'in_progress')
                        <span class="badge badge-info">Progress</span>
                    @else
                        <span class="badge badge-warning">Pending</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data target kerja</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Dokumen ini digenerate otomatis oleh Sistem Tracking Kerja - {{ now()->format('Y') }}</p>
    </div>
</body>
</html>
