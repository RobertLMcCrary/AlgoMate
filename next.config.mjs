/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['img.clerk.com', 'images.clerk.dev'],
    },
    webpack(config) {
        config.output.webassemblyModuleFilename =
            'static/wasm/[modulehash].wasm';
        return config;
    },
    async headers() {
        return [
            {
                source: '/static/wasm/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/wasm',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
