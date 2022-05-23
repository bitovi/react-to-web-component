module.exports = {
    browsers: [
        {
            browser: "firefox",
            args: [
                "-headless",
                "-P",
                "default",
                "--start-debugger-server",
                "9222",
            ],
        },
    ],
};