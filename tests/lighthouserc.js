/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
    ci: {
        collect: {
            startServerCommand: 'npm run start',
            url: [
                `${process.env.DETECTIVE_BASE_URL ?? 'http://localhost:3000'}/detective-room`,
            ],
            numberOfRuns: process.env.CI === 'true' ? 1 : 3,
            settings: {
                preset: 'desktop',

                onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],

                skipAudits: ['uses-text-compression', 'charset'],
            },
        },
        assert: {
            assertions: {
                'categories:performance': ['warn', { minScore: 0.6 }],
                'categories:accessibility': ['error', { minScore: 1.0 }],
                'categories:seo': ['error', { minScore: 1.0 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],

                'largest-contentful-paint': [
                    'warn',
                    {
                        maxNumericValue: 7000,
                        aggregationMethod: 'median',
                    },
                ],

                'total-blocking-time': [
                    'warn',
                    {
                        maxNumericValue: 32000,
                        aggregationMethod: 'median',
                    },
                ],
            },
        },
        upload: {
            target: 'filesystem',
            outputDir: './lhci-report',
        },
    },
}