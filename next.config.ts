import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};

// ¡Esto es lo importante, envolver la config!
export default withNextIntl(nextConfig);