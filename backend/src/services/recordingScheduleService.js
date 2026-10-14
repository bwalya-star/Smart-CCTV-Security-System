function getLocalDateTime(timeZone, date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const weekdayIndexes = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
        weekday: weekdayIndexes[values.weekday],
        date: `${values.year}-${values.month}-${values.day}`,
        minuteOfDay: Number(values.hour) * 60 + Number(values.minute)
    };
}

function getPreviousDateKey(dateKey) {
    const date = new Date(`${dateKey}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

function getScheduleWindow(schedule, now = new Date()) {
    if (!schedule?.enabled || !schedule.days.length) {
        return null;
    }

    const local = getLocalDateTime(schedule.timeZone, now);
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (start < end && local.minuteOfDay >= start && local.minuteOfDay < end &&
        schedule.days.includes(local.weekday)) {
        return { key: local.date };
    }

    if (start > end) {
        if (local.minuteOfDay >= start && schedule.days.includes(local.weekday)) {
            return { key: local.date };
        }

        const previousDay = (local.weekday + 6) % 7;
        if (local.minuteOfDay < end && schedule.days.includes(previousDay)) {
            return { key: getPreviousDateKey(local.date) };
        }
    }

    return null;
}

module.exports = { getScheduleWindow };
