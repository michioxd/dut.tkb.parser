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

import {
    Box,
    Button,
    Callout,
    Card,
    Checkbox,
    Container,
    Flex,
    IconButton,
    Link,
    Popover,
    ScrollArea,
    Text,
    TextArea,
    TextField,
    Tooltip,
} from "@radix-ui/themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import Parser, { TKBType } from "./core/parser";
import timeRange from "./core/range";
import html2canvas from "html2canvas-pro";
import tbCls from "./table.module.scss";
import { useTheme } from "./context/ThemeContext";
import {
    CircleIcon,
    DoubleArrowDownIcon,
    DoubleArrowUpIcon,
    DownloadIcon,
    ExternalLinkIcon,
    InfoCircledIcon,
    MoonIcon,
    PlusIcon,
    ResetIcon,
    SunIcon,
} from "@radix-ui/react-icons";
import { Base64 } from "js-base64";

const genBg = (name: string): string =>
    `hsl(${name.split("").reduce((h, c) => (h + c.charCodeAt(0)) % 360, 0)}, 70%, 50%, 0.15)`;

const initialCustomData = {
    name: "",
    subject: "",
    instructor: "",
    room: "",
    day: 2,
    start: 1,
    end: 10,
    weekFrom: 1,
    weekTo: 2,
};

export default function App() {
    const { mode, setMode } = useTheme();
    const [byWeek, setByWeek] = useState(localStorage.getItem("byWeek") === "true" || false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(
        localStorage.getItem("showOnlyAvailable") === "true" || false,
    );
    const [onlyToday, setOnlyToday] = useState(localStorage.getItem("onlyToday") === "true" || false);
    const [week, setWeek] = useState(localStorage.getItem("week") ? Number(localStorage.getItem("week")) : 1);
    const [data, setData] = useState(localStorage.getItem("data") || "");
    const [autoFit, setAutoFit] = useState(localStorage.getItem("autoFit") === "true" || false);
    const tableRef = useRef<HTMLTableElement>(null);
    const [saving, setSaving] = useState(false);
    const [hidePanel, setHidePanel] = useState(localStorage.getItem("hidePanel") === "true" || false);
    const [zoomRatio, setZoomRatio] = useState(1);

    const [customData, setCustomData] = useState(initialCustomData);

    useEffect(() => {
        localStorage.setItem("data", data);
    }, [data]);

    useEffect(() => {
        localStorage.setItem("byWeek", byWeek.toString());
    }, [byWeek]);

    useEffect(() => {
        localStorage.setItem("showOnlyAvailable", showOnlyAvailable.toString());
    }, [showOnlyAvailable]);

    useEffect(() => {
        localStorage.setItem("week", week.toString());
    }, [week]);

    useEffect(() => {
        localStorage.setItem("onlyToday", onlyToday.toString());
    }, [onlyToday]);

    useEffect(() => {
        localStorage.setItem("autoFit", autoFit.toString());
    }, [autoFit]);

    useEffect(() => {
        localStorage.setItem("hidePanel", hidePanel.toString());
    }, [hidePanel]);

    const scheduleData = useMemo<TKBType[]>(() => {
        const d: TKBType[] = [];
        data.replace(/\r\n/g, "\n")
            .split("\n")
            .map((line) => {
                if (line === "") return null;

                const parser = Parser(line);
                if (parser) {
                    d.push(parser);
                }
            });

        return d;
    }, [data]);

    const resetCustomForm = () => {
        setCustomData(initialCustomData);
    };

    useEffect(() => {
        if (!tableRef.current) return;

        const handleResize = () => {
            if (!tableRef.current) return;
            const tableWidth = tableRef.current.offsetWidth;
            const screenWidth = window.innerWidth - 42;
            const zoomRatio = Math.min(1, screenWidth / tableWidth);
            setZoomRatio(zoomRatio);
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [autoFit]);

    const handleSaveImage = useCallback(async () => {
        if (!tableRef.current) return;
        setSaving(true);

        const table = tableRef.current;

        let zoom = 1;
        if (autoFit) {
            zoom = zoomRatio;
            setZoomRatio(1);
            await new Promise((resolve) => setTimeout(resolve, 100)); // wait for the table to be resized
        }

        try {
            const canvas = await html2canvas(table, {
                allowTaint: true,
                backgroundColor: null,
            });

            const link = document.createElement("a");
            link.download = "dut.tkb.parser-" + Date.now() + ".png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            link.remove();
            canvas.remove();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
            if (autoFit) setZoomRatio(zoom);
        }
    }, [autoFit, zoomRatio, tableRef]);

    const addCustomLesson = useCallback(() => {
        if (!customData.name || !customData.instructor || !customData.room) return;
        const customLessonString = `99\t1234567.1234.12.34\t${customData.name}\t3\t\t\t${customData.instructor}\tThứ ${customData.day},${customData.start}-${customData.end},${customData.room}\t${customData.weekFrom}-${customData.weekTo}`;
        setData((prev) => prev + "\n" + customLessonString);
        resetCustomForm();
    }, [customData]);

    const dt = useMemo(
        () => (
            <>
                {timeRange
                    .filter(
                        (tra) =>
                            !showOnlyAvailable ||
                            scheduleData.some((d) =>
                                d.time.some(
                                    (t) =>
                                        t.lsStart <= tra.lessonNumber &&
                                        t.lsEnd >= tra.lessonNumber &&
                                        (!byWeek || d.weekRange.some((wr) => wr.from <= week && wr.to >= week)),
                                ),
                            ),
                    )
                    .map((time, tr) => (
                        <tr key={tr}>
                            <td>
                                <Text size="1" style={{ fontSize: "12px" }} color="gray">
                                    Tiết {time.lessonNumber}
                                </Text>
                                <br />
                                <Text>
                                    {time.start} - {time.end}
                                </Text>
                            </td>
                            {Array.from({ length: 7 }, (_, i) => i + 2).map(
                                (day) =>
                                    ((onlyToday &&
                                        (day === new Date().getDay() + 1 ||
                                            (day === 8 && new Date().getDay() === 0))) ||
                                        !onlyToday) && (
                                        <td key={day}>
                                            {scheduleData
                                                .filter((d) =>
                                                    d.time.some(
                                                        (t) =>
                                                            t.date === day &&
                                                            t.lsStart <= time.lessonNumber &&
                                                            t.lsEnd >= time.lessonNumber &&
                                                            (!byWeek ||
                                                                d.weekRange.some(
                                                                    (wr) => wr.from <= week && wr.to >= week,
                                                                )),
                                                    ),
                                                )
                                                .map((d, ind) => (
                                                    <Box
                                                        className={tbCls.card}
                                                        key={d.id + day + ind}
                                                        style={{ backgroundColor: genBg(d.name) }}
                                                    >
                                                        <Box
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "1px",
                                                            }}
                                                        >
                                                            <Text size="3" weight="medium">
                                                                {d.name}
                                                            </Text>
                                                            <Text size="1" style={{ fontSize: "10px" }} color="gray">
                                                                {d.instructor}
                                                            </Text>
                                                            <Text size="1" style={{ fontSize: "12px" }} color="gray">
                                                                {d.time
                                                                    .filter(
                                                                        (t) =>
                                                                            t.date === day &&
                                                                            t.lsStart <= time.lessonNumber &&
                                                                            t.lsEnd >= time.lessonNumber,
                                                                    )
                                                                    .map((t) => t.class)
                                                                    .join(", ")}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                ))}
                                        </td>
                                    ),
                            )}
                        </tr>
                    ))}
            </>
        ),
        [week, byWeek, scheduleData, showOnlyAvailable, onlyToday],
    );

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const dataParam = query.get("data");
        if (dataParam) {
            setData(Base64.decode(dataParam));
            query.delete("data");
            window.history.replaceState(
                {},
                document.title,
                window.location.protocol +
                    "//" +
                    window.location.host +
                    window.location.pathname +
                    (query.toString() ? "?" + query.toString() : ""),
            );
        }
    }, []);

    return (
        <>
            <Container size="4">
                <Card
                    my="3"
                    mx="3"
                    style={{
                        width: "calc(100% - 2rem)",
                        padding: "1.5rem",
                        display: scheduleData.length > 0 && hidePanel ? "none" : "block",
                    }}
                >
                    <Flex direction="column" gap="1">
                        <Text size="6">
                            Tạo thời khoá biểu
                            <Text as="span" ml="1" size="1" color="gray">
                                for{" "}
                                <Link color="gray" href="https://dut.udn.vn">
                                    DUT
                                </Link>{" "}
                                students
                            </Text>
                        </Text>
                        <Text size="2" color="gray">
                            Truy c&#x1EAD;p v&agrave;o trang{" "}
                            <b>
                                <Link href="https://sv.dut.udn.vn/PageLichTH.aspx" target="_blank">
                                    Sinh vi&ecirc;n &gt; C&aacute; nh&acirc;n &gt; L&#x1ECB;ch h&#x1ECD;c, thi &amp;
                                    kh&#x1EA3;o s&aacute;t &yacute; ki&#x1EBF;n
                                </Link>
                            </b>
                            , sau đ&oacute; copy b&#x1EA3;ng l&#x1ECB;ch h&#x1ECD;c v&agrave;o đ&acirc;y.{" "}
                            <Link target="_blank" href="https://youtu.be/wiavNgTzB9o">
                                Xem video hướng dẫn
                            </Link>
                            .
                            <br />
                            Tất cả các khâu xử lí đều được thực hiện hoàn toàn trên trình duyệt của bạn không thông qua
                            máy chủ thứ 3 nào. Thời khoá biểu đã nhập sẽ tự động lưu vào bộ nhớ của trình duyệt.
                        </Text>
                        <Callout.Root color="green" size="1">
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                <b>Cập nhật 5/12/2025:</b> Đã hỗ trợ thời khoá biểu từ website đăng ký học phần.
                            </Callout.Text>
                        </Callout.Root>
                        <TextArea
                            size="1"
                            value={data}
                            onChange={(e) => setData(e.currentTarget.value)}
                            style={{
                                margin: "1rem 0",
                                fontSize: "12px",
                                height: "200px",
                                fontFamily:
                                    "monospace, Consolas, source-code-pro, Menlo, Monaco, Lucida Console, Courier New, sans-serif",
                            }}
                            resize="vertical"
                            placeholder="Dán bảng đã copy vào đây..."
                        />
                        <Flex
                            align={{
                                initial: "start",
                                md: "center",
                            }}
                            gap="2"
                            style={{ marginBottom: "1rem" }}
                            direction={{
                                initial: "column",
                                md: "row",
                            }}
                        >
                            <Flex gap="2" align="center">
                                <Checkbox checked={byWeek} onCheckedChange={(e) => setByWeek(Boolean(e))} />
                                Theo tuần
                                <TextField.Root
                                    disabled={!byWeek}
                                    style={{ width: "3rem" }}
                                    value={week}
                                    min={1}
                                    onChange={(e) => setWeek(Number(e.currentTarget.value))}
                                    size="1"
                                    type="number"
                                    placeholder="Tuần"
                                />
                            </Flex>
                            <Flex gap="2" align="center">
                                <Checkbox
                                    checked={showOnlyAvailable}
                                    onCheckedChange={(e) => setShowOnlyAvailable(Boolean(e))}
                                />
                                Chỉ hiển thị mốc thời gian có lịch học
                            </Flex>
                            <Flex gap="2" align="center">
                                <Checkbox checked={onlyToday} onCheckedChange={(e) => setOnlyToday(Boolean(e))} />
                                Chỉ hiển thị lịch học hôm nay
                            </Flex>
                            <Flex gap="2" align="center">
                                <Checkbox checked={autoFit} onCheckedChange={(e) => setAutoFit(Boolean(e))} />
                                Tự động fit với màn hình
                            </Flex>
                        </Flex>
                        <Flex align="start" wrap="wrap" gap="1" justify="between">
                            <Flex align="start" wrap="wrap" gap="1">
                                <Popover.Root>
                                    <Popover.Trigger>
                                        <Button color="red" variant="soft">
                                            <ResetIcon />
                                            Reset
                                        </Button>
                                    </Popover.Trigger>
                                    <Popover.Content width="360px" size="1">
                                        <Text size="1">Bạn có chắc chắn muốn reset tất cả các tuỳ chọn không?</Text>
                                        <Flex direction="row" gap="2" flexGrow="1" mt="2">
                                            <Popover.Close>
                                                <Button
                                                    size="1"
                                                    variant="soft"
                                                    color="red"
                                                    style={{ flexGrow: 1 }}
                                                    onClick={() => {
                                                        setData("");
                                                        setByWeek(false);
                                                        setWeek(1);
                                                        setShowOnlyAvailable(false);
                                                        setOnlyToday(false);
                                                        setAutoFit(false);
                                                        setHidePanel(false);
                                                        setCustomData(initialCustomData);
                                                        setZoomRatio(1);
                                                        setMode("system");
                                                    }}
                                                >
                                                    Có
                                                </Button>
                                            </Popover.Close>
                                            <Popover.Close>
                                                <Button size="1" variant="soft" color="green" style={{ flexGrow: 1 }}>
                                                    Không
                                                </Button>
                                            </Popover.Close>
                                        </Flex>
                                    </Popover.Content>
                                </Popover.Root>
                                <Button
                                    variant="soft"
                                    disabled={scheduleData.length < 1 || saving}
                                    loading={saving}
                                    onClick={handleSaveImage}
                                >
                                    <DownloadIcon />
                                    Lưu thành ảnh
                                </Button>
                                <Popover.Root>
                                    <Popover.Trigger>
                                        <Button variant="soft" color="green">
                                            <PlusIcon />
                                            Thêm lịch tuỳ chỉnh
                                        </Button>
                                    </Popover.Trigger>
                                    <Popover.Content width="360px">
                                        <Flex gap="3" direction="column">
                                            <Flex direction="column" gap="2">
                                                <Flex direction="column" gap="1">
                                                    <Text size="1">Tên môn học</Text>
                                                    <TextField.Root
                                                        placeholder="Tên môn học"
                                                        value={customData.name}
                                                        onChange={(e) =>
                                                            setCustomData((prev) => ({ ...prev, name: e.target.value }))
                                                        }
                                                    />
                                                </Flex>
                                                <Flex direction="column" gap="1">
                                                    <Text size="1">Tên giảng viên</Text>
                                                    <TextField.Root
                                                        placeholder="Tên giảng viên"
                                                        value={customData.instructor}
                                                        onChange={(e) =>
                                                            setCustomData((prev) => ({
                                                                ...prev,
                                                                instructor: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </Flex>
                                                <Flex direction="column" gap="1">
                                                    <Text size="1">Phòng</Text>
                                                    <TextField.Root
                                                        placeholder="Phòng"
                                                        value={customData.room}
                                                        onChange={(e) =>
                                                            setCustomData((prev) => ({ ...prev, room: e.target.value }))
                                                        }
                                                    />
                                                </Flex>
                                                <Flex direction="row" gap="2">
                                                    <Flex direction="column" gap="1" flexGrow="1">
                                                        <Text size="1">Thứ (2-8)</Text>
                                                        <TextField.Root
                                                            placeholder="Thứ (2-8)"
                                                            type="number"
                                                            min="2"
                                                            max="8"
                                                            value={customData.day}
                                                            onChange={(e) =>
                                                                setCustomData((prev) => ({
                                                                    ...prev,
                                                                    day: parseInt(e.target.value) || 2,
                                                                }))
                                                            }
                                                        />
                                                    </Flex>
                                                    <Flex direction="column" gap="1" flexGrow="1">
                                                        <Text size="1">Từ tiết (1-10)</Text>
                                                        <TextField.Root
                                                            placeholder="Tiết (1-10)"
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={customData.start}
                                                            onChange={(e) =>
                                                                setCustomData((prev) => ({
                                                                    ...prev,
                                                                    start: parseInt(e.target.value) || 1,
                                                                }))
                                                            }
                                                        />
                                                    </Flex>
                                                    <Flex direction="column" gap="1" flexGrow="1">
                                                        <Text size="1">Đến (1-10)</Text>
                                                        <TextField.Root
                                                            placeholder="Tiết (1-10)"
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={customData.end}
                                                            onChange={(e) =>
                                                                setCustomData((prev) => ({
                                                                    ...prev,
                                                                    end: parseInt(e.target.value) || 10,
                                                                }))
                                                            }
                                                        />
                                                    </Flex>
                                                </Flex>
                                                <Flex direction="row" gap="2">
                                                    <Flex direction="column" gap="1">
                                                        <Text size="1">Từ tuần</Text>
                                                        <TextField.Root
                                                            placeholder="Tuần"
                                                            type="number"
                                                            min="1"
                                                            value={customData.weekFrom}
                                                            onChange={(e) =>
                                                                setCustomData((prev) => ({
                                                                    ...prev,
                                                                    weekFrom: parseInt(e.target.value) || 1,
                                                                }))
                                                            }
                                                        />
                                                    </Flex>
                                                    <Flex direction="column" gap="1">
                                                        <Text size="1">Đến tuần</Text>
                                                        <TextField.Root
                                                            placeholder="Tuần"
                                                            type="number"
                                                            min="1"
                                                            value={customData.weekTo}
                                                            onChange={(e) =>
                                                                setCustomData((prev) => ({
                                                                    ...prev,
                                                                    weekTo: parseInt(e.target.value) || 2,
                                                                }))
                                                            }
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                            <Flex direction="row" gap="2" flexGrow="1">
                                                <Popover.Close>
                                                    <Button
                                                        variant="soft"
                                                        style={{ flexGrow: 1 }}
                                                        onClick={addCustomLesson}
                                                        disabled={
                                                            !customData.name ||
                                                            !customData.instructor ||
                                                            !customData.room
                                                        }
                                                    >
                                                        <PlusIcon />
                                                        Thêm
                                                    </Button>
                                                </Popover.Close>
                                                <Button
                                                    variant="soft"
                                                    color="red"
                                                    style={{ flexGrow: 1 }}
                                                    onClick={resetCustomForm}
                                                >
                                                    <ResetIcon />
                                                    Reset
                                                </Button>
                                            </Flex>
                                        </Flex>
                                    </Popover.Content>
                                </Popover.Root>
                                <Button variant="soft" color="cyan" asChild>
                                    <a href="https://youtu.be/wiavNgTzB9o" target="_blank" rel="noreferrer">
                                        Xem hướng dẫn <ExternalLinkIcon />
                                    </a>
                                </Button>
                            </Flex>
                            <Tooltip
                                content={`Chủ đề: ${mode === "system" ? "Tự động" : mode === "dark" ? "Tối" : "Sáng"}`}
                            >
                                <IconButton
                                    variant="soft"
                                    color="gray"
                                    onClick={() =>
                                        setMode(mode === "system" ? "dark" : mode === "dark" ? "light" : "system")
                                    }
                                >
                                    {mode === "system" ? <CircleIcon /> : mode === "dark" ? <MoonIcon /> : <SunIcon />}
                                </IconButton>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Card>
                {scheduleData.length > 0 && (
                    <Button
                        variant="ghost"
                        style={{ width: "100%" }}
                        mb="3"
                        color="gray"
                        onClick={() => setHidePanel(!hidePanel)}
                    >
                        {hidePanel ? <DoubleArrowDownIcon /> : <DoubleArrowUpIcon />}
                        {hidePanel ? "Hiện tuỳ chọn" : "Ẩn tuỳ chọn"}
                    </Button>
                )}
            </Container>
            {scheduleData.length > 0 && (
                <ScrollArea mx="3" style={{ width: "calc(100% - 2rem)" }}>
                    <table className={tbCls.table} ref={tableRef} style={autoFit ? { zoom: zoomRatio } : {}}>
                        <thead>
                            <tr>
                                <th> </th>
                                {onlyToday ? (
                                    <th>{new Date().getDay() === 0 ? "Chủ nhật" : `Thứ ${new Date().getDay() + 1}`}</th>
                                ) : (
                                    Array.from({ length: 7 }, (_, i) => i + 2).map((day) => (
                                        <th key={day}>{day === 8 ? "Chủ nhật" : `Thứ ${day}`}</th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody>{dt}</tbody>
                    </table>
                </ScrollArea>
            )}
            <Footer />
        </>
    );
}
