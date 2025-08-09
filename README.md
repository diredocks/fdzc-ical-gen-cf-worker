# fdzc-ical-gen-cf-worker

View Your Timetable Like a Pro @ Fuzhou University Zhicheng College  

![Preview](https://github.com/user-attachments/assets/072d41fc-cf95-497f-bf51-e8e356d251a3)

## Privacy

We do **not** store any of your personal information on our instance.
If you prefer, you're welcome to self-host your own deployment for complete control.

> This is open source software provided **as-is**, without any warranty.

## Usage

Subscribe to your class schedule with this API format:

```
https://<YOUR_WORKER_DOMAIN>/ics?username=<USERNAME>&password=<PASSWORD>&semester=<SEMESTER>&year=<YEAR>
```

**Parameters:**
- `<USERNAME>`: Your ID
- `<PASSWORD>`: Your password
- `<SEMESTER>`: Use "上" for spring, "下" for fall
- `<YEAR>`: Academic year (e.g., 2025)

**Example:**
```
https://ical.clickfling.top/ics?username=2023123456&password=secret123&semester=上&year=2025
```

## Deployment

To deploy your own instance:

```bash
git clone https://github.com/yourusername/fdzc-ical-gen-cf-worker.git
cd fdzc-ical-gen-cf-worker/backend
pnpm i
wrangler deploy
```

> You'll need a Cloudflare account and API credentials to deploy.

## Acknowledgments

The `ical` module in this project is a JavaScript port of
[python-ical-timetable](https://github.com/junyilou/python-ical-timetable) by [@junyilou](https://github.com/junyilou).
