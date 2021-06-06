export function formatDuration(duration: number) {
  return `${duration >= 60 ? `${Math.floor(duration / 60)}hr ` : ""}${duration % 60}min`
}