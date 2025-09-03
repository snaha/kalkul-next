<script>
	import Section from './section.svelte'
	import Container from './container.svelte'
	import { LAYOUT_STYLES } from '../utils/constants'
</script>

<Section style={LAYOUT_STYLES.headerSection}>
	<Container>
		<!-- Kalkul Logo - using the official logo SVG -->
		<img
			alt="logo"
			src="https://kalkul.app/images/icons/icon-192.png"
			srcset="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkxXzcpIj4KPHBhdGggZD0iTTcgMTZMMTMgMjdWMTZWNUw3IDE2WiIgZmlsbD0iIzE5MTkxOSIvPgo8cGF0aCBkPSJNMjUgNUgxOUwxMyAxNkwxOSAyN0gyNUwxOSAxNkwyNSA1WiIgZmlsbD0iIzE5MTkxOSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkxXzciPgo8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3IDUpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg== 1x"
			width="96"
			height="96"
		/>
	</Container>
</Section>
