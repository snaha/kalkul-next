/**
 * Exports data as a JSON file download
 * @param data - The data to export
 * @param filename - The filename for the download (without .json extension)
 */
export function exportToJson(data: unknown, filename: string): void {
	const jsonString = JSON.stringify(data, undefined, 2)
	const blob = new Blob([jsonString], { type: 'application/json' })
	const url = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = url
	link.download = `${filename}.json`
	document.body.appendChild(link)
	link.click()

	// Cleanup
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
