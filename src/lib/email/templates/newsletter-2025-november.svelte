<!-- localization-exclude -->
<script lang="ts">
	import { Text } from 'svelte-email'
	import EmailCard from '../components/email-card.svelte'
	import EmailFooter from '../components/email-footer.svelte'
	import EmailHeader from '../components/email-header.svelte'
	import EmailLayout from '../components/email-layout.svelte'
	import { LAYOUT_STYLES, TYPOGRAPHY_STYLES } from '../utils/constants'
	import routes from '$lib/routes'
	import type { TemplateProps } from '../utils/render'
	import Container from '../components/container.svelte'
	import Section from '../components/section.svelte'
	import Button from '../components/button.svelte'
	import { PUBLIC_DISCORD_LINK, PUBLIC_ORIGIN } from '$env/static/public'
	import { _ } from 'svelte-i18n'

	let { origin = 'http://kalkul.app', template, language = 'cs' }: TemplateProps = $props()

	const viewLink = $derived(`${origin}${routes.EMAIL}?template=${template}`)
</script>

<EmailLayout
	{language}
	title={'Nová funkce cílů klienta + jaké další novinky můžete očekávat'}
	previewText={'Nová funkce cílů klienta + jaké další novinky můžete očekávat'}
>
	<EmailCard {viewLink}>
		<!-- Header -->
		<EmailHeader />

		<Text style={TYPOGRAPHY_STYLES.mainHeading}
			>Nová funkce cílů klienta + jaké další novinky můžete očekávat</Text
		>

		<Text style={TYPOGRAPHY_STYLES.introText}>
			Na Moneyfestu v Bratislavě jsme představili nové kalkulačky cílů klienta a teď se s vámi
			chceme podělit o to, co máme dál v produktovém plánu.
		</Text>

		<Section>
			<Container
				><img
					src={`${origin}/images/email/moneyfest-2025-november.png`}
					alt="Moneyfest 2025 Bratislava"
				/></Container
			>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Minulý měsíc jsme vzali aplikaci Kalkul na Moneyfest v Bratislavě, přední konferenci pro
			finanční poradce v Česku a na Slovensku, které se zúčastnilo více než 1 180 poradců.
			Představili jsme novou funkci cílů klienta, která je navržena tak, aby poradcům umožnila
			nejdříve získat komplexní pohled na portfolio, než se pustí do detailů samotných investic.
			Rozhovory s návštěvníky na místě byly neocenitelné. Poradci pokládali velmi konkrétní otázky,
			sdíleli reálné příklady z praxe a dali nám detailní zpětnou vazbu, díky které bude produkt
			ještě lepší. Na základě těchto poznatků funkci ladíme a během následujících týdnů ji
			zpřístupníme beta uživatelům.
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button
					href="https://moneyfest.cz/blog/kalkul-nastroj-ktery-dava-poradcum-skutecnou-svobodu/"
					style={LAYOUT_STYLES.buttonContainer}>Přečíst článek na blogu</Button
				>
				<Button
					href="https://www.youtube.com/watch?v=BvskjrBSRKQ"
					style={LAYOUT_STYLES.secondaryButtonContainer}>Podívat se na video</Button
				>
			</Container>
		</Section>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyTextCentered, fontWeight: 'bold' }}>
			A tím to nekončí. Tady je, co pro vás připravujeme dál:
		</Text>
		<Section>
			<Container
				><img
					src={`${origin}/images/email/roadmap-2025-november.png`}
					width="560"
					height="456"
					alt="Plán rozvoje"
				/></Container
			>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Náš produktový plán, postavený na zpětné vazbě poradců, přesně ukazuje, kam se aplikace Kalkul
			ubírá. Věříme v transparentnost, nejen pokud jde o klientská portfolia, ale i o to, jak
			aplikaci společně budujeme. Vidíte, na čem pracujeme, kdy to můžete čekat a proč je každá
			funkce důležitá pro vaši praxi. Dejte nám na <a href={PUBLIC_DISCORD_LINK}>Discordu</a> vědět,
			co by pro vás mělo největší přínos.
		</Text>

		<Text style={{ ...TYPOGRAPHY_STYLES.bodyTextCentered, fontWeight: 'bold' }}>
			Máte otázky nebo potřebujete pomoc se začátkem?
		</Text>

		<Text style={TYPOGRAPHY_STYLES.bodyText}>
			Ozvěte se našemu týmu na <a
				href={`mailto:support@kalkul.app?subject=${$_('email.templates.newsletter2025September.kalkulDemoRequest')}&body=${$_('email.templates.newsletter2025September.kalkulDemoRequestBody')}`}
				>support@kalkul.app</a
			> pro detailního průvodce šitého na míru vaší praxi. Odpovíme na vaše otázky a pomůžeme vám začít
			s jistotou.
		</Text>

		<Section style={LAYOUT_STYLES.buttonSection}>
			<Container>
				<Button
					href={`mailto:support@kalkul.app?subject=${$_('email.templates.newsletter2025September.kalkulDemoRequest')}&body=${$_('email.templates.newsletter2025September.kalkulDemoRequestBody')}`}
					style={LAYOUT_STYLES.buttonContainer}>Rezervovat demo hovor</Button
				>
				<Button href={PUBLIC_ORIGIN} style={LAYOUT_STYLES.secondaryButtonContainer}
					>Navštivte náš web</Button
				>
			</Container>
		</Section>

		<Text style={TYPOGRAPHY_STYLES.bodyTextCentered}>
			Děkujeme,<br />tým Kalkul.
		</Text>
		<Text style={TYPOGRAPHY_STYLES.bodyTextCentered}></Text>

		<Section>
			<Container
				><img
					src={`${origin}/images/email/moneyfest-team-2025-november.png`}
					alt="Tým Kalkul"
				/></Container
			>
		</Section>
	</EmailCard>
	<EmailFooter></EmailFooter>
</EmailLayout>
