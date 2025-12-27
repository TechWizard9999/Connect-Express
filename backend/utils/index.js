// Utils - helper functions

// convert time to minutes from midnight
function timeToMinutes(timeStr, day = 1) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + (day - 1) * 1440;
}

// add minutes to time, handles day overflow
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutes;
  let day = 1;
  while (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    day++;
  }
  const newHour = Math.floor(totalMinutes / 60);
  const newMin = totalMinutes % 60;
  return {
    time: `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`,
    day
  };
}

// calculate duration between two times
function calculateDuration(startTime, startDay, endTime, endDay) {
  const startMinutes = timeToMinutes(startTime, startDay);
  const endMinutes = timeToMinutes(endTime, endDay);
  if (startMinutes === null || endMinutes === null) return null;
  return endMinutes - startMinutes;
}

// format minutes as "Xh Ym"
function formatDuration(minutes) {
  if (minutes === null || minutes < 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// generate random train name
function generateTrainName() {
  const prefixes = ['Shatabdi', 'Rajdhani', 'Duronto', 'Garib Rath', 'Humsafar', 'Tejas', 'Vandebharat', 'Jan Shatabdi', 'Superfast', 'Mail', 'Express', 'Intercity', 'SF Express', 'Passenger'];
  const suffixes = ['Express', 'Special', 'Mail', '', '', ''];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return suffix ? `${prefix} ${suffix}` : prefix;
}

module.exports = { timeToMinutes, addMinutes, calculateDuration, formatDuration, generateTrainName };
