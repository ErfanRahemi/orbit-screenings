# ORBIT — Exclusive Screenings (اوربیت — اکران‌های اختصاصی)

پلتفرم مدرن، مینیمال و دارک رزرو بلیت و انتخاب صندلی اکران‌های اختصاصی فیلم‌های سینمایی خارجی و انیمه‌های برجسته در سینماهای شهرهای مختلف ایران.

![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Dark_Cosmic-0B0C10?logo=tailwindcss)
![Render](https://img.shields.io/badge/Render-Deploy_Ready-46E3B7?logo=render)

---

## راهنمای انتشار رایگان روی سرور Render (Render Free Deployment)

این پروژه برای استقرار سریع و کاملاً رایگان روی پلتفرم ابری **Render (render.com)** آماده‌سازی شده است:

### تنظیمات سرویس وب در Render (Web Service Settings):
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (یا `node server.js`)
- **متغیر محیطی PORT:** وب‌سرور پروژه در فایل `server.js` به‌طور کامل از متغیر محیطی `process.env.PORT` (با مقدار پیش‌فرض `3000`) پشتیبانی می‌کند و روی `0.0.0.0` گوش می‌دهد.

### فایل‌های پیکربندی رندر در مخزن:
1. **`server.js`**: وب‌سرور بهینه‌شده مبتنی بر Node.js که پورت را مستقیماً از متغیر محیطی `PORT` خوانده و روی آدرس `0.0.0.0` باین می کند.
2. **`Procfile`**: فایل استاندارد استقرار ابری حاوی دستور `web: node server.js`.
3. **`requirements.txt`**: شامل کتابخانه‌های مورد نیاز پایتون (Gunicorn, Uvicorn, FastAPI, HTTPX) جهت پشتیبانی از استقرار در محیط‌های پایتونی.
4. **`render.yaml`**: فایل بلواپرینت استقرار با یک کلیک (Infrastructure as Code) در رندر.

---

## مشخصات لاگین پیش‌فرض پنل مدیریت:
- **آدرس پنل:** `/admin`
- **نام کاربری:** `admin`
- **رمز عبور:** `orbit1234`
*(امکان ایجاد ادمین‌های جدید، تغییر نام کاربری و رمز توسط هر مدیر، و تغییر لوگو و نام برند در پنل فراهم است)*
