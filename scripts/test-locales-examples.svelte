<!-- prettier-ignore-file -->
<!-- localization-test-file -->
<!-- This file contains examples of hardcoded text that should be caught by check-locales -->

<script>
	/* eslint-disable */
	// Code snippets that should NOT be caught - they're in script tags
	let message = 'This is code'
	const result = someFunction()
	let formErrors: ZodFormattedError
	let plugins: Plugin | undefined = undefined
	const props = $props()
	if (value > 0 && index < 10) {
		// do something
	}
	/* eslint-enable */
</script>

<!-- Examples that SHOULD be caught -->
<!-- eslint-disable -->

<!-- 1. Simple text between tags -->
<p>This should be localized</p>

<!-- 2. Text with uppercase start -->
<span>Hello World</span>

<!-- 3. Text with punctuation -->
<div>Welcome to our app!</div>

<!-- 4. Text starting with arrow symbol -->
<Typography
	>→ New to Kalkul? We recommend checking our quick start guide. You'll find everything you need to
	get started.</Typography
>

<!-- 5. Text in button -->
<Button>Check out our quick start guide</Button>

<!-- 5b. Text after self-closing component (like in help-modal.svelte) -->
<Button><Rocket size={24} />Check out our quick start guide</Button>

<!-- 6. Text with mixed case -->
<h1>Getting Started Guide</h1>

<!-- 7. Text with numbers -->
<span>You have 5 new messages</span>

<!-- 8. Text in attributes that should be caught -->
<input placeholder="Enter your name" />
<img alt="User avatar" />
<div title="Click here for help"></div>

<!-- 9. Copyright text -->
<footer>© 2025 Company Name</footer>

<!-- 10. Text inside Svelte if blocks (like inflation-badge.svelte) -->
<Badge
	><Growth size={16} />{#if showText}Inflation adjusted{/if}</Badge
>

<!-- Examples that should NOT be caught -->

<!-- Single words without context -->
<span>OK</span>
<span>beta</span>
<span>Discord</span>

<!-- HTML entities -->
<span>&nbsp;</span>
<span>&amp;</span>

<!-- Template expressions -->
<span>{$_('some.key')}</span>
<span>{someVariable}</span>

<!-- URLs and emails -->
<a href="https://example.com">link</a>
<span>user@example.com</span>

<!-- File paths -->
<span>/path/to/file</span>

<!-- Numbers and percentages -->
<span>123</span>
<span>45.6%</span>

<!-- Color codes -->
<span>#FF0000</span>
