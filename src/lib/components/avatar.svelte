<script lang="ts">
	import { createAvatar } from '@dicebear/core'
	import { initials } from '@dicebear/collection'

	type Props = {
		name: string
		birthDate: Date
		imageURI?: string
		size?: number
	}

	let { name, birthDate, imageURI, size = 40 }: Props = $props()

	const seed = $derived(`${name} ${Number(birthDate)}`)
	let avatar = $derived(
		createAvatar(initials, {
			seed,
			size,
			backgroundType: ['gradientLinear'],
			backgroundRotation: [45],
		}).toDataUri(),
	)
</script>

<img src={imageURI || avatar} alt="avatar" width={size} height={size} />
