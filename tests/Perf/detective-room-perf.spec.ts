import { test, expect } from '@playwright/test'

const baseUrl = process.env.DETECTIVE_BASE_URL ?? 'http://localhost:3000'
test.describe.configure({ timeout: 90_000 })

test.describe('Detective room performance', () => {
    test('runs and respects resource budgets at default quality', async ({ page }) => {
        await page.goto(`${baseUrl}/detective-room`)

        await page.getByTestId('detective-ready').waitFor({ timeout: 30_000 })

        // Disable pixelation post-FX so drawCalls are meaningful
        await page.evaluate(() => {
            (window as any).__TT_DETECTIVE_TUNE__?.enablePerfMode?.()
        })

        // Let the perf window fill up (20s)
        await page.waitForTimeout(20_000)

        const perf = await page.evaluate(() => (window as any).__TT_DETECTIVE_PERF__)
        const tex  = await page.evaluate(() => (window as any).__TT_TEXTURE_LOADING__)

        console.log('Default quality perf:', perf)
        console.log('Texture loading:', tex)

        expect(perf).toBeTruthy()
        expect(tex).toBeTruthy()

        const {
            avgFps,
            maxFrameTime,
            geometries,
            textures,
            drawCalls,
            sampleCount,
        } = perf

        // Scene is actually rendering over time
        expect(sampleCount).toBeGreaterThan(40)

        // Fail if FPS is clearly dead
        expect(avgFps).toBeGreaterThan(2.5)

        // No >1s spikes
        expect(maxFrameTime).toBeLessThan(1000)

        // Resource ceilings – these are your “fail when bad” knobs
        expect(geometries).toBeLessThan(800)
        expect(textures).toBeLessThan(64)

        // Draw calls: must not explode, and should be > 0
        expect(drawCalls).toBeGreaterThan(0)
        expect(drawCalls).toBeLessThan(900)

        // Textures finished loading
        expect(tex.pending).toBe(0)
        expect(tex.inFlight).toBe(0)
    })

    test('low-quality preset reduces load compared to default', async ({ page }) => {
        await page.goto(`${baseUrl}/detective-room`)
        await page.getByTestId('detective-ready').waitFor({ timeout: 30_000 })

        // Same perf mode (no pixelation) for both measurements
        await page.evaluate(() => {
            (window as any).__TT_DETECTIVE_TUNE__?.enablePerfMode?.()
        })

        // 1) Measure default quality
        await page.waitForTimeout(12_000)
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

        // Geometries and draw calls should not increase; ideally they drop
        expect(lowPerf.geometries).toBeLessThanOrEqual(highPerf.geometries)
        expect(lowPerf.drawCalls).toBeLessThanOrEqual(highPerf.drawCalls)

        // Soft check: low quality should not be significantly slower
        if (highPerf.avgFps > 0) {
            expect(lowPerf.avgFps).toBeGreaterThanOrEqual(highPerf.avgFps * 0.8)
        }
    })
})