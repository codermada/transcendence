export function convertTime(createdAt?: string | Date | null) {
  if (!createdAt) return;

  const secondes = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000
  );

  if (secondes < 60) return { time: "minute", value: 0 };
  if (secondes < 3600) return { time: "minute", value: Math.floor(secondes / 60) };
  if (secondes < 86400) return { time: "hour", value: Math.floor(secondes / 3600) };
  return { time: "day", value: Math.floor(secondes / 86400) };
}
