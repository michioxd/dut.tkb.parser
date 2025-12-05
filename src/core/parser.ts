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

export interface TKBType {
    id: string;
    name: string;
    instructor: string;
    time: {
        date: number;
        class: string;
        lsStart: number;
        lsEnd: number;
    }[];
    weekRange: {
        from: number;
        to: number;
    }[];
}

const global =
    /^(?:(\d+)\t)?(?:([A-Za-z0-9.^\t]+)\t)?([^\t]+)\t(?:[^\t]*\t){3}([^\t]+)\t((?:Thứ \d+|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),\d+-\d+,[^\t]+)\t([\d+-;]+)/;

const rgx = {
    id: /^(?=.*\d)(?=.*\.)[A-Za-z0-9.]+$/g,
    dates: /((?:Thứ \d+|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),\d+-\d+,[^\t;]+)/gm,
    date: /(?:Thứ (\d+)|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),(\d+)-(\d+),(.+)$/,
    weekRange: /(\d+)-(\d+)/,
    weeksRange: /[\d+-;]+/,
};

export default function Parser(s: string): TKBType | null {
    let id = "",
        name = "",
        instructor = "";
    const time: TKBType["time"] = [],
        weekRange: TKBType["weekRange"] = [];

    const match = global.exec(s);

    if (!match) return null;

    for (let i = 1; i < match.length; i++) {
        if (!match[i]) continue;

        const idMatch = match[i].match(rgx.id);
        if (!idMatch) continue;

        id = idMatch[0];
        name = match[i + 1];
        instructor = match[i + 2];

        const dateMatch = match[i + 3].match(rgx.dates);

        if (!dateMatch) continue;

        for (const date of dateMatch) {
            const dateArr = rgx.date.exec(date);

            if (!dateArr) continue;

            time.push({
                date: dateArr[1] ? parseInt(dateArr[1], 10) : 8,
                class: dateArr[4],
                lsStart: parseInt(dateArr[2]),
                lsEnd: parseInt(dateArr[3]),
            });
        }

        const weekRangeMatches = rgx.weeksRange.exec(match[i + 4]);

        if (!weekRangeMatches) continue;

        const weekRangeArr = weekRangeMatches[0].split(";");

        for (const weekRangeStr of weekRangeArr) {
            const weekRangeMatch = rgx.weekRange.exec(weekRangeStr);

            if (!weekRangeMatch) continue;

            weekRange.push({
                from: parseInt(weekRangeMatch[1]),
                to: parseInt(weekRangeMatch[2]),
            });
        }
        break;
    }

    return {
        id,
        name,
        instructor,
        time,
        weekRange,
    };
}
