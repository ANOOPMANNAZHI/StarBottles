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
  .summary { display: flex; gap: 24px; margin-bottom: 16px; }
  .stat { background: #f5f5f5; border-radius: 4px; padding: 8px 16px; }
  .stat-val { font-size: 20px; font-weight: bold; }
  .stat-lbl { font-size: 10px; color: #666; }
</style>
</head>
<body>
  <h1>Enquiry Report</h1>
  <p class="sub">{{ $from->format('d M Y') }} — {{ $to->format('d M Y') }}</p>

  <div class="summary">
    <div class="stat">
      <div class="stat-val">{{ $data['summary']['total'] }}</div>
      <div class="stat-lbl">Total Enquiries</div>
    </div>
    <div class="stat">
      <div class="stat-val">{{ $data['summary']['by_source']['website'] }}</div>
      <div class="stat-lbl">Website</div>
    </div>
    <div class="stat">
      <div class="stat-val">{{ $data['summary']['by_source']['whatsapp'] }}</div>
      <div class="stat-lbl">WhatsApp</div>
    </div>
    <div class="stat">
      <div class="stat-val">{{ $data['summary']['by_source']['email'] }}</div>
      <div class="stat-lbl">Email</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Total</th>
        <th>Website</th>
        <th>WhatsApp</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      @foreach($data['daily_counts'] as $day)
      <tr>
        <td>{{ $day['date'] }}</td>
        <td>{{ $day['count'] }}</td>
        <td>{{ $day['website'] }}</td>
        <td>{{ $day['whatsapp'] }}</td>
        <td>{{ $day['email'] }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
