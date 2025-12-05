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

import { expect, test } from "vitest";
import Parser from "./parser";

test("Test with: 6	5070040.2420.24.99	Tiếng Nhật 2 (CNTT)	1			Trần Thị Kim Ngân	Thứ 2,4-5,C128; Thứ 4,4-5,C128; Thứ 6,4-5,C128	29-44", () => {
    expect(
        Parser(
            "6	5070040.2420.24.99	Tiếng Nhật 2 (CNTT)	1			Trần Thị Kim Ngân	Thứ 2,4-5,C128; Thứ 4,4-5,C128; Thứ 6,4-5,C128	29-44",
        ),
    ).toStrictEqual({
        id: "5070040.2420.24.99",
        name: "Tiếng Nhật 2 (CNTT)",
        instructor: "Trần Thị Kim Ngân",
        time: [
            {
                date: 2,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            },
            {
                date: 4,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            },
            {
                date: 6,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            },
        ],
        weekRangeFrom: 29,
        weekRangeTo: 44,
    });
});
