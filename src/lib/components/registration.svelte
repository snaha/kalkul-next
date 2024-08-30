<script lang="ts">
	import Button from './button.svelte'
	import Input from './input/input.svelte'
	import { z, type ZodFormattedError } from 'zod'
	import Typography from './typography.svelte'
	import adapter from '$lib/adapters'
	import { registerFormSchema } from '$lib/schemas'

	type User = z.infer<typeof registerFormSchema>

	interface Props {
		login: () => void
	}

	let { login }: Props = $props()
	let formErrors: ZodFormattedError<User> | undefined = $state()
	let formValid = $state(false)
	let error = $state('')

	let user: Partial<User> = $state({})
	async function register() {
		try {
			if (user.email && user.password) {
				await adapter.signUp(user.email, user.password)
				user.email = ''
				user.password = ''
				user.confirmPassword = ''
				login()
			}
		} catch (e) {
			error = (e as Error).message
		}
	}
	$effect(() => {
		const res = registerFormSchema.safeParse(user)
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

{#snippet confirmPasswordError()}
	{#if formErrors?.confirmPassword?._errors}
		{#each formErrors?.confirmPassword?._errors as error}
			{error}
		{/each}
	{/if}
{/snippet}

<div class="regitration">
	<div class="form">
		<Input
			bind:value={user.email}
			label="Email"
			error={formErrors?.email?._errors ? emailError : undefined}
		/>
		<Input
			bind:value={user.password}
			label="Password"
			error={formErrors?.password?._errors ? passwordError : undefined}
		/>
		<Input
			bind:value={user.confirmPassword}
			label="Confirm password"
			error={formErrors?.confirmPassword?._errors ? confirmPasswordError : undefined}
		/>
		<div class="buttons">
			<Button disabled={!formValid} onclick={register}>Log in</Button>
		</div>
	</div>
	<div class="signin">
		<Typography>Already have an account?</Typography><Button
			onclick={login}
			dimension="small"
			variant="ghost">Log in</Button
		>
	</div>
	{#if error}
		<div class="error">
			<Typography>{error}</Typography>
		</div>
	{/if}
</div>

<style>
	.regitration {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.signin {
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
