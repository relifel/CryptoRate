import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));

        console.log("Navigating to localhost:3000...");
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

        // click on '登录' tab out of the header
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const loginBtn = btns.find(b => b.innerText.includes('登录'));
            if (loginBtn) loginBtn.click();
        });

        await new Promise(r => setTimeout(r, 1000));

        const content = await page.evaluate(() => {
            const heading = document.querySelector('h1') ? document.querySelector('h1').innerText : '';
            const h2 = document.querySelector('h2') ? document.querySelector('h2').innerText : '';
            const inputs = document.querySelectorAll('input').length;
            const buttons = document.querySelectorAll('button').length;
            const textContent = document.body.innerText;
            return { heading, h2, inputs, buttons, textContent: textContent.substring(0, 300).replace(/\n/g, ' ') };
        });

        console.log("LOGIN PAGE STATS:\n", JSON.stringify(content, null, 2));

        await browser.close();
    } catch (e) {
        console.error("Test Script Error:", e);
    }
})();
