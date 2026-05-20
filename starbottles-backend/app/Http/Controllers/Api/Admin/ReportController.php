<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Enquiry;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends BaseApiController
{
    // ── Helpers ──────────────────────────────────────────────────────────────

    private function parseDateRange(Request $request): array
    {
        $from = $request->input('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->subDays(30)->startOfDay();

        $to = $request->input('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }

    private function enquiriesData(Carbon $from, Carbon $to): array
    {
        $enquiries = Enquiry::whereBetween('received_at', [$from, $to])->get();

        $total       = $enquiries->count();
        $bySource    = $enquiries->groupBy('source')->map->count();
        $byStatus    = $enquiries->groupBy('status')->map->count();

        // Build daily counts
        $rawDaily = Enquiry::selectRaw(
            "DATE(received_at) as date, source, COUNT(*) as cnt"
        )
            ->whereBetween('received_at', [$from, $to])
            ->groupBy('date', 'source')
            ->orderBy('date')
            ->get();

        // Pivot: merge by date
        $byDate = [];
        foreach ($rawDaily as $row) {
            $d = $row->date;
            if (!isset($byDate[$d])) {
                $byDate[$d] = ['date' => $d, 'count' => 0, 'website' => 0, 'whatsapp' => 0, 'email' => 0];
            }
            $byDate[$d][$row->source] = (int) $row->cnt;
            $byDate[$d]['count']     += (int) $row->cnt;
        }

        return [
            'summary' => [
                'total'     => $total,
                'by_source' => [
                    'website'  => (int) ($bySource['website']  ?? 0),
                    'whatsapp' => (int) ($bySource['whatsapp'] ?? 0),
                    'email'    => (int) ($bySource['email']    ?? 0),
                ],
                'by_status' => [
                    'new'               => (int) ($byStatus['new']               ?? 0),
                    'contacted'         => (int) ($byStatus['contacted']         ?? 0),
                    'follow_up_pending' => (int) ($byStatus['follow_up_pending'] ?? 0),
                    'qualified_lead'    => (int) ($byStatus['qualified_lead']    ?? 0),
                    'closed_won'        => (int) ($byStatus['closed_won']        ?? 0),
                    'closed_lost'       => (int) ($byStatus['closed_lost']       ?? 0),
                ],
            ],
            'daily_counts' => array_values($byDate),
        ];
    }

    private function executiveData(Carbon $from, Carbon $to): array
    {
        $executives = User::active()->where('role', 'executive')->get();

        // All enquiries assigned to executives in range
        $enquiriesByExec = Enquiry::whereBetween('received_at', [$from, $to])
            ->whereNotNull('assigned_to')
            ->get()
            ->groupBy('assigned_to');

        $rows = $executives->map(function (User $exec) use ($enquiriesByExec) {
            $items = $enquiriesByExec->get($exec->id, collect());

            $assigned  = $items->count();
            $contacted = $items->where('status', 'contacted')->count();
            $qualified = $items->where('status', 'qualified_lead')->count();
            $won       = $items->where('status', 'closed_won')->count();
            $lost      = $items->where('status', 'closed_lost')->count();

            $withResponse = $items->filter(fn($e) => $e->first_action_at !== null);
            $avgMinutes   = $withResponse->count() > 0
                ? round(
                    $withResponse->avg(
                        fn($e) => $e->received_at->diffInMinutes($e->first_action_at)
                    )
                )
                : null;

            return [
                'executive_id'              => $exec->id,
                'executive_name'            => $exec->name,
                'assigned_count'            => $assigned,
                'contacted_count'           => $contacted,
                'qualified_count'           => $qualified,
                'closed_won'                => $won,
                'closed_lost'               => $lost,
                'avg_response_time_minutes' => $avgMinutes,
            ];
        });

        return $rows->sortByDesc('qualified_count')->values()->all();
    }

    private function productInterestData(Carbon $from, Carbon $to, int $limit): array
    {
        $mostViewed = ProductView::selectRaw('product_id, COUNT(*) as view_count')
            ->whereBetween('viewed_at', [$from, $to])
            ->groupBy('product_id')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->with('product.category')
            ->get()
            ->map(fn($v) => [
                'product_id' => $v->product_id,
                'title'      => $v->product->title ?? 'Unknown',
                'category'   => $v->product->category->name ?? null,
                'view_count' => (int) $v->view_count,
            ]);

        $mostEnquired = Enquiry::selectRaw('product_id, COUNT(*) as enquiry_count')
            ->whereBetween('received_at', [$from, $to])
            ->whereNotNull('product_id')
            ->groupBy('product_id')
            ->orderByDesc('enquiry_count')
            ->limit($limit)
            ->with('product.category')
            ->get()
            ->map(fn($e) => [
                'product_id'    => $e->product_id,
                'title'         => $e->product->title ?? 'Unknown',
                'category'      => $e->product->category->name ?? null,
                'enquiry_count' => (int) $e->enquiry_count,
            ]);

        return [
            'most_viewed'    => $mostViewed->values()->all(),
            'most_enquired'  => $mostEnquired->values()->all(),
        ];
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    public function enquiries(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);
        return $this->successResponse($this->enquiriesData($from, $to));
    }

    public function executivePerformance(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);
        return $this->successResponse($this->executiveData($from, $to));
    }

    public function productInterest(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);
        $limit = (int) $request->input('limit', 10);
        return $this->successResponse($this->productInterestData($from, $to, $limit));
    }

    public function export(Request $request): Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $request->validate([
            'report_type' => 'required|in:enquiries,executive,product',
            'format'      => 'required|in:csv,xlsx,pdf',
        ]);

        [$from, $to] = $this->parseDateRange($request);
        $type   = $request->input('report_type');
        $format = $request->input('format');

        $dateLabel = $from->format('Y-m-d') . '_to_' . $to->format('Y-m-d');
        $filename  = "{$type}_report_{$dateLabel}";

        if ($format === 'pdf') {
            $viewData = match ($type) {
                'enquiries' => ['data' => $this->enquiriesData($from, $to), 'from' => $from, 'to' => $to],
                'executive' => ['rows' => $this->executiveData($from, $to), 'from' => $from, 'to' => $to],
                'product'   => ['data' => $this->productInterestData($from, $to, 10), 'from' => $from, 'to' => $to],
            };
            $view = "exports.{$type}" . ($type === 'executive' ? '_performance' : ($type === 'product' ? '_interest' : ''));
            $pdf  = Pdf::loadView($view, $viewData)->setPaper('A4', 'landscape');
            return $pdf->download("{$filename}.pdf");
        }

        $rows = match ($type) {
            'enquiries' => $this->buildEnquiriesCsvRows($this->enquiriesData($from, $to)),
            'executive' => $this->buildExecutiveCsvRows($this->executiveData($from, $to)),
            'product'   => $this->buildProductCsvRows($this->productInterestData($from, $to, 10)),
        };

        $excelFormat = $format === 'xlsx'
            ? \Maatwebsite\Excel\Excel::XLSX
            : \Maatwebsite\Excel\Excel::CSV;

        return Excel::download(
            new \App\Exports\ArrayExport($rows),
            "{$filename}.{$format}",
            $excelFormat
        );
    }

    private function buildEnquiriesCsvRows(array $data): array
    {
        $rows   = [['Date', 'Total', 'Website', 'WhatsApp', 'Email']];
        foreach ($data['daily_counts'] as $day) {
            $rows[] = [$day['date'], $day['count'], $day['website'], $day['whatsapp'], $day['email']];
        }
        return $rows;
    }

    private function buildExecutiveCsvRows(array $data): array
    {
        $rows = [['Executive', 'Assigned', 'Contacted', 'Qualified', 'Won', 'Lost', 'Avg Response (min)']];
        foreach ($data as $row) {
            $rows[] = [
                $row['executive_name'],
                $row['assigned_count'],
                $row['contacted_count'],
                $row['qualified_count'],
                $row['closed_won'],
                $row['closed_lost'],
                $row['avg_response_time_minutes'] ?? 'N/A',
            ];
        }
        return $rows;
    }

    private function buildProductCsvRows(array $data): array
    {
        $rows = [['Rank', 'Product', 'Category', 'Views', 'Enquiries']];
        $viewed   = $data['most_viewed'];
        $enquired = $data['most_enquired'];
        $max      = max(count($viewed), count($enquired));
        for ($i = 0; $i < $max; $i++) {
            $v = $viewed[$i]   ?? [];
            $e = $enquired[$i] ?? [];
            $rows[] = [
                $i + 1,
                $v['title']       ?? '',
                $v['category']    ?? '',
                $v['view_count']  ?? '',
                $e['enquiry_count'] ?? '',
            ];
        }
        return $rows;
    }
}
