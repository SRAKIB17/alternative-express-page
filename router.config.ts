

module.exports = {
    // Customizing webpack configuration
    webpack: (config: any, { dev, isServer }: any) => {
        // Modify webpack config here
        console.log(435)
        return config;
    },

    // Environment variables
    env: {
        MY_ENV_VARIABLE: process.env.MY_ENV_VARIABLE
    },

    // Setting up redirects
    async redirects() {
        return [
            {
                source: '/old-url',
                destination: '/new-url',
                permanent: true,
            },
        ];
    },

    // Add more configuration options as needed
};
