# fdzc-ical-gen-cf-worker

View Your Timetable Like a Pro @ Fuzhou University Zhicheng College  

![Preview](https://github.com/user-attachments/assets/072d41fc-cf95-497f-bf51-e8e356d251a3)

## Features

- **One Link, Everywhere**  
Use a single subscription link across all your devices. Your class schedule stays in sync automatically — on your phone, tablet, laptop, and more. You can even share the link with your friends (and tell them not to bother you during class!).  
- **Cross-Platform Compatibility**  
Thanks to the universal iCalendar (.ics) format, you're no longer limited to viewing your schedule on just your phone. It works on iOS, Android, Windows, macOS, Linux.  
- **Better System Integration**  
By using your system’s native calendar app, you unlock full integration with features like home screen widgets, lock screen displays, and voice assistant support — all automatically updated with your class schedule.  
- **Serverless & Easy to Deploy**  
No need to rent a server! This project runs on Cloudflare Workers, so you can deploy it easily and for free.

## Privacy

We do **not** store any of your personal information on our instance.
If you prefer, you're welcome to self-host your own deployment for complete control.

> This is open source software provided **as-is**, without any warranty.

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
