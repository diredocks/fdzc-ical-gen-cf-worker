# fdzc-ical-gen-cf-worker

This project generates an ICS (iCalendar) subscription link for Fuzhou University Zhicheng College.  
It allows you to sync and update your class schedule seamlessly across multiple platforms.

![Preview](https://github.com/user-attachments/assets/072d41fc-cf95-497f-bf51-e8e356d251a3)

## Privacy

We do **not** store any of your personal information on our instance.
If you prefer, you're welcome to self-host your own deployment for complete control.

> This is open source software provided **as-is**, without any warranty.

## Deployment

To deploy your own instance:

   ```bash
   git clone https://github.com/yourusername/fdzc-ical-gen-cf-worker.git
   cd fdzc-ical-gen-cf-worker/backend
   wrangler deploy
   ```

> You'll need a Cloudflare account and API credentials to deploy.

## Acknowledgments

The `ical` module in this project is a JavaScript port of
[python-ical-timetable](https://github.com/junyilou/python-ical-timetable) by [@junyilou](https://github.com/junyilou).
