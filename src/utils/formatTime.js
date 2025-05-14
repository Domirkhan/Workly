export const formatTime = (hours) => {
  if (!hours && hours !== 0) return '0ч 0м';
  
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  return `${h}ч ${m}м`;
};