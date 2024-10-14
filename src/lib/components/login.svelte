<script lang="ts">
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import adapter from '$lib/adapters'
	import Typography from '$lib/components/ui/typography.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import { loginFormSchema } from '$lib/schemas'

	type User = z.infer<typeof loginFormSchema>

	interface Props {
		register: () => void
	}

	let { register }: Props = $props()
	let email = $state('')
	let password = $state('')
	let error = $state('')
	let formErrors: ZodFormattedError<User> | undefined = $state(undefined)
	let formValid = $state(false)
	async function login() {
		try {
			await adapter.signIn(email, password)
			email = ''
			password = ''
		} catch (e) {
			error = (e as Error).message
		}
	}
	$effect(() => {
		const res = loginFormSchema.safeParse({ email, password })
		if (res.success) {
			formErrors = undefined
			formValid = true
		} else {
			formErrors = res.error.format()
			formValid = false
		}
	})
</script>

{#snippet emailError()}
	{#if formErrors?.email?._errors}
		{#each formErrors?.email?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

{#snippet passwordError()}
	{#if formErrors?.password?._errors}
		{#each formErrors?.password?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

<div class="login">
	<div class="login-form">
		<Input
			bind:value={email}
			label="Email"
			type="email"
			error={formErrors?.email?._errors ? emailError : undefined}
		></Input>
		<Input
			bind:value={password}
			type="password"
			label="Password"
			error={formErrors?.password?._errors ? passwordError : undefined}
		></Input>
		<div class="buttons">
			<Button disabled={!formValid} onclick={login}>Log in</Button>
		</div>
	</div>
	<div class="register">
		<Typography>No account yet?</Typography><Button
			onclick={register}
			dimension="small"
			variant="ghost">Register</Button
		>
	</div>
	{#if error}
		<div class="error">
			<Typography>{error}</Typography>
		</div>
	{/if}
</div>

<style>
	.login {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-bottom: 2rem;
	}
	.register {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.error {
		border-radius: 0.25rem;
		background-color: #f8d7da;
		padding: 0.5rem;
	}
</style>
