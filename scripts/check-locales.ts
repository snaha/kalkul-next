import fs from 'fs'

const SOURCE_DIR = 'src'
const LOCALE_DIR = `${SOURCE_DIR}/lib/locales`
const DEFAULT_LOCALE = 'cs'

// Patterns for detecting hardcoded user-facing text (generic Unicode patterns)
const HARDCODED_TEXT_PATTERNS = [
	// Text between HTML/Svelte tags that starts with uppercase letter and contains spaces
	{
		pattern: />(\p{Lu}\p{L}*(?:\s+\p{L}+)*[\s,.'!?„"]*)</gu,
		description: 'Text content between HTML tags',
	},
	// Hardcoded strings in user-facing attributes
	{
		pattern: /(?:placeholder|title|alt)=["'](\p{Lu}[\p{L}\s,.'!?„"]{2,})["']/gu,
		description: 'Hardcoded text in HTML attributes',
	},
	// Direct text content that might be user-facing (like "Made with")
	{
		pattern: /(?<!\/\/\s*)(?<!\*\s+)(\p{Lu}\p{L}*(?:\s+\p{L}+)*)\s+<a/gu,
		description: 'Text followed by links (like "Made with <a>")',
	},
]

// Text patterns to exclude (technical terms, single words, etc.)
const EXCLUDE_PATTERNS = [
	/^(OK|ID|API|URL|HTML|CSS|JS|TS|JSON|XML|HTTP|HTTPS|UTC|GMT|PDF|CSV|USD|EUR|CZK|GBP)$/i,
	/^\p{Lu}{2,4}$/u, // Acronyms (any uppercase letters)
	/^\d+$/, // Pure numbers
	/^\p{Ll}+$/u, // Single lowercase words (likely technical)
	/^[\w.-]+@[\w.-]+$/, // Email addresses
	/^https?:\/\//, // URLs
	/^\/[/\w-]*$/, // File paths
	/^#[0-9a-fA-F]{3,8}$/, // Color codes
	/^[\d.]+%$/, // Percentages
	/^[\d.,]+$/, // Numbers with formatting
]

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

		// First, find simple $_('key') patterns
		const simpleTexts = file.matchAll(/\$_\([\s]*'(.*?)'/gim)
		for (const localizedText of simpleTexts) {
			if (!localizedTextSet.has(localizedText[1])) {
				localizedTextSet.add(localizedText[1])
			}
		}

		// Check for $_() calls with logic instead of simple string literals
		const logicInLocalizationCalls = file.matchAll(/\$_\(\s*([^'"][^)]*)\s*\)/gim)
		for (const match of logicInLocalizationCalls) {
			const content = match[1].trim()
			// Skip if it's just a simple variable or object access without operators
			if (
				content.includes('?') ||
				content.includes(':') ||
				content.includes('&&') ||
				content.includes('||')
			) {
				console.log(`⚠️  Logic detected in $_() call in ${filePath}: ${match[0]}`)
			}
		}
	})
	return localizedTextSet
}

function scanForHardcodedText() {
	const hardcodedTextFound: Array<{ file: string; text: string; pattern: string; line?: number }> =
		[]

	const filenames = fs.readdirSync(SOURCE_DIR, { recursive: true })
	filenames.forEach((filename) => {
		const filePath = `${SOURCE_DIR}/${filename}`
		const stat = fs.statSync(filePath)
		if (stat.isDirectory()) {
			return
		}

		// Only check .svelte files for hardcoded text
		if (!filePath.endsWith('.svelte')) {
			return
		}

		const file = fs.readFileSync(filePath, { encoding: 'utf8' })
		const lines = file.split('\n')

		// Check if file has exclusion comment in the first line
		if (lines[0] && lines[0].trim().startsWith('<!-- localization-exclude -->')) {
			return
		}

		// Check each pattern
		HARDCODED_TEXT_PATTERNS.forEach(({ pattern, description }) => {
			const regex = new RegExp(pattern.source, pattern.flags)
			let match

			while ((match = regex.exec(file)) !== null) {
				// Extract the actual text content (usually in capture group 1 or 2)
				const textContent = match[2] || match[1]
				if (!textContent) continue

				// Skip if text matches any exclude pattern
				const shouldExclude = EXCLUDE_PATTERNS.some((excludePattern) =>
					excludePattern.test(textContent.trim()),
				)
				if (shouldExclude) continue

				// Skip very short text or single words without spaces
				if (textContent.trim().length < 3 || !textContent.includes(' ')) {
					// Allow some exceptions like "BETA", "OK", etc. that are commonly translated
					const commonTranslatables = [
						'BETA',
						'OK',
						'Cancel',
						'Save',
						'Delete',
						'Edit',
						'New',
						'Close',
					]
					if (!commonTranslatables.includes(textContent.trim())) {
						continue
					}
				}

				// Find line number
				const beforeMatch = file.substring(0, match.index)
				const lineNumber = beforeMatch.split('\n').length

				hardcodedTextFound.push({
					file: filePath,
					text: textContent.trim(),
					pattern: description,
					line: lineNumber,
				})
			}
		})
	})

	return hardcodedTextFound
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

	// Check for hardcoded user-facing text
	const hardcodedText = scanForHardcodedText()

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

	if (hardcodedText.length > 0) {
		console.log('\nPotential hardcoded user-facing text found:\n')
		hardcodedText.forEach((item) => {
			console.log(`${item.file}:${item.line} - "${item.text}" (${item.pattern})`)
		})
	}

	if (
		missingTexts.length > 0 ||
		unusedTexts.length > 0 ||
		allDuplicates.length > 0 ||
		hardcodedText.length > 0
	) {
		process.exit(1)
	}
}

checkTranslations()
