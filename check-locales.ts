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

function findDuplicateKeysInJsonString(jsonString: string, fileName: string): string[] {
	const duplicates: string[] = []
	const lines = jsonString.split('\n')
	const objectStack: string[] = [] // Track current object path
	const keysInCurrentObject = new Map<string, { keys: Set<string>; lines: Map<string, number> }>()

	lines.forEach((line, lineIndex) => {
		const trimmedLine = line.trim()
		const lineNumber = lineIndex + 1

		// Check if we're opening a new object
		const objectMatch = line.match(/^\s*"([^"]+)"\s*:\s*\{/)
		if (objectMatch) {
			const objectName = objectMatch[1]
			objectStack.push(objectName)
			const objectPath = objectStack.join('.')
			keysInCurrentObject.set(objectPath, { keys: new Set(), lines: new Map() })
			return
		}

		// Check if we're closing an object
		if (trimmedLine === '},' || trimmedLine === '}') {
			objectStack.pop()
			return
		}

		// Check for key-value pairs
		const keyMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (keyMatch) {
			const key = keyMatch[1]
			const currentPath = objectStack.join('.')

			if (keysInCurrentObject.has(currentPath)) {
				const objData = keysInCurrentObject.get(currentPath)!
				if (objData.keys.has(key)) {
					const firstOccurrence = objData.lines.get(key)!
					duplicates.push(
						`${fileName}: Duplicate key "${key}" in object "${currentPath}" on lines ${firstOccurrence} and ${lineNumber}`,
					)
				} else {
					objData.keys.add(key)
					objData.lines.set(key, lineNumber)
				}
			}
		}
	})

	return duplicates
}

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

	// Check for duplicate keys in all locale files
	const allDuplicates: string[] = []
	const localeFiles = fs.readdirSync(LOCALE_DIR).filter((file) => file.endsWith('.json'))

	for (const localeFile of localeFiles) {
		const filePath = `${LOCALE_DIR}/${localeFile}`
		const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
		const duplicates = findDuplicateKeysInJsonString(fileContent, localeFile)
		allDuplicates.push(...duplicates)
	}

	if (allDuplicates.length > 0) {
		console.log('\nDuplicate keys found:\n')
		allDuplicates.forEach((dup) => console.log(dup))
	}

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

	if (missingTexts.length > 0 || unusedTexts.length > 0 || allDuplicates.length > 0) {
		process.exit(1)
	}
}

checkTranslations()
