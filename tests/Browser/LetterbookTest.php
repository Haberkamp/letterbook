<?php

it('renders the letterbook SPA', function () {
    $page = visit('/letterbook');

    $page
        ->assertSee('Letterbook')
        ->assertNoJavascriptErrors();
});
