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

import { Box, Button, Card, Checkbox, Container, Flex, Link, Text, TextArea, TextField } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import Parser, { TKBType } from "./core/parser";
import timeRange from "./core/range";
import html2canvas from "html2canvas-pro";
import tbCls from "./table.module.scss";
import NextLession from "./components/NextLesson";

export default function App() {
    const [byWeek, setByWeek] = useState(localStorage.getItem('byWeek') === 'true' || false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(localStorage.getItem('showOnlyAvailable') === 'true' || false);
    const [week, setWeek] = useState(localStorage.getItem('week') ? Number(localStorage.getItem('week')) : 0);
    const [data, setData] = useState(localStorage.getItem('data') || '');
    const tableRef = useRef<HTMLTableElement>(null);

    useEffect(() => {
        localStorage.setItem('data', data);
    }, [data]);

    useEffect(() => {
        localStorage.setItem('byWeek', byWeek.toString());
    }, [byWeek]);

    useEffect(() => {
        localStorage.setItem('showOnlyAvailable', showOnlyAvailable.toString());
    }, [showOnlyAvailable]);

    useEffect(() => {
        localStorage.setItem('week', week.toString());
    }, [week]);

    const scheduleData = useMemo<TKBType[]>(() => {
        const d: TKBType[] = [];
        data.replace(/\r\n/g, "\n").split('\n').map((line) => {
            if (line === '') return null;

            const parser = Parser(line);
            if (parser) {
                d.push(parser);
            }
        });

        return d;
    }, [data]);

    const dt = useMemo(() => (
        <>
            {timeRange.filter((tra) => !showOnlyAvailable || scheduleData.some(d =>
                d.time.some(t => t.lsStart <= tra.lessonNumber && t.lsEnd >= tra.lessonNumber && (!byWeek || d.weekRange.some(wr => wr.from <= week && wr.to >= week)))
            )).map((time, tr) => (
                <tr key={tr}>
                    <td>
                        <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">Tiết {time.lessonNumber}</Text>
                        <br />
                        <Text>{time.start} - {time.end}</Text>
                    </td>
                    {Array.from({ length: 7 }, (_, i) => i + 2).map(day => (
                        <td key={day}>
                            {scheduleData.filter(d =>
                                d.time.some(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber && (!byWeek || d.weekRange.some(wr => wr.from <= week && wr.to >= week)))
                            ).map((d, ind) => (
                                <Box className={tbCls.card} key={d.id + day + ind}>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                        <Text>{d.name}</Text>
                                        <Text size="1" style={{ fontSize: '10px', color: 'grey' }} color="gray">{d.instructor}</Text>
                                        <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">{d.time.filter(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber).map(t => t.class).join(', ')}</Text>
                                    </Box>
                                </Box>
                            ))}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    ), [timeRange, week, byWeek, scheduleData, showOnlyAvailable]);

    return (
        <>
            <Container>
                <Card my="3" mx="3" style={{ width: 'calc(100% - 2rem)', padding: '1.5rem' }}>
                    <Flex direction="column" gap="1">
                        <Text size='6'>
                            Tạo thời khoá biểu
                            <Text as="span" ml="1" size="1" color="gray">for <Link color="gray" href="https://dut.udn.vn">DUT</Link> students</Text>
                        </Text>
                        <Text size='2' color="gray">
                            Truy c&#x1EAD;p v&agrave;o trang <b>Sinh vi&ecirc;n &gt; C&aacute; nh&acirc;n &gt; L&#x1ECB;ch h&#x1ECD;c, thi &amp; kh&#x1EA3;o s&aacute;t &yacute; ki&#x1EBF;n</b>, sau đ&oacute; copy b&#x1EA3;ng l&#x1ECB;ch h&#x1ECD;c v&agrave;o đ&acirc;y. <Link href="https://dut.udn.vn">Xem video hướng dẫn</Link>.
                            <br />
                            Thời khoá biểu đã nhập sẽ tự động lưu vào bộ nhớ của trình duyệt.
                        </Text>
                        <TextArea
                            value={data}
                            onChange={(e) => setData(e.currentTarget.value)}
                            style={{ margin: '1rem 0', fontSize: '12px', height: '200px', fontFamily: 'monospace, Consolas, source-code-pro, Menlo, Monaco, Lucida Console, Courier New, sans-serif' }} resize="vertical" placeholder="Dán bảng đã copy vào đây..." />
                        <Flex align="center" gap="2" style={{ marginBottom: '1rem' }}>
                            <Checkbox
                                checked={byWeek}
                                onCheckedChange={(e) => setByWeek(Boolean(e))}
                            />
                            <Text>Theo tuần</Text>
                            <TextField.Root
                                disabled={!byWeek}
                                style={{ width: '3rem' }}
                                value={week}
                                onChange={(e) => setWeek(Number(e.currentTarget.value))}
                                size="1" type="number" placeholder="Tuần"
                            />
                            <Checkbox
                                checked={showOnlyAvailable}
                                onCheckedChange={(e) => setShowOnlyAvailable(Boolean(e))}
                            />
                            <Text>Chỉ hiển thị mốc thời gian có lịch học</Text>
                        </Flex>
                        <Flex align="center" gap="1">
                            <Button
                                color="red"
                                variant="soft"
                                onClick={() => {
                                    setData('');
                                    setByWeek(false);
                                    setWeek(0);
                                }}
                            >Reset</Button>
                            <Button
                                variant="soft"
                                onClick={() => {
                                    if (!tableRef.current) return;

                                    html2canvas(tableRef.current, {
                                        allowTaint: true,
                                        backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#212225' : '#fff',
                                    }).then(function (canvas) {
                                        const link = document.createElement('a');
                                        link.download = 'dut.tkb.parser-' + Date.now() + '.png';
                                        link.href = canvas.toDataURL('image/png');
                                        link.click();
                                        link.remove();
                                    });
                                }}
                            >Lưu lại thành file ảnh</Button>
                        </Flex>
                    </Flex>
                </Card>
                <Card my="3" mx="3" style={{ width: 'calc(100% - 2rem)', padding: '1.5rem' }}>
                    <NextLession />
                </Card>
            </Container>
            <Box mx="3" style={{ width: 'calc(100% - 2rem)', overflow: 'auto' }}>
                <table className={tbCls.table} ref={tableRef}>
                    <thead>
                        <tr>
                            <th> </th>
                            {Array.from({ length: 7 }, (_, i) => i + 2).map((day) => (
                                <th key={day}>{day === 8 ? 'Chủ nhật' : `Thứ ${day}`}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dt}
                    </tbody>
                </table>
            </Box>
            <Footer />

        </>
    )
}