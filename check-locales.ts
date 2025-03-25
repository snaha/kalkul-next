import fs from 'fs'

const SOURCE_DIR = 'src'
const LOCALE_DIR = `${SOURCE_DIR}/lib/locales`
const DEFAULT_LOCALE = 'cs'

function scanSourceFiles() {
	const localizedTextSet = new Set<string>()

	const filenames = fs.readdirSync(SOURCE_DIR, { recursive: true })
	filenames.forEach((filename) => {
		const filePath = `${SOURCE_DIR}/${filename}`
		const stat = fs.statSync(filePath)
		if (stat.isDirectory()) {
			return
		}

		const file = fs.readFileSync(filePath, { encoding: 'utf8' })
		const localizedTexts = file.matchAll(/\$_\('(.*?)'/gi)
		for (const localizedText of localizedTexts) {
			if (!localizedTextSet.has(localizedText[1])) {
				localizedTextSet.add(localizedText[1])
			}
		}
	})
	return localizedTextSet
}

type Json = { [property: string]: Json }

function readLocaleData(locale: string): Json {
	const data = fs.readFileSync(`${LOCALE_DIR}/${locale}.json`, { encoding: 'utf8' })
	const localeData = JSON.parse(data)
	return localeData
}

function flattenLocale(json: Json): string[] {
	const localeTexts: string[] = []
	const keys = Object.keys(json)
	keys.forEach((key) => {
		if (typeof json[key] === 'string') {
			localeTexts.push(key)
		} else if (typeof json[key] === 'object') {
			const texts = flattenLocale(json[key]).map((text) => `${key}.${text}`)
			localeTexts.push(...texts)
		}
	})
	return localeTexts
}

function checkRecursively(text: string, keys: Json): boolean {
	if (keys[text]) {
		return true
	}
	const parts = text.split('.')
	if (parts.length === 0) {
		return false
	}

	const key = parts[0]
	if (keys[key]) {
		const rest = [...parts].slice(1).join('.')
		return checkRecursively(rest, keys[key])
	}

	return false
}

function checkTranslations() {
	const locale = process.argv[2] || DEFAULT_LOCALE
	const localizedTextSet = scanSourceFiles()
	const localeData = readLocaleData(locale)

	const missingTexts: string[] = []
	for (const localizedText of localizedTextSet) {
		if (!checkRecursively(localizedText, localeData)) {
			missingTexts.push(localizedText)
		}
	}

	if (missingTexts.length > 0) {
		console.log('\nMissing texts:\n')
		missingTexts.forEach((text) => console.log(`'${text}'`))
	}

	const unusedTexts: string[] = []
	const localeTexts = flattenLocale(localeData)
	for (const localeText of localeTexts) {
		if (!localizedTextSet.has(localeText)) {
			unusedTexts.push(localeText)
		}
	}

	if (unusedTexts.length > 0) {
		console.log('\nUnused texts:\n')
		unusedTexts.forEach((text) => console.log(`'${text}'`))
	}

	if (missingTexts.length > 0 || unusedTexts.length > 0) {
		process.exit(1)
	}
}

checkTranslations()
