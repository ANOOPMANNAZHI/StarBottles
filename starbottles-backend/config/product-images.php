<?php

return [
    'sizes' => [
        'thumb'    => ['width' => 150,  'height' => 150,  'fit' => 'cover'],
        'card'     => ['width' => 400,  'height' => 300,  'fit' => 'contain'],
        'detail'   => ['width' => 800,  'height' => 600,  'fit' => 'contain'],
        'original' => ['width' => 1200, 'height' => 900,  'fit' => 'contain'],
    ],

    'format'  => 'webp',
    'quality' => 80,

    'storage_path' => 'products',

    'max_images_per_product' => 4,
];
