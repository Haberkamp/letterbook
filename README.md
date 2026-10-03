# Letterbook

A Storybook for Laravel emails — browse and preview your mailables with Inertia, React and Tailwind. Render each email's HTML and plain-text output, inspect subjects, and send test emails, all from a dedicated UI in your app.

## Installation

Install the package via Composer:

```bash
composer require nils/letterbook
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

| Key | Description | Default |
| --- | --- | --- |
| `path` | URL path where the Letterbook UI is served. | `letterbook` |
| `middleware` | Middleware applied to the Letterbook routes. | `['web']` |
| `stories` | Path to the file (or directory) where your email stories are defined. | `app_path('Mail/stories.php')` |
| `gate` | Gate name or closure to guard the UI. Return `false` to deny access. | `null` |

## Usage

Once installed, visit `/letterbook` (or your configured path) in your browser to browse your email stories. You can preview the rendered HTML and plain-text output of each mailable, and send the email to any address using the built-in send form.

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

Story files may also be plain functions that return mailables — see the API below for registering additional files.

### Grouping and Variants

Pass a `group` to organize stories in the sidebar, and add variants to show the same email in different states:

```php
$story = Letterbook::story('Invoice', fn () => new InvoiceMail($unpaidInvoice), group: 'Billing');

$story->variant('Paid', fn () => new InvoiceMail($paidInvoice));
```

### Restricting Access

Guard the UI behind a gate or closure in production:

```php
// config/letterbook.php
'gate' => 'viewLetterbook',

// or a closure
'gate' => fn ($request) => app()->environment('local'),
```

## API

### `Letterbook` Facade

The `Letterbook` facade (`Letterbook\Letterbook\Support\Facades\Letterbook`) is the main entry point for registering stories.

#### `story(string $title, Closure $mailable, ?string $group = null): Story`

Register an email story. The closure must return an instance of `Illuminate\Mail\Mailable`.

```php
Letterbook::story('Password Reset', fn () => new PasswordResetMail($token));
```

#### `stories(string $path): void`

Register a single PHP file containing story definitions, loaded lazily.

```php
Letterbook::stories(app_path('Mail/billing-stories.php'));
```

#### `storiesIn(string $path): void`

Register every PHP file in a directory as story files.

```php
Letterbook::storiesIn(app_path('Mail/Stories'));
```

### `Story`

A registered email story, returned by `Letterbook::story()`.

#### `description(string $description): static`

Attach a description shown in the UI.

#### `variant(string $title, Closure $mailable): Story`

Add a nested variant of the story (e.g. different states of the same email).

#### `variants(): array`

Get all variants of the story.

#### `slug(): string`

The URL-safe slug for the story, including any group prefix.

#### `depth(): int`

Nesting depth — `0` for top-level stories, higher for variants.

#### `resolve(): Mailable`

Resolve the story's closure to a mailable instance. Throws `InvalidArgumentException` if the closure does not return a `Mailable`.

#### `render(): RenderedEmail`

Render the mailable to HTML and plain text without sending it.

### `RenderedEmail`

The result of `Story::render()`.

- `html: string` — the rendered HTML body.
- `text: string` — the rendered plain-text body (empty if the mailable has no text view).
- `subject: string` — the subject from the mailable's envelope, falling back to a headline of the story title.

### Routes

| Method | URI | Name | Description |
| --- | --- | --- | --- |
| GET | `{path}` | `letterbook.index` | List stories and render the first one. |
| GET | `{path}/{slug}` | `letterbook.show` | Render a specific story. |
| POST | `{path}/{slug}/send` | `letterbook.send` | Send the story's mailable (expects an `email` field). |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Letterbook is open-sourced software licensed under the [MIT license](LICENSE.md).
