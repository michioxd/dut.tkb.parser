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

import { Flex, Link, Text } from "@radix-ui/themes";
import MainIcon from "./Etc";

export default function Footer() {
    return (
        <Flex justify="center" align="center" direction="column" style={{ margin: '2rem 0' }} gap="4">
            <MainIcon fontSize={50} />
            <Text size="1" color="gray" style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                <Link target="_blank" color="gray" href="https://github.com/michioxd/dut.tkb.parser">GitHub</Link> - <Link target="_blank" color="gray" href="https://github.com/michioxd/dut.tkb.parser/blob/main/LICENSE">MIT License</Link>
                <br />
                &copy; {(new Date()).getUTCFullYear()} <Link target="_blank" color="gray" href="https://michioxd.ch">michioxd</Link> powered.
            </Text>
        </Flex>
    )
}