<?php

return [
    'path' => env('LETTERBOOK_PATH', 'letterbook'),

    'middleware' => ['web'],

    // Path to the file where email stories are defined.
    'stories' => app_path('Mail/stories.php'),

    // Guard the letterbook UI behind a gate/permission or closure. Return false to deny.
    'gate' => null,
];
