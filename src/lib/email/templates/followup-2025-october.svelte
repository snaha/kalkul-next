<!-- localization-exclude -->
<script lang="ts">
	import { Heading, Text } from 'svelte-email'
	import EmailCard from '../components/email-card.svelte'
	import EmailFooter from '../components/email-footer.svelte'
	import EmailHeader from '../components/email-header.svelte'
	import EmailLayout from '../components/email-layout.svelte'
	import { TYPOGRAPHY_STYLES } from '../utils/constants'
	import routes from '$lib/routes'
	import type { TemplateProps } from '../utils/render'

	let { origin = 'http://kalkul.app', template, language = 'cs' }: TemplateProps = $props()

	const viewLink = $derived(`${origin}${routes.EMAIL}?template=${template}`)
</script>

<EmailLayout
	{language}
	title={'Novinky v Kalkulu a pozvánka na MoneyFest SK 🚀'}
	previewText={'Novinky v Kalkulu a pozvánka na MoneyFest SK 🚀'}
>
	<EmailCard {viewLink}>
		<!-- Header -->
		<EmailHeader />

		<Text style={TYPOGRAPHY_STYLES.bodyText}>Dobrý den,</Text>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			přinášíme vám přehled nejnovějších aktualizací v Kalkulu, pozvánku na MoneyFest SK a možnost
			osobní konzultace, pokud byste chtěli appku využít naplno.
		</Text>

		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}>Novinky v Kalkulu</Heading>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyText, fontWeight: 'bold' }}>
			📈 Transakce očištěné o inflaci
		</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Nově můžete automaticky upravovat hodnotu každého nového výběru nebo vkladu tak, aby si udržel
			svou kupní sílu v čase. Ideální pro pravidelné transakce.
		</Text>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyText, fontWeight: 'bold' }}>
			💰 Vylepšené detaily transakcí
		</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Konzistentní zobrazení napříč aplikací – aby práce s portfolii byla ještě přehlednější.
		</Text>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyText, fontWeight: 'bold' }}>🚀 Průvodce začátkem</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Komplexní návod, jak zvládnout první kroky s Kalkulem najdete zde:
			<br />
			👉 <a href="https://kalkul.app/get-started">https://kalkul.app/get-started</a>
		</Text>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyText, fontWeight: 'bold' }}>👀 Ukázkové portfolio</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Vyzkoušejte si práci s Kalkulem na reálných datech ještě před importem vlastních klientů –
			dostupné přímo z <a href="https://kalkul.app">homepage</a>.
		</Text>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyText, fontWeight: 'bold' }}>
			💡 Přehlednější prostředí
		</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Přidali jsme vizuální indikátory načítání a opravili chyby v analytice.
		</Text>

		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}>Potkejte nás na MoneyFest SK!</Heading>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			🚀 Už 15. října se potkáme na konferenci <b>MoneyFest SK</b>. Na našem stánku vás čeká Meet &
			Greet s:
			<ul>
				<li><b>Markem Kubisem</b> – ambasadorem Kalkulu a poradcem s 12+ lety zkušeností,</li>
				<li><b>Vojtou Šimetkou</b> – zakladatelem Kalkulu a hlavou vývoje aplikace.</li>
			</ul>
			👉 Přijďte se podívat, jak Kalkul šetří čas při práci s klienty a sjednocuje portfolia napříč platformami.
			<br />
			📅 Rezervujte si krátkou schůzku:
			<ul>
				<li><a href="https://konferenciamoneyfest.sk/moneyfester/marek-kubis/">Marek Kubis</a></li>
				<li>
					<a href="https://konferenciamoneyfest.sk/moneyfester/vojtech-simetka/">Vojtěch Šimetka</a>
				</li>
			</ul>
			Těšíme se na osobní setkání! 💬
		</Text>

		<Heading style={TYPOGRAPHY_STYLES.sectionHeading}>🤝 Potřebujete pomoct s Kalkulem?</Heading>
		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Pokud vám něco není jasné, nebo byste chtěli probrat konkrétní funkce, nabízíme <b
				>osobní konzultaci – online i offline</b
			>. Stačí odpovědět na tento e-mail a domluvíme si termín.
		</Text>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Hezký den
			<br />
			<br />
			<b>Dominika Kubisová</b>
			<br />
			Kalkul
		</Text>
	</EmailCard>
	<EmailFooter></EmailFooter>
</EmailLayout>
