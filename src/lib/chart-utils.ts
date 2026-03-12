import { getCSSVariableValue } from '$lib/css-vars'

/**
 * Draws a red line from the first exhaustion point to the end of the chart
 * @param ctx - Canvas rendering context
 * @param xAxis - Chart.js X axis scale
 * @param lineY - Y position for the line
 * @param firstErrorIndex - Index of the first exhaustion
 */
export function drawExhaustionLine(
  ctx: CanvasRenderingContext2D,
  xAxis: { getPixelForValue: (value: number) => number; right: number },
  lineY: number,
  firstErrorIndex: number,
) {
  const firstStartX = xAxis.getPixelForValue(firstErrorIndex)
  ctx.beginPath()
  ctx.moveTo(firstStartX, lineY)
  ctx.lineTo(xAxis.right, lineY)
  ctx.lineWidth = 4
  ctx.strokeStyle = getCSSVariableValue('--colors-red')
  ctx.stroke()
}

/**
 * Draws exclamation mark warning indicators on a chart at specified indices
 * @param ctx - Canvas rendering context
 * @param xAxis - Chart.js X axis scale
 * @param iconY - Y position for the center of the icon
 * @param errorIndices - Array of X-axis indices where warnings should be drawn
 */
export function drawExclamationMarks(
  ctx: CanvasRenderingContext2D,
  xAxis: { getPixelForValue: (value: number) => number },
  iconY: number,
  errorIndices: number[],
) {
  const redColor = getCSSVariableValue('--colors-red')
  const width = 32
  const height = 24
  const radius = 12

  for (const errorIndex of errorIndices) {
    const startX = xAxis.getPixelForValue(errorIndex)

    // Background
    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.roundRect(startX - width / 2, iconY - height / 2, width, height, radius)
    ctx.fill()

    // Triangle
    const triangleSize = 14
    const triangleY = iconY - 1
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.moveTo(startX, triangleY - triangleSize / 2)
    ctx.lineTo(startX - triangleSize / 2, triangleY + triangleSize / 2)
    ctx.lineTo(startX + triangleSize / 2, triangleY + triangleSize / 2)
    ctx.closePath()
    ctx.fill()

    // Exclamation line
    ctx.fillStyle = redColor
    ctx.fillRect(startX - 0.75, triangleY - 3, 1.5, 6)

    // Exclamation dot
    ctx.beginPath()
    ctx.arc(startX, triangleY + 5, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}
