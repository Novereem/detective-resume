/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
    ci: {
        collect: {
            url: [
                `${process.env.DETECTIVE_BASE_URL ?? 'http://localhost:3000'}/detective-room`,
            ],
            numberOfRuns: 3,
            settings: {
                preset: 'desktop',
            },
            startServerCommand: 'npm run start'
        },
        assert: {
            assertions: {
                'categories:performance': ['warn', { minScore: 0.65 }],
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
                        maxNumericValue: 8000,
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