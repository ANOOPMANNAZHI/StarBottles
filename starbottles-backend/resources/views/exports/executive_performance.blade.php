<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; font-size: 12px; color: #222; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #f0f0f0; padding: 6px 8px; text-align: left; border: 1px solid #ccc; font-size: 11px; }
  td { padding: 5px 8px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background: #f9f9f9; }
</style>
</head>
<body>
  <h1>Executive Performance Report</h1>
  <p class="sub">{{ $from->format('d M Y') }} — {{ $to->format('d M Y') }}</p>

  <table>
    <thead>
      <tr>
        <th>Executive</th>
        <th>Assigned</th>
        <th>Contacted</th>
        <th>Qualified Leads</th>
        <th>Closed Won</th>
        <th>Closed Lost</th>
        <th>Avg Response (min)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($rows as $row)
      <tr>
        <td>{{ $row['executive_name'] }}</td>
        <td>{{ $row['assigned_count'] }}</td>
        <td>{{ $row['contacted_count'] }}</td>
        <td>{{ $row['qualified_count'] }}</td>
        <td>{{ $row['closed_won'] }}</td>
        <td>{{ $row['closed_lost'] }}</td>
        <td>{{ $row['avg_response_time_minutes'] ?? 'N/A' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
