<?php

return [
    'base_url'            => env('ERP_BASE_URL', ''),
    'api_key'             => env('ERP_API_KEY', ''),
    'api_secret'          => env('ERP_API_SECRET', ''),
    'company'             => env('ERP_COMPANY', 'Star Bottles'),
    'use_mock'            => env('ERP_USE_MOCK', true),
    'mock_file'           => storage_path('app/mock_erp_products.json'),
    'mock_groups_file'    => storage_path('app/mock_erp_item_groups.json'),
    'sync_interval_hours' => env('ERP_SYNC_INTERVAL', 6),
    'page_size'           => env('ERP_PAGE_SIZE', 100),

    'endpoints' => [
        'items'       => '/api/method/sabco.website.api.items.get_items',
        'item_groups' => '/api/method/sabco.website.api.items.get_item_groups',
    ],

    'field_map' => [
        'erp_id'         => 'item_code',
        'item_code'      => 'item_code',
        'title'          => 'item_name',
        'description'    => 'description',
        'brand'          => 'brand',
        'stock_uom'      => 'stock_uom',
        'classification' => 'classification',
        'image_url'      => 'image',
        'neck_size'      => 'neck_size',
        'shape_type'     => 'shape',
        'material'       => 'moc',
        'capacity'       => 'custom_volume',
        'color'          => 'color',
        'weight'         => 'weight',
        'total_height'   => 'total_height',
        'box_quantity'     => 'box_quantity',
        'label_area'       => 'label_area',
        'retail_price'     => 'retail_price',
        'wholesale_price'  => 'wholesale_price',
    ],
];
