/*
 * MIT License
 *
 * Copyright (c) 2025 michioxd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TKBType } from "./parser";
import timeRange from "./range";

export interface GoogleCalendarExportOptions {
    weekNumber: number;
    weekStartDate: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const parseInputDate = (date: string): Date => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const toIcsDateTime = (date: Date, hour: number, minute: number): string =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(hour)}${pad(minute)}00`;

const escapeIcsText = (text: string): string =>
    text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function createGoogleCalendarIcs(scheduleData: TKBType[], options: GoogleCalendarExportOptions): string {
    const baseDate = parseInputDate(options.weekStartDate);
    const now = toIcsDateTime(new Date(), new Date().getHours(), new Date().getMinutes());
    const events: string[] = [];

    for (const lesson of scheduleData) {
        for (const time of lesson.time) {
            const startLesson = timeRange.find((range) => range.lessonNumber === time.lsStart);
            const endLesson = timeRange.find((range) => range.lessonNumber === time.lsEnd);

            if (!startLesson || !endLesson) continue;

            for (const range of lesson.weekRange) {
                for (let currentWeek = range.from; currentWeek <= range.to; currentWeek++) {
                    const date = addDays(baseDate, (currentWeek - options.weekNumber) * 7 + (time.date - 2));
                    const dtStart = toIcsDateTime(date, startLesson.startTimeHour, startLesson.startTimeMin);
                    const dtEnd = toIcsDateTime(date, endLesson.endTimeHour, endLesson.endTimeMin);
                    const uid = `${lesson.id}-${currentWeek}-${time.date}-${time.lsStart}-${time.lsEnd}@dut.tkb.parser`;

                    events.push(
                        [
                            "BEGIN:VEVENT",
                            `UID:${uid}`,
                            `DTSTAMP:${now}`,
                            `DTSTART:${dtStart}`,
                            `DTEND:${dtEnd}`,
                            `SUMMARY:${escapeIcsText(lesson.name)}`,
                            `LOCATION:${escapeIcsText(time.class)}`,
                            `DESCRIPTION:${escapeIcsText(`Giảng viên: ${lesson.instructor}\nMã lớp: ${lesson.id}\nTuần: ${currentWeek}`)}`,
                            "END:VEVENT",
                        ].join("\r\n"),
                    );
                }
            }
        }
    }

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//dut.tkb.parser//VI",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        ...events,
        "END:VCALENDAR",
    ].join("\r\n");
}

export function downloadGoogleCalendarIcs(scheduleData: TKBType[], options: GoogleCalendarExportOptions): void {
    const blob = new Blob([createGoogleCalendarIcs(scheduleData, options)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `dut-tkb-google-calendar-${Date.now()}.ics`;
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
