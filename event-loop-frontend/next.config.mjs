/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        // NOTE:
        // GO_BACKEND_URL: "replace with ip of VM"

        // GO_BACKEND_URL: "https://0.0.0.0:8080",

        // Hegde's Tailscale IP to backend
        GO_BACKEND_URL: "https://100.91.203.91:8080",

        // Sudhir's Tailscale IP to backend
        // GO_BACKEND_URL: "https://100.102.173.22:8080",
    },
};

export default nextConfig;
