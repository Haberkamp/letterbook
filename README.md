# Letterbook

A better way to develop emails. Similar to Storybook, but for your Laravel mailables.

## Installation

Install the package via Composer:

```bash
composer require haberkamp/letterbook
```

Publish the config file:

```bash
php artisan vendor:publish --tag=letterbook-config
```

Publish the built frontend assets:

```bash
php artisan vendor:publish --tag=letterbook-assets
```

## Configuration

The published `config/letterbook.php` file contains the following options:

```php
return [
    // URL path where the Letterbook UI is served.
    'path' => env('LETTERBOOK_PATH', 'letterbook'),

    // Middleware applied to the Letterbook routes.
    'middleware' => ['web'],

    // Path to the file (or directory) where your email stories are defined.
    'stories' => app_path('Mail/stories.php'),

    // Gate name or closure to guard the UI. Return false to deny access.
    'gate' => null,
];
```

## Usage

Once installed, visit `/letterbook` (or your configured path) in your browser to browse your email stories. You can preview the rendered HTML and plain-text output of each mailable and send the email to any address using the built-in send form.

### Defining Stories

Register your mailables as stories in the file configured via `letterbook.stories` (defaults to `app/Mail/stories.php`):

```php
<?php

use App\Mail\OrderShipped;
use App\Mail\WelcomeEmail;
use Letterbook\Letterbook\Support\Facades\Letterbook;

Letterbook::story('Welcome Email', fn () => new WelcomeEmail(user: $user))
    ->description('Sent after a user registers.');

Letterbook::story('Order Shipped', fn () => new OrderShipped($order), group: 'Orders');
```

### Grouping and Variants

Pass a `group` to organize stories in the sidebar and add variants to show the same email in different states:

```php
$story = Letterbook::story('Invoice', fn () => new InvoiceMail($unpaidInvoice), group: 'Billing');

$story->variant('Paid', fn () => new InvoiceMail($paidInvoice));
```

### Restricting Access

Guard the UI behind a closure in production:

```php
// config/letterbook.php
'gate' => fn ($request) => app()->environment('local'),
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Letterbook is open-sourced software licensed under the [MIT license](LICENSE.md).
