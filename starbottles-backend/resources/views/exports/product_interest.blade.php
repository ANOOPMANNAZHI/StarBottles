<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; font-size: 12px; color: #222; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #666; margin-bottom: 16px; }
  h2 { font-size: 14px; margin: 16px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f0f0f0; padding: 6px 8px; text-align: left; border: 1px solid #ccc; font-size: 11px; }
  td { padding: 5px 8px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .cols { display: table; width: 100%; }
  .col { display: table-cell; width: 50%; vertical-align: top; padding-right: 12px; }
</style>
</head>
<body>
  <h1>Product Interest Report</h1>
  <p class="sub">{{ $from->format('d M Y') }} — {{ $to->format('d M Y') }}</p>

  <h2>Most Viewed Products</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Product</th><th>Category</th><th>Views</th></tr>
    </thead>
    <tbody>
      @foreach($data['most_viewed'] as $i => $item)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $item['title'] }}</td>
        <td>{{ $item['category'] ?? '—' }}</td>
        <td>{{ $item['view_count'] }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <h2>Most Enquired Products</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Product</th><th>Category</th><th>Enquiries</th></tr>
    </thead>
    <tbody>
      @foreach($data['most_enquired'] as $i => $item)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $item['title'] }}</td>
        <td>{{ $item['category'] ?? '—' }}</td>
        <td>{{ $item['enquiry_count'] }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
