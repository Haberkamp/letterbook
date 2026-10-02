<?php

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;
use Letterbook\Letterbook\Support\StoryRegistry;

beforeEach(function () {
    View::addLocation(__DIR__.'/../fixtures');

    app(StoryRegistry::class)->add(
        'Welcome Email',
        fn () => (new TestWelcomeMail),
    );

    app(StoryRegistry::class)->add(
        'Password Reset',
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
        return new Content(htmlString: '<p>Welcome</p>', text: 'plain', with: ['content' => 'Welcome (plain)']);
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

it('sends the email to the given address', function () {
    Mail::fake();

    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->press('Send')
        ->type('input[name="email"]', 'jane@example.com')
        ->click('button[type="submit"]')
        ->wait(0.5);

    Mail::assertSent(TestWelcomeMail::class, fn (TestWelcomeMail $mail) => $mail->hasTo('jane@example.com'));
});

it('carries over the view mode query parameter when clicking a story link', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->press('Text')
        ->wait(0.3)
        ->assertQueryStringHas('mode', 'text')
        ->click('Password Reset')
        ->wait(0.3)
        ->assertUrlIs('*/letterbook/password-reset*')
        ->assertQueryStringHas('mode', 'text');
});


it('adds the search query to the URL when typing into the search bar', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->assertQueryStringMissing('q')
        ->type('[placeholder="Search stories..."]', 'welcome')
        ->assertQueryStringHas('q', 'welcome');
});

it('switches to the text view via the tabs', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->assertQueryStringMissing('mode')
        ->assertDontSee('Welcome (plain)')
        ->press('Text')
        ->wait(0.3)
        ->assertQueryStringHas('mode', 'text')
        ->assertSee('Welcome (plain)')
        ->press('HTML')
        ->wait(0.3)
        ->assertQueryStringMissing('mode')
        ->assertDontSee('Welcome (plain)');
});

it('switches the view mode by pressing t', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->assertQueryStringMissing('mode');
    $page->script("document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', code: 'KeyT', bubbles: true, cancelable: true }))");
    $page->wait(0.3)
        ->assertQueryStringHas('mode', 'text')
        ->assertSee('Welcome (plain)');
});

it('filters the stories when searching', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->assertSee('Welcome Email')
        ->assertSee('Password Reset')
        ->type('[placeholder="Search stories..."]', 'welcome')
        ->wait(0.3)
        ->assertSee('Welcome Email')
        ->assertDontSee('Password Reset');
});

it('shows the empty state when no stories match the search', function () {
    $page = visit('/letterbook');

    $page->assertNoJavascriptErrors();

    $page
        ->type('[placeholder="Search stories..."]', 'does-not-exist')
        ->wait(0.3)
        ->assertSee('No stories match your search.')
        ->assertDontSee('Welcome Email')
        ->assertDontSee('Password Reset');
});
