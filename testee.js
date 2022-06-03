module.exports = {
    browsers: [
        {
            clean: true,
            browser: "chrome",
            args: [
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--remote-debugging-port=9222"
            ],
        },
    ],
};