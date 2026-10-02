<?php

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Letterbook\Letterbook\Support\StoryRegistry;

beforeEach(function () {
    app(StoryRegistry::class)->add(
        'Welcome Email',
        fn () => (new TestWelcomeMail),
    );
});

class TestWelcomeMail extends Mailable
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome');
    }

    public function content(): Content
    {
        return new Content(htmlString: '<p>Welcome</p>');
    }
}

it('focuses the search after clearing it via the keyboard', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->type('[placeholder="Search stories..."]', 'welcome')
        ->assertVisible('button[aria-label="Clear search"]')
        // Shift+Tab moves focus from the search input to the clear
        // button, and Enter activates it from the keyboard
        // (event.detail === 0).
        ->keys('[placeholder="Search stories..."]', 'Shift+Tab')
        ->keys('button[aria-label="Clear search"]', 'Enter')
        ->assertScript("document.activeElement.placeholder === 'Search stories...'");
});

it('does not focus the search after clearing it via the mouse', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->type('[placeholder="Search stories..."]', 'welcome')
        ->click('button[aria-label="Clear search"]')
        ->assertScript("document.activeElement.placeholder !== 'Search stories...'");
});

it('focuses the search when pressing command + k', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->assertScript("document.activeElement.placeholder !== 'Search stories...'");
    $page->script("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', keyCode: 75, metaKey: true, bubbles: true, cancelable: true }))");
    $page->wait(0.2)
        ->assertScript("document.activeElement.placeholder === 'Search stories...'");
});
