import { PUBLIC_DISCORD_LINK } from '$env/static/public'
import { redirect } from '@sveltejs/kit'

export function load() {
	redirect(302, PUBLIC_DISCORD_LINK)
}
