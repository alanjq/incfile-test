const puppeteer = require('puppeteer');

(async () => {
   const USER = {
      NAME: 'alanjq@outlook.com',
      PSWD: 'jIpvek-3hifga-sugvob'
   }

   const browser = await puppeteer.launch({ headless: false });

   // Extract data from randomtodolist
   const page = await browser.newPage()
   await page.goto('https://randomtodolistgenerator.herokuapp.com/api/tasks')
   await page.content()

   let tasklist = await page.evaluate(() => {
      return JSON.parse(document.querySelector("body").innerText)
   })
   // Only use 5 tasks
   tasklist = tasklist.filter((task, i) => i < 5 ? task : null)

   // Login into TODOIST
   await page.goto('https://todoist.com/auth/login')
   await page.content()
   await page.waitForSelector('#labeled-input-1')
   await page.type('#labeled-input-1', USER.NAME)
   await page.type('#labeled-input-3', USER.PSWD)
   await page.click('[data-gtm-id="start-email-login"]')
   await page.content();

   async function createTaskItem(taskItem) {

      await page.waitForTimeout(2000)
      await page.waitForSelector('#top_bar', { delay: '3' });
      await page.$eval('#top_bar #quick_add_task_holder', (button) => button.click());
      await page.click('#top_bar #quick_add_task_holder');
      await page.content();

      // Set the values on the form
      await page.waitForSelector('[role="textbox"]')
         .then(() => {
            page.type('[role="textbox"]', taskItem.name);
         });
      await page.waitForSelector('textarea', { delay: '3' })
         .then(() => {
            page.type('textarea', taskItem.description);
         });

      await page.waitForSelector('[data-testid="task-editor-submit-button"][aria-disabled="false"]', { delay: '3' })
         .then(() => {
            page.click('[data-testid="task-editor-submit-button"]');
         });

   }

   // Create the tasks
   await tasklist.forEach(createTaskItem);
})();
