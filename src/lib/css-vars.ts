export function getCSSVariableValue(name: string) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name)
}
