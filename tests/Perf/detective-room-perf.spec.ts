import { test, expect } from '@playwright/test'

const baseUrl = process.env.DETECTIVE_BASE_URL ?? 'http://localhost:3000'
const isCI = process.env.CI === 'true'

test.describe.configure({ timeout: 90_000 })

test.describe('Detective room performance', () => {
    test('runs and respects resource budgets at default quality', async ({ page }) => {
        await page.goto(`${baseUrl}/detective-room`)

        await page.getByTestId('detective-ready').waitFor({ timeout: 30_000 })

        // Let the perf window fill up
        await page.waitForTimeout(20_000)

        const perf = await page.evaluate(() => (window as any).__TT_DETECTIVE_PERF__)
        console.log('Default quality perf:', perf)

        const { avgFps, drawCalls, geometries, textures, sampleCount } = perf

        // Hardware-agnostic budgets (these should hold everywhere)
        expect(drawCalls).toBeLessThanOrEqual(1000)
        expect(geometries).toBeLessThanOrEqual(800)
        expect(textures).toBeLessThanOrEqual(80)

        if (isCI) {
            // On GitHub runners the FPS will be terrible – just assert it being alive
            expect(sampleCount).toBeGreaterThan(12)
            expect(avgFps).toBeGreaterThan(0.5)
        } else {
            // On your real machine you can keep stricter checks
            expect(sampleCount).toBeGreaterThan(40)
            expect(avgFps).toBeGreaterThan(2.5)
        }
    })

    test('low-quality preset reduces load compared to default', async ({ page }) => {
        await page.goto(`${baseUrl}/detective-room`)
        await page.getByTestId('detective-ready').waitFor({ timeout: 30_000 })

        // 1) Measure default quality
        await page.waitForTimeout(20_000)
        const highPerf = await page.evaluate(() => (window as any).__TT_DETECTIVE_PERF__)

        // 2) Switch to low quality: modelQuality "low", no shadows
        await page.evaluate(() => {
            (window as any).__TT_DETECTIVE_TUNE__?.setQuality('low')
        })

        // 3) Measure low-quality perf after it settles
        await page.waitForTimeout(20_000)
        const lowPerf = await page.evaluate(() => (window as any).__TT_DETECTIVE_PERF__)

        console.log('High quality perf:', highPerf)
        console.log('Low quality perf:', lowPerf)

        // These are relative and hardware-independent
        expect(lowPerf.geometries).toBeLessThanOrEqual(highPerf.geometries)
        expect(lowPerf.drawCalls).toBeLessThanOrEqual(highPerf.drawCalls)

        if (!isCI && highPerf.avgFps > 0) {
            // Only enforce FPS comparison on your own machine
            expect(lowPerf.avgFps).toBeGreaterThanOrEqual(highPerf.avgFps * 0.8)
        }
    })
})