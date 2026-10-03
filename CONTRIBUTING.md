# Contributing

Thanks for considering a contribution to Letterbook!

## Getting Started

1. Fork the repository and clone your fork.
2. Install the PHP dependencies:

    ```bash
    composer install
    ```

3. Install the JS dependencies:

    ```bash
    npm install
    ```

## Development

Letterbook is a Laravel package built with [Orchestra Testbench](https://packages.tools/testbench). The package ships a workbench app you can use to try out changes locally.

- Build the frontend assets:

    ```bash
    npm run build
    ```

- Start the Vite dev server while working on the frontend:

    ```bash
    npm run dev
    ```

- Serve the workbench app:

    ```bash
    composer serve
    ```

## Tests

Run the test suite with Pest:

```bash
composer test
```

Add or update tests for any behavior change. Pure copy, styling, and layout-only changes do not require tests.

## Code Style

PHP code is formatted with [Laravel Pint](https://laravel.com/docs/pint) and analyzed with PHPStan. Run both before submitting:

```bash
composer lint
```

## Pull Requests

- Keep changes focused; one feature or fix per pull request.
- Describe what the change does and why it is needed.
- Make sure the test suite and lint pass before opening the PR.
