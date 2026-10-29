export default function formatTime(seconds) {
  const total = Math.floor(seconds || 0);
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}
