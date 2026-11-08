import fs from 'fs';
import os from 'os';
import path from 'path';
import { DatabaseSchema, Screening, Booking, BookingStatus, VenueTemplate, Seat, SeatMap, AdminUser, SiteSettings, SupportTicket } from '@/types';

const PRIMARY_DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FALLBACK_DB_DIR = path.join(os.tmpdir(), 'orbit-data');

let activeDbDir: string | null = null;
let memoryDbFallback: DatabaseSchema | null = null;

function getActiveDbPaths(): { dir: string; file: string } {
  if (activeDbDir) {
    return { dir: activeDbDir, file: path.join(activeDbDir, 'orbit_db.json') };
  }

  for (const candidateDir of [PRIMARY_DB_DIR, FALLBACK_DB_DIR]) {
    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ candidateDir)) {
        fs.mkdirSync(candidateDir, { recursive: true });
      }
      fs.accessSync(candidateDir, fs.constants.R_OK | fs.constants.W_OK);
      activeDbDir = candidateDir;
      return { dir: candidateDir, file: path.join(candidateDir, 'orbit_db.json') };
    } catch {
      // Try next candidate directory
    }
  }

  return { dir: PRIMARY_DB_DIR, file: path.join(PRIMARY_DB_DIR, 'orbit_db.json') };
}

// Helper to generate a realistic cinema seat grid
export function createGridSeats(
  rowsCount: number,
  colsCount: number,
  vipPrice: number = 240000,
  standardPrice: number = 180000,
  economyPrice: number = 130000,
  options?: {
    aisleCols?: number[];
    vipRows?: number[];
    economyRows?: number[];
    soldPositions?: Array<{ row: number; col: number; buyerName?: string; buyerPhone?: string; bookingId?: string }>;
    blockedPositions?: Array<{ row: number; col: number }>;
  }
): Seat[] {
  const seats: Seat[] = [];
  const aisleCols = options?.aisleCols || [4, 9];
  const vipRows = options?.vipRows || [Math.max(1, rowsCount - 2), Math.max(1, rowsCount - 1)];
  const economyRows = options?.economyRows || [1];

  for (let r = 1; r <= rowsCount; r++) {
    const rowChar = String.fromCharCode(64 + r); // A, B, C...
    let currentSeatNumber = 1;

    for (let c = 1; c <= colsCount; c++) {
      const id = `r${r}-c${c}`;
      const isAisle = aisleCols.includes(c);
      const isBlocked = options?.blockedPositions?.some((b) => b.row === r && b.col === c);
      const soldInfo = options?.soldPositions?.find((s) => s.row === r && s.col === c);

      let type: Seat['type'] = 'standard';
      let price = standardPrice;

      if (isAisle) {
        type = 'aisle';
        price = 0;
      } else if (isBlocked) {
        type = 'blocked';
        price = standardPrice;
      } else if (vipRows.includes(r)) {
        type = 'vip';
        price = vipPrice;
      } else if (economyRows.includes(r)) {
        type = 'economy';
        price = economyPrice;
      }

      const seatNumber = isAisle ? 0 : currentSeatNumber++;

      seats.push({
        id,
        row: r,
        col: c,
        rowLabel: rowChar,
        seatNumber,
        type,
        price,
        status: soldInfo ? 'sold' : 'available',
        bookedBy: soldInfo
          ? {
              buyerName: soldInfo.buyerName || 'کاربر نمونه اوربیت',
              buyerPhone: soldInfo.buyerPhone || '۰۹۱۲۳۴۵۶۷۸۹',
              bookingId: soldInfo.bookingId || 'ORB-PREVIEW-01',
              bookedAt: '۱۴۰۳/۰۸/۲۲',
            }
          : undefined,
      });
    }
  }

  return seats;
}

// Initial seed data
function getInitialData(): DatabaseSchema {
  const suzumeSeats = createGridSeats(8, 12, 250000, 190000, 140000, {
    aisleCols: [4, 9],
    vipRows: [6, 7],
    economyRows: [1],
    soldPositions: [
      { row: 6, col: 5, buyerName: 'امیرحسین رضایی', buyerPhone: '۰۹۱۲۱۱۱۱۱۱۱', bookingId: 'ORB-918234' },
      { row: 6, col: 6, buyerName: 'امیرحسین رضایی', buyerPhone: '۰۹۱۲۱۱۱۱۱۱۱', bookingId: 'ORB-918234' },
      { row: 4, col: 7, buyerName: 'سارا کاظمی', buyerPhone: '۰۹۳۵۲۲۲۳۳۴۴', bookingId: 'ORB-831920' },
      { row: 4, col: 8, buyerName: 'سارا کاظمی', buyerPhone: '۰۹۳۵۲۲۲۳۳۴۴', bookingId: 'ORB-831920' },
      { row: 7, col: 7, buyerName: 'مهرداد پاکدل', buyerPhone: '۰۹۱۹۵۵۵۶۶۷۷', bookingId: 'ORB-746219' },
    ],
    blockedPositions: [
      { row: 1, col: 1 },
      { row: 1, col: 12 },
    ],
  });

  const spiritedAwaySeats = createGridSeats(7, 10, 220000, 170000, 120000, {
    aisleCols: [3, 8],
    vipRows: [5, 6],
    economyRows: [1],
    soldPositions: [
      { row: 5, col: 5, buyerName: 'نیلوفر زمانی', buyerPhone: '۰۹۱۲۸۸۸۹۹۰۰', bookingId: 'ORB-625143' },
      { row: 5, col: 6, buyerName: 'نیلوفر زمانی', buyerPhone: '۰۹۱۲۸۸۸۹۹۰۰', bookingId: 'ORB-625143' },
      { row: 3, col: 6, buyerName: 'آرش علوی', buyerPhone: '۰۹۳۶۷۷۷۸۸۹۹', bookingId: 'ORB-519842' },
    ],
  });

  const oppenheimerSeats = createGridSeats(9, 14, 280000, 210000, 150000, {
    aisleCols: [4, 11],
    vipRows: [7, 8],
    economyRows: [1],
    soldPositions: [
      { row: 7, col: 6, buyerName: 'دانیال کریمی', buyerPhone: '۰۹۱۰۳۳۳۴۴۵۵', bookingId: 'ORB-419082' },
      { row: 7, col: 7, buyerName: 'دانیال کریمی', buyerPhone: '۰۹۱۰۳۳۳۴۴۵۵', bookingId: 'ORB-419082' },
      { row: 7, col: 8, buyerName: 'دانیال کریمی', buyerPhone: '۰۹۱۰۳۳۳۴۴۵۵', bookingId: 'ORB-419082' },
      { row: 8, col: 7, buyerName: 'پگاه صادقی', buyerPhone: '۰۹۱۲۹۹۹۳۳۲۲', bookingId: 'ORB-384910' },
    ],
  });

  const firefliesSeats = createGridSeats(6, 10, 200000, 160000, 110000, {
    aisleCols: [3, 8],
    vipRows: [5],
    economyRows: [1],
    soldPositions: [
      { row: 5, col: 4, buyerName: 'فرهاد نادری', buyerPhone: '۰۹۳۵۴۴۴۱۱۲۲', bookingId: 'ORB-291048' },
      { row: 5, col: 5, buyerName: 'فرهاد نادری', buyerPhone: '۰۹۳۵۴۴۴۱۱۲۲', bookingId: 'ORB-291048' },
    ],
  });

  const screenings: Screening[] = [
    {
      id: 'screening-suzume',
      titleFa: 'سوزومه (قفل‌کردن درها)',
      titleEn: 'Suzume no Tojimari',
      tagline: 'تجربه‌ای رویایی از شاهکار جدید ماکوتو شینکای بر پرده نقره‌ای اختصاصی',
      genre: 'انیمه • فانتزی ماجراجویی • درام',
      city: 'تهران',
      venueName: 'پردیس چارسو — سالن ۲ اختصاصی اوربیت',
      venueAddress: 'تهران، خیابان جمهوری، تقاطع پل حافظ، طبقه ۶',
      date: 'جمعه ۲۵ آبان ۱۴۰۳',
      time: '۱۹:۳۰',
      duration: '۱۲۲ دقیقه',
      ageRating: '+۱۲ سال',
      language: 'ژاپنی اورجینال با زیرنویس اختصاصی فارسی و صدای دالبی اتموس',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      synopsis: 'سوزومه، دختری ۱۷ ساله از شهری آرام در کیوشو، با پسری جوان آشنا می‌شود که به دنبال درهایی مرموز می‌گردد. گشوده شدن این درها فجایعی را در سراسر ژاپن رقم می‌زند و سوزومه باید برای نجات جهان و بستن این درها سفری شگفت‌انگیز را آغاز کند...',
      featured: true,
      createdAt: '2026-11-01T10:00:00Z',
      seatMap: {
        rows: 8,
        cols: 12,
        seats: suzumeSeats,
        vipPrice: 250000,
        standardPrice: 190000,
        economyPrice: 140000,
      },
    },
    {
      id: 'screening-spirited-away',
      titleFa: 'شهر اشباح',
      titleEn: 'Spirited Away (Sen to Chihiro)',
      tagline: 'بازپخش با کیفیت 4K و مسترینگ صدای سینمایی هایائو میازاکی',
      genre: 'انیمه • فانتزی کلاسیک • شاهکار استودیو جیبلی',
      city: 'شیراز',
      venueName: 'سینما هنر شیراز — سالن یاقوت',
      venueAddress: 'شیراز، بلوار ستارخان، مجتمع بزرگ فرهنگی یاقوت',
      date: 'پنجشنبه ۱ آذر ۱۴۰۳',
      time: '۲۰:۰۰',
      duration: '۱۲۵ دقیقه',
      ageRating: 'عمومی (بدون محدودیت سنی)',
      language: 'زبان اصلی ژاپنی با زیرنویس فارسی اختصاصی و کریستالی',
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
      synopsis: 'چیهیرو دختربچه ۱۰ ساله‌ای است که همراه پدر و مادرش وارد دنیایی ناشناخته از خدایان، اشباح و جادوگران می‌شود. پس از تبدیل شدن والدینش به حیوان، او برای نجات آنها و بازگشت به دنیای انسان‌ها در حمام اسرارآمیز یوکای مشغول به کار می‌شود...',
      featured: false,
      createdAt: '2026-11-01T11:00:00Z',
      seatMap: {
        rows: 7,
        cols: 10,
        seats: spiritedAwaySeats,
        vipPrice: 220000,
        standardPrice: 170000,
        economyPrice: 120000,
      },
    },
    {
      id: 'screening-oppenheimer',
      titleFa: 'اوپنهایمر — نسخه آیمکس ۷۰ میلی‌متری',
      titleEn: 'Oppenheimer (IMAX Experience)',
      tagline: 'روایتی انفجاری از پدر بمب اتم با صدای سهمگین آیمکس',
      genre: 'بیوگرافی • تاریخی • درام هیجان‌انگیز کریستوفر نولان',
      city: 'اصفهان',
      venueName: 'پردیس سینمایی ساحل اصفهان — سالن اصلی آیمکس',
      venueAddress: 'اصفهان، میدان انقلاب، ابتدای خیابان چهارباغ عباسی',
      date: 'شنبه ۳ آذر ۱۴۰۳',
      time: '۱۸:۰۰',
      duration: '۱۸۰ دقیقه',
      ageRating: '+۱۵ سال',
      language: 'زبان اصلی انگلیسی با زیرنویس دقیق اصطلاحات علمی و تاریخی',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
      synopsis: 'داستان جی. رابرت اوپنهایمر، فیزیکدان برجسته آمریکایی و مدیر پروژه سرنوشت‌ساز منهتن در خلال جنگ جهانی دوم، و چالش‌های اخلاقی و سیاسی پیرامون خلق نخستین سلاح هسته‌ای جهان...',
      featured: false,
      createdAt: '2026-11-02T12:00:00Z',
      seatMap: {
        rows: 9,
        cols: 14,
        seats: oppenheimerSeats,
        vipPrice: 280000,
        standardPrice: 210000,
        economyPrice: 150000,
      },
    },
    {
      id: 'screening-fireflies',
      titleFa: 'مدفن کرم‌های شب‌تاب',
      titleEn: 'Grave of the Fireflies',
      tagline: 'تاثیرگذارترین درام ضدجنگ تاریخ انیمیشن استودیو جیبلی',
      genre: 'انیمه کلاسیک • درام جنگی • اقتباس ماندگار',
      city: 'مشهد',
      venueName: 'پردیس سینمایی هویزه مشهد — سالن وی‌آی‌پی',
      venueAddress: 'مشهد، خیابان دانشگاه، چهارراه گلستان',
      date: 'دوشنبه ۵ آذر ۱۴۰۳',
      time: '۲۱:۰۰',
      duration: '۸۹ دقیقه',
      ageRating: '+۱۴ سال',
      language: 'زبان اصلی ژاپنی با زیرنویس فارسی تنظیم‌شده',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1600&auto=format&fit=crop',
      synopsis: 'در روزهای پایانی جنگ جهانی دوم در ژاپن، سیتا و خواهر کوچکش ستسوکو پس از نابودی خانه‌شان، ناچار به تقلا برای بقا در شرایط بی‌رحمانه پس از بمباران می‌شوند...',
      featured: false,
      createdAt: '2026-11-03T14:00:00Z',
      seatMap: {
        rows: 6,
        cols: 10,
        seats: firefliesSeats,
        vipPrice: 200000,
        standardPrice: 160000,
        economyPrice: 110000,
      },
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'ORB-918234',
      screeningId: 'screening-suzume',
      movieTitleFa: 'سوزومه (قفل‌کردن درها)',
      movieTitleEn: 'Suzume no Tojimari',
      city: 'تهران',
      venueName: 'پردیس چارسو — سالن ۲ اختصاصی اوربیت',
      venueAddress: 'تهران، خیابان جمهوری، تقاطع پل حافظ، طبقه ۶',
      date: 'جمعه ۲۵ آبان ۱۴۰۳',
      time: '۱۹:۳۰',
      buyerName: 'امیرحسین رضایی',
      buyerPhone: '09121111111',
      seatIds: ['r6-c5', 'r6-c6'],
      seatDetails: [
        { seatId: 'r6-c5', rowLabel: 'F', seatNumber: 4, type: 'vip', price: 250000 },
        { seatId: 'r6-c6', rowLabel: 'F', seatNumber: 5, type: 'vip', price: 250000 },
      ],
      totalAmount: 500000,
      status: 'confirmed',
      createdAt: '2026-11-04T15:20:00Z',
      paymentRef: 'PAY-8829104',
    },
    {
      id: 'ORB-831920',
      screeningId: 'screening-suzume',
      movieTitleFa: 'سوزومه (قفل‌کردن درها)',
      movieTitleEn: 'Suzume no Tojimari',
      city: 'تهران',
      venueName: 'پردیس چارسو — سالن ۲ اختصاصی اوربیت',
      venueAddress: 'تهران، خیابان جمهوری، تقاطع پل حافظ، طبقه ۶',
      date: 'جمعه ۲۵ آبان ۱۴۰۳',
      time: '۱۹:۳۰',
      buyerName: 'سارا کاظمی',
      buyerPhone: '09352223344',
      seatIds: ['r4-c7', 'r4-c8'],
      seatDetails: [
        { seatId: 'r4-c7', rowLabel: 'D', seatNumber: 6, type: 'standard', price: 190000 },
        { seatId: 'r4-c8', rowLabel: 'D', seatNumber: 7, type: 'standard', price: 190000 },
      ],
      totalAmount: 380000,
      status: 'confirmed',
      createdAt: '2026-11-04T16:10:00Z',
      paymentRef: 'PAY-7719283',
    },
    {
      id: 'ORB-625143',
      screeningId: 'screening-spirited-away',
      movieTitleFa: 'شهر اشباح',
      movieTitleEn: 'Spirited Away',
      city: 'شیراز',
      venueName: 'سینما هنر شیراز — سالن یاقوت',
      venueAddress: 'شیراز، بلوار ستارخان، مجتمع بزرگ فرهنگی یاقوت',
      date: 'پنجشنبه ۱ آذر ۱۴۰۳',
      time: '۲۰:۰۰',
      buyerName: 'نیلوفر زمانی',
      buyerPhone: '09128889900',
      seatIds: ['r5-c5', 'r5-c6'],
      seatDetails: [
        { seatId: 'r5-c5', rowLabel: 'E', seatNumber: 4, type: 'vip', price: 220000 },
        { seatId: 'r5-c6', rowLabel: 'E', seatNumber: 5, type: 'vip', price: 220000 },
      ],
      totalAmount: 440000,
      status: 'confirmed',
      createdAt: '2026-11-04T18:45:00Z',
      paymentRef: 'PAY-6629102',
    },
  ];

  const venueTemplates: VenueTemplate[] = [
    {
      id: 'tpl-charsoo-main',
      name: 'پردیس چارسو — سالن ۲ (۸ ردیف × ۱۲ ستون)',
      rows: 8,
      cols: 12,
      vipPrice: 250000,
      standardPrice: 190000,
      economyPrice: 140000,
      seats: suzumeSeats.map(({ id, row, col, rowLabel, seatNumber, type, price }) => ({
        id,
        row,
        col,
        rowLabel,
        seatNumber,
        type,
        price,
      })),
    },
    {
      id: 'tpl-shiraz-yaqoot',
      name: 'سینما هنر شیراز — سالن یاقوت (۷ ردیف × ۱۰ ستون)',
      rows: 7,
      cols: 10,
      vipPrice: 220000,
      standardPrice: 170000,
      economyPrice: 120000,
      seats: spiritedAwaySeats.map(({ id, row, col, rowLabel, seatNumber, type, price }) => ({
        id,
        row,
        col,
        rowLabel,
        seatNumber,
        type,
        price,
      })),
    },
    {
      id: 'tpl-imax-general',
      name: 'سالن بزرگ آیمکس (۹ ردیف × ۱۴ ستون)',
      rows: 9,
      cols: 14,
      vipPrice: 280000,
      standardPrice: 210000,
      economyPrice: 150000,
      seats: oppenheimerSeats.map(({ id, row, col, rowLabel, seatNumber, type, price }) => ({
        id,
        row,
        col,
        rowLabel,
        seatNumber,
        type,
        price,
      })),
    },
  ];

  const admins: AdminUser[] = [
    {
      id: 'admin-erfan',
      username: 'Erfan.Rahemi',
      password: 'Erf@n8664',
      name: 'عرفان راحمی',
      role: 'superadmin',
      createdAt: '2026-11-01T10:00:00Z',
    },
  ];

  const settings: SiteSettings = {
    logoUrl: '',
    brandName: 'ORBIT',
    brandSubtitle: 'اکران‌های اختصاصی',
    brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
    seatHoldMinutes: 30,
    paymentExpiresIn: '30m',
    varizaCardLast4: '8589',
    appUrl: '',
  };

  return { screenings, bookings, venueTemplates, admins, settings };
}

function loadSeedData(): DatabaseSchema {
  const candidates = [
    path.join(process.cwd(), 'data', 'orbit_db.json'),
    path.join(process.cwd(), 'public', 'orbit_seed.json'),
  ];

  for (const seedFile of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ seedFile)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ seedFile, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.screenings)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading seed candidate:', seedFile, e);
    }
  }

  return getInitialData();
}

// Ensure DB directory and file exist
export function getDb(): DatabaseSchema {
  const { file: dbFile } = getActiveDbPaths();

  if (!fs.existsSync(/*turbopackIgnore: true*/ dbFile)) {
    if (memoryDbFallback) {
      return memoryDbFallback;
    }
    const seedData = loadSeedData();
    memoryDbFallback = seedData;
    saveDb(seedData);
    return seedData;
  }

  try {
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ dbFile, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let mutated = false;

    if (!parsed.admins || !Array.isArray(parsed.admins) || parsed.admins.length === 0) {
      parsed.admins = [
        {
          id: 'admin-erfan',
          username: 'Erfan.Rahemi',
          password: 'Erf@n8664',
          name: 'عرفان راحمی',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        },
      ];
      mutated = true;
    }

    if (!parsed.settings) {
      parsed.settings = {
        logoUrl: '',
        brandName: 'ORBIT',
        brandSubtitle: 'اکران‌های اختصاصی',
        brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
        aboutTitle: 'درباره پلتفرم اکران‌های اختصاصی اوربیت',
        aboutText: 'اوربیت (ORBIT Screenings) جامعه و پلتفرمی مستقل برای اکران‌های اختصاصی و رویدادمحور برترین آثار سینمای جهان و انیمه‌های برجسته است. ما با همکاری بهترین سالن‌های سینمایی مجهز به پیشرفته‌ترین سیستم‌های صوت دالبی اتموس و تصویر کریستالی در شهرهای تهران، شیراز، اصفهان، مشهد و تبریز، تجربه‌ای بی‌نظیر و تکرارنشدنی را برای دوستداران سینما و انیمه خلق می‌کنیم.',
        aboutVision: 'هدف ما ایجاد بستری مدرن، شفاف و بدون دغدغه برای گردهمایی علاقه‌مندان به سینما و تجربه مشترک شاهکارهای پرده نقره‌ای با بالاترین کیفیت ممکن است.',
        contactEmail: 'contact@orbit-cinema.ir',
        contactPhone: '۰۲۱-۸۸۹۹۰۰۱۱',
        contactAddress: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۸',
        contactInstagram: 'orbit_screenings',
        contactTelegram: 'orbit_screenings',
        seatHoldMinutes: 30,
        paymentExpiresIn: '30m',
        varizaCardLast4: '8589',
        appUrl: '',
      };
      mutated = true;
    } else {
      let settingsMutated = false;
      if (!parsed.settings.aboutTitle) {
        parsed.settings.aboutTitle = 'درباره پلتفرم اکران‌های اختصاصی اوربیت';
        settingsMutated = true;
      }
      if (!parsed.settings.aboutText) {
        parsed.settings.aboutText = 'اوربیت (ORBIT Screenings) جامعه و پلتفرمی مستقل برای اکران‌های اختصاصی و رویدادمحور برترین آثار سینمای جهان و انیمه‌های برجسته است. ما با همکاری بهترین سالن‌های سینمایی مجهز به پیشرفته‌ترین سیستم‌های صوت دالبی اتموس و تصویر کریستالی در شهرهای تهران، شیراز، اصفهان، مشهد و تبریز، تجربه‌ای بی‌نظیر و تکرارنشدنی را برای دوستداران سینما و انیمه خلق می‌کنیم.';
        settingsMutated = true;
      }
      if (!parsed.settings.aboutVision) {
        parsed.settings.aboutVision = 'هدف ما ایجاد بستری مدرن، شفاف و بدون دغدغه برای گردهمایی علاقه‌مندان به سینما و تجربه مشترک شاهکارهای پرده نقره‌ای با بالاترین کیفیت ممکن است.';
        settingsMutated = true;
      }
      if (!parsed.settings.contactPhone) {
        parsed.settings.contactPhone = '۰۲۱-۸۸۹۹۰۰۱۱';
        settingsMutated = true;
      }
      if (!parsed.settings.contactEmail) {
        parsed.settings.contactEmail = 'contact@orbit-cinema.ir';
        settingsMutated = true;
      }
      if (!parsed.settings.contactAddress) {
        parsed.settings.contactAddress = 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۸';
        settingsMutated = true;
      }
      if (!parsed.settings.contactInstagram) {
        parsed.settings.contactInstagram = 'orbit_screenings';
        settingsMutated = true;
      }
      if (!parsed.settings.contactTelegram) {
        parsed.settings.contactTelegram = 'orbit_screenings';
        settingsMutated = true;
      }
      if (!parsed.settings.seatHoldMinutes) {
        parsed.settings.seatHoldMinutes = 30;
        settingsMutated = true;
      }
      if (!parsed.settings.paymentExpiresIn) {
        parsed.settings.paymentExpiresIn = '30m';
        settingsMutated = true;
      }
      if (!parsed.settings.varizaCardLast4) {
        parsed.settings.varizaCardLast4 = '8589';
        settingsMutated = true;
      }
      if (parsed.settings.appUrl === 'https://small-crabs-say.loca.lt') {
        parsed.settings.appUrl = '';
        settingsMutated = true;
      }
      if (settingsMutated) mutated = true;
    }

    if (!parsed.tickets || !Array.isArray(parsed.tickets)) {
      parsed.tickets = [
        {
          id: 'TCK-109283',
          name: 'محمد حسینی',
          phone: '09121234567',
          ticketId: 'ORB-918234',
          subject: 'تغییر سانس اکران فیلم سوزومه',
          message: 'با سلام، من برای سانس جمعه ساعت ۱۸ بلیت رزرو کرده‌ام، اما متاسفانه برایم مشکلی پیش آمده است. آیا امکان تغییر سانس به روز یکشنبه وجود دارد؟ با تشکر.',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: 'TCK-481920',
          name: 'زهرا احمدی',
          phone: '09359876543',
          ticketId: '',
          subject: 'سوال در مورد سیستم صوتی سالن شیراز',
          message: 'درود، می‌خواستم بپرسم آیا در اکران شهر اشباح در شیراز، نسخه زیرنویس فارسی اختصاصی پخش می‌شود یا دوبله؟ و آیا کیفیت صدا دالبی ۵.۱ است؟',
          status: 'resolved',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        }
      ];
      mutated = true;
    }

    if (!parsed.processedWebhooks || !Array.isArray(parsed.processedWebhooks)) {
      parsed.processedWebhooks = [];
      mutated = true;
    }

    // Automatically release expired pending reservations
    const nowMs = Date.now();
    for (const b of parsed.bookings) {
      if (b.status === 'pending' && b.expiresAt) {
        const expMs = new Date(b.expiresAt).getTime();
        if (!isNaN(expMs) && expMs < nowMs) {
          b.status = 'expired';
          const scr = parsed.screenings.find((s) => s.id === b.screeningId);
          if (scr) {
            for (const seat of scr.seatMap.seats) {
              if (
                (b.seatIds && b.seatIds.includes(seat.id) && seat.bookedBy?.bookingId === b.id) ||
                seat.bookedBy?.bookingId === b.id
              ) {
                seat.status = 'available';
                seat.bookedBy = undefined;
              }
            }
          }
          mutated = true;
        }
      }
    }

    memoryDbFallback = parsed;
    if (mutated) {
      saveDb(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error reading db.json, repairing with seed data', error);
    const seedData = memoryDbFallback || loadSeedData();
    memoryDbFallback = seedData;
    saveDb(seedData);
    return seedData;
  }
}

// Atomically save to disk with fallback for read-only/container filesystems
export function saveDb(data: DatabaseSchema): void {
  memoryDbFallback = data;
  const serialized = JSON.stringify(data, null, 2);
  const { dir, file } = getActiveDbPaths();

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${file}.tmp`;
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    try {
      fs.renameSync(tempPath, file);
    } catch {
      fs.writeFileSync(file, serialized, 'utf-8');
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup error
      }
    }
  } catch (err) {
    // If primary dir failed mid-flight, switch to os.tmpdir() fallback
    try {
      activeDbDir = FALLBACK_DB_DIR;
      if (!fs.existsSync(/*turbopackIgnore: true*/ FALLBACK_DB_DIR)) {
        fs.mkdirSync(FALLBACK_DB_DIR, { recursive: true });
      }
      const fallbackFile = path.join(FALLBACK_DB_DIR, 'orbit_db.json');
      fs.writeFileSync(fallbackFile, serialized, 'utf-8');
    } catch (fallbackErr) {
      console.warn('Filesystem write unavailable, keeping state in memory:', fallbackErr);
    }
  }
}

// Screening operations
export function getScreenings(city?: string): Screening[] {
  const db = getDb();
  if (!city || city === 'همه شهرها' || city === 'all') {
    return db.screenings;
  }
  return db.screenings.filter((s) => s.city === city);
}

export function getScreeningById(id: string): Screening | null {
  const db = getDb();
  return db.screenings.find((s) => s.id === id) || null;
}

export function createScreening(screeningData: Omit<Screening, 'id' | 'createdAt'>): Screening {
  const db = getDb();
  const id = `screening-${Date.now()}`;
  const seatMap = screeningData.seatMap ? { ...screeningData.seatMap } : undefined;

  if (seatMap && Array.isArray(seatMap.seats)) {
    seatMap.seats = seatMap.seats.map((seat) => {
      let price = seat.price;
      if (seat.type === 'vip') price = seatMap.vipPrice;
      else if (seat.type === 'standard') price = seatMap.standardPrice;
      else if (seat.type === 'economy') price = seatMap.economyPrice;
      else if (seat.type === 'aisle' || seat.type === 'blocked') price = 0;
      return { ...seat, price };
    });
  }

  const newScreening: Screening = {
    ...screeningData,
    seatMap: seatMap as SeatMap,
    id,
    createdAt: new Date().toISOString(),
  };
  db.screenings.unshift(newScreening);
  saveDb(db);
  return newScreening;
}

export function updateScreening(id: string, updates: Partial<Screening>): Screening | null {
  const db = getDb();
  const index = db.screenings.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const existingScreening = db.screenings[index];
  let finalSeatMap = updates.seatMap ? { ...updates.seatMap } : existingScreening.seatMap;

  if (updates.seatMap && Array.isArray(updates.seatMap.seats)) {
    const existingSeatsMap = new Map<string, Seat>();
    for (const seat of existingScreening.seatMap?.seats || []) {
      existingSeatsMap.set(seat.id, seat);
    }

    finalSeatMap.seats = updates.seatMap.seats.map((seat) => {
      const prevSeat = existingSeatsMap.get(seat.id);
      let calculatedPrice = seat.price;
      if (seat.type === 'vip') calculatedPrice = updates.seatMap!.vipPrice;
      else if (seat.type === 'standard') calculatedPrice = updates.seatMap!.standardPrice;
      else if (seat.type === 'economy') calculatedPrice = updates.seatMap!.economyPrice;
      else if (seat.type === 'aisle' || seat.type === 'blocked') calculatedPrice = 0;

      return {
        ...seat,
        price: calculatedPrice,
        status: prevSeat?.status === 'sold' ? 'sold' : seat.status || 'available',
        bookedBy: prevSeat?.bookedBy || seat.bookedBy,
      };
    });
  }

  db.screenings[index] = {
    ...existingScreening,
    ...updates,
    seatMap: finalSeatMap,
  };
  saveDb(db);
  return db.screenings[index];
}

export function deleteScreening(id: string): boolean {
  const db = getDb();
  const initialLength = db.screenings.length;
  db.screenings = db.screenings.filter((s) => s.id !== id);
  if (db.screenings.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

// Bookings & ticket operations
export function getBookings(screeningId?: string, phoneQuery?: string): Booking[] {
  const db = getDb();
  let list = db.bookings;
  if (screeningId) {
    list = list.filter((b) => b.screeningId === screeningId);
  }
  if (phoneQuery) {
    const cleanQuery = phoneQuery.trim().replace(/\s+/g, '');
    list = list.filter(
      (b) =>
        b.buyerPhone.includes(cleanQuery) ||
        b.id.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  }
  return list;
}

export function getBookingById(id: string): Booking | null {
  const db = getDb();
  return db.bookings.find((b) => b.id.toUpperCase() === id.trim().toUpperCase()) || null;
}

export function getBookingBySlug(slug: string): Booking | null {
  const db = getDb();
  return db.bookings.find((b) => b.varizaSlug === slug.trim()) || null;
}

export interface CreateBookingParams {
  id?: string;
  screeningId: string;
  buyerName: string;
  buyerPhone: string;
  seatIds: string[];
  status?: BookingStatus;
  varizaSlug?: string;
  varizaPayUrl?: string;
  expiresAt?: string;
  paymentRef?: string;
}

export function validateBookingSeats(screeningId: string, seatIds: string[]): {
  screening: Screening;
  totalAmount: number;
  seatDetails: Booking['seatDetails'];
} {
  const db = getDb();
  const screening = db.screenings.find((s) => s.id === screeningId);
  if (!screening) {
    throw new Error('رویداد اکران یافت نشد.');
  }

  let totalAmount = 0;
  const seatDetails: Booking['seatDetails'] = [];

  for (const sId of seatIds) {
    const seat = screening.seatMap.seats.find((s) => s.id === sId);
    if (!seat) {
      throw new Error(`صندلی با شناسه ${sId} در سالن موجود نیست.`);
    }
    if (seat.type === 'aisle' || seat.type === 'blocked') {
      throw new Error(`صندلی ${seat.rowLabel}${seat.seatNumber} قابل خرید نیست.`);
    }
    if (seat.status === 'sold') {
      throw new Error(`صندلی ردیف ${seat.rowLabel} شماره ${seat.seatNumber} قبلاً رزرو شده است.`);
    }
    totalAmount += seat.price;
    seatDetails.push({
      seatId: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      type: seat.type,
      price: seat.price,
    });
  }

  return { screening, totalAmount, seatDetails };
}

export function createBooking(params: CreateBookingParams): Booking {
  const db = getDb();
  const screening = db.screenings.find((s) => s.id === params.screeningId);
  if (!screening) {
    throw new Error('رویداد اکران یافت نشد.');
  }

  // Check seat availability
  const seatsToBook: Seat[] = [];
  for (const sId of params.seatIds) {
    const seat = screening.seatMap.seats.find((s) => s.id === sId);
    if (!seat) {
      throw new Error(`صندلی با شناسه ${sId} در سالن موجود نیست.`);
    }
    if (seat.type === 'aisle' || seat.type === 'blocked') {
      throw new Error(`صندلی ${seat.rowLabel}${seat.seatNumber} قابل خرید نیست.`);
    }
    if (seat.status === 'sold') {
      throw new Error(`صندلی ردیف ${seat.rowLabel} شماره ${seat.seatNumber} قبلاً رزرو شده است.`);
    }
    seatsToBook.push(seat);
  }

  const bookingId = params.id || `ORB-${Math.floor(100000 + Math.random() * 900000)}`;
  const paymentRef =
    params.paymentRef ||
    (params.varizaSlug ? `VRZ-${params.varizaSlug}` : `PAY-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const now = new Date().toISOString();

  let totalAmount = 0;
  const seatDetails: Booking['seatDetails'] = [];

  for (const seat of seatsToBook) {
    seat.status = 'sold';
    seat.bookedBy = {
      buyerName: params.buyerName,
      buyerPhone: params.buyerPhone,
      bookingId,
      bookedAt: now,
    };
    totalAmount += seat.price;
    seatDetails.push({
      seatId: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      type: seat.type,
      price: seat.price,
    });
  }

  const newBooking: Booking = {
    id: bookingId,
    screeningId: screening.id,
    movieTitleFa: screening.titleFa,
    movieTitleEn: screening.titleEn,
    city: screening.city,
    venueName: screening.venueName,
    venueAddress: screening.venueAddress,
    date: screening.date,
    time: screening.time,
    buyerName: params.buyerName,
    buyerPhone: params.buyerPhone,
    seatIds: params.seatIds,
    seatDetails,
    totalAmount,
    status: params.status || 'confirmed',
    createdAt: now,
    paymentRef,
    varizaSlug: params.varizaSlug,
    varizaPayUrl: params.varizaPayUrl,
    expiresAt: params.expiresAt,
  };

  db.bookings.unshift(newBooking);
  saveDb(db);

  return newBooking;
}

export interface VarizaWebhookConfirmParams {
  slug: string;
  attemptCode: string;
  amount: number;
  sentAt?: string;
  memberPhone?: string | null;
}

export function confirmBookingByVarizaWebhook(
  params: VarizaWebhookConfirmParams
): { booking: Booking | null; alreadyProcessed: boolean } {
  const db = getDb();
  if (!db.processedWebhooks) {
    db.processedWebhooks = [];
  }

  // 1. Strict idempotency check by attemptCode
  if (params.attemptCode && db.processedWebhooks.includes(params.attemptCode)) {
    const existing =
      db.bookings.find(
        (b) => b.attemptCode === params.attemptCode || b.varizaSlug === params.slug
      ) || null;
    return { booking: existing, alreadyProcessed: true };
  }

  // 2. Locate booking by Variza payment link slug (or booking ID fallback)
  const booking = db.bookings.find(
    (b) =>
      (b.varizaSlug && b.varizaSlug === params.slug) ||
      b.id.toUpperCase() === params.slug.toUpperCase()
  );

  if (!booking) {
    return { booking: null, alreadyProcessed: false };
  }

  // 3. Idempotency check if booking is already confirmed
  if (booking.status === 'confirmed' && booking.attemptCode) {
    if (params.attemptCode && !db.processedWebhooks.includes(params.attemptCode)) {
      db.processedWebhooks.push(params.attemptCode);
      saveDb(db);
    }
    return { booking, alreadyProcessed: true };
  }

  // 4. Verify amount matches if provided
  if (params.amount > 0 && booking.totalAmount !== params.amount) {
    console.warn(
      `[Variza Webhook] Amount mismatch for booking ${booking.id}: expected ${booking.totalAmount}, got ${params.amount}`
    );
  }

  const paidTime = params.sentAt || new Date().toISOString();
  booking.status = 'confirmed';
  booking.attemptCode = params.attemptCode;
  booking.paymentRef = params.attemptCode || booking.paymentRef;
  booking.paidAt = paidTime;

  // 5. Ensure corresponding seats are marked sold for this buyer
  const screening = db.screenings.find((s) => s.id === booking.screeningId);
  if (screening) {
    for (const sId of booking.seatIds) {
      const seat = screening.seatMap.seats.find((s) => s.id === sId);
      if (seat && seat.type !== 'aisle' && seat.type !== 'blocked') {
        seat.status = 'sold';
        seat.bookedBy = {
          buyerName: booking.buyerName,
          buyerPhone: booking.buyerPhone,
          bookingId: booking.id,
          bookedAt: paidTime,
        };
      }
    }
  }

  if (params.attemptCode) {
    db.processedWebhooks.push(params.attemptCode);
  }

  saveDb(db);
  return { booking, alreadyProcessed: false };
}

export function deleteBooking(bookingId: string): boolean {
  const db = getDb();
  const cleanId = bookingId.trim().toUpperCase();
  const bookingIndex = db.bookings.findIndex((b) => b.id.toUpperCase() === cleanId);
  if (bookingIndex === -1) {
    throw new Error('رزرو یا بلیت مورد نظر یافت نشد.');
  }

  const booking = db.bookings[bookingIndex];

  // Free the reserved seats in the corresponding screening
  const screening = db.screenings.find((s) => s.id === booking.screeningId);
  if (screening) {
    for (const seat of screening.seatMap.seats) {
      if (
        (booking.seatIds && booking.seatIds.includes(seat.id)) ||
        seat.bookedBy?.bookingId?.toUpperCase() === cleanId
      ) {
        seat.status = 'available';
        seat.bookedBy = undefined;
      }
    }
  }

  // Remove the booking from db.bookings
  db.bookings.splice(bookingIndex, 1);
  saveDb(db);
  return true;
}

// Admin seat hold / unsellable operations
export function toggleSeatAdminHold(
  screeningId: string,
  seatId: string
): { screening: Screening; seat: Seat; action: 'blocked' | 'unblocked' } {
  const db = getDb();
  const screening = db.screenings.find((s) => s.id === screeningId);
  if (!screening) {
    throw new Error('رویداد اکران یافت نشد.');
  }

  const seat = screening.seatMap.seats.find((s) => s.id === seatId);
  if (!seat) {
    throw new Error('صندلی مورد نظر در این سالن یافت نشد.');
  }

  if (seat.type === 'aisle') {
    throw new Error('امکان تغییر وضعیت راهرو وجود ندارد.');
  }

  let action: 'blocked' | 'unblocked' = 'blocked';

  // If already held by admin, unblock it
  if (
    seat.bookedBy?.bookingId === 'ORB-ADMIN-HOLD' ||
    seat.bookedBy?.buyerName === 'رزرو مدیریت (غیرقابل فروش)'
  ) {
    seat.status = 'available';
    seat.bookedBy = undefined;
    action = 'unblocked';
  } else if (seat.status === 'sold') {
    throw new Error(
      'این صندلی قبلاً توسط مشتری خریداری شده است. برای لغو ابتدا آن را از جدول تماشاچیان حذف کنید.'
    );
  } else {
    // Block it so customers see it as occupied / sold
    seat.status = 'sold';
    seat.bookedBy = {
      buyerName: 'رزرو مدیریت (غیرقابل فروش)',
      buyerPhone: 'مدیریت اوربیت',
      bookingId: 'ORB-ADMIN-HOLD',
      bookedAt: new Date().toISOString(),
    };
    action = 'blocked';
  }

  saveDb(db);
  return { screening, seat, action };
}

export function batchSetSeatsAdminHold(
  screeningId: string,
  seatIds: string[],
  hold: boolean
): { screening: Screening; updatedCount: number } {
  const db = getDb();
  const screening = db.screenings.find((s) => s.id === screeningId);
  if (!screening) {
    throw new Error('رویداد اکران یافت نشد.');
  }

  let updatedCount = 0;
  for (const sId of seatIds) {
    const seat = screening.seatMap.seats.find((s) => s.id === sId);
    if (!seat || seat.type === 'aisle') continue;

    if (hold) {
      if (seat.status === 'available') {
        seat.status = 'sold';
        seat.bookedBy = {
          buyerName: 'رزرو مدیریت (غیرقابل فروش)',
          buyerPhone: 'مدیریت اوربیت',
          bookingId: 'ORB-ADMIN-HOLD',
          bookedAt: new Date().toISOString(),
        };
        updatedCount++;
      }
    } else {
      if (
        seat.bookedBy?.bookingId === 'ORB-ADMIN-HOLD' ||
        seat.bookedBy?.buyerName === 'رزرو مدیریت (غیرقابل فروش)'
      ) {
        seat.status = 'available';
        seat.bookedBy = undefined;
        updatedCount++;
      }
    }
  }

  saveDb(db);
  return { screening, updatedCount };
}

// Venue templates operations
export function getVenueTemplates(): VenueTemplate[] {
  const db = getDb();
  return db.venueTemplates || [];
}

export function saveVenueTemplate(template: Omit<VenueTemplate, 'id'> & { id?: string }): VenueTemplate {
  const db = getDb();
  const id = template.id || `tpl-${Date.now()}`;
  const fullTemplate: VenueTemplate = {
    ...template,
    id,
  };

  const existingIndex = db.venueTemplates.findIndex((t) => t.id === id);
  if (existingIndex >= 0) {
    db.venueTemplates[existingIndex] = fullTemplate;
  } else {
    db.venueTemplates.push(fullTemplate);
  }

  saveDb(db);
  return fullTemplate;
}

export function deleteVenueTemplate(id: string): boolean {
  const db = getDb();
  const initialLen = db.venueTemplates.length;
  db.venueTemplates = db.venueTemplates.filter((t) => t.id !== id);
  if (db.venueTemplates.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// Admin management operations
export function getAdmins(): AdminUser[] {
  const db = getDb();
  return db.admins || [];
}

export function getAdminById(id: string): AdminUser | null {
  const db = getDb();
  return db.admins.find((a) => a.id === id) || null;
}

export function getAdminByUsername(username: string): AdminUser | null {
  const db = getDb();
  return db.admins.find((a) => a.username.toLowerCase() === username.trim().toLowerCase()) || null;
}

export function createAdmin(data: {
  username: string;
  password: string;
  name: string;
  role?: 'superadmin' | 'admin';
}): AdminUser {
  const db = getDb();
  const cleanUsername = data.username.trim().toLowerCase();

  if (db.admins.some((a) => a.username.toLowerCase() === cleanUsername)) {
    throw new Error('این نام کاربری قبلاً توسط مدیر دیگری ثبت شده است.');
  }

  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}`,
    username: cleanUsername,
    password: data.password.trim(),
    name: data.name.trim(),
    role: data.role || 'admin',
    createdAt: new Date().toISOString(),
  };

  db.admins.push(newAdmin);
  saveDb(db);
  return newAdmin;
}

export function updateAdmin(
  id: string,
  data: Partial<{ username: string; password: string; name: string; role: 'superadmin' | 'admin' }>
): AdminUser {
  const db = getDb();
  const index = db.admins.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error('مدیر مورد نظر یافت نشد.');
  }

  if (data.username) {
    const cleanUsername = data.username.trim().toLowerCase();
    const existing = db.admins.find((a) => a.username.toLowerCase() === cleanUsername && a.id !== id);
    if (existing) {
      throw new Error('این نام کاربری توسط مدیر دیگری استفاده شده است.');
    }
    db.admins[index].username = cleanUsername;
  }

  if (data.password && data.password.trim().length > 0) {
    db.admins[index].password = data.password.trim();
  }

  if (data.name) {
    db.admins[index].name = data.name.trim();
  }

  if (data.role) {
    db.admins[index].role = data.role;
  }

  saveDb(db);
  return db.admins[index];
}

export function deleteAdmin(id: string): boolean {
  const db = getDb();
  if (db.admins.length <= 1) {
    throw new Error('حداقل یک مدیر در سامانه باید وجود داشته باشد.');
  }

  const initialLen = db.admins.length;
  db.admins = db.admins.filter((a) => a.id !== id);
  if (db.admins.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// Site settings operations
export function getSiteSettings(): SiteSettings {
  const db = getDb();
  return (
    db.settings || {
      logoUrl: '',
      brandName: 'ORBIT',
      brandSubtitle: 'اکران‌های اختصاصی',
      brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
      aboutTitle: 'درباره پلتفرم اکران‌های اختصاصی اوربیت',
      aboutText: 'اوربیت (ORBIT Screenings) جامعه و پلتفرمی مستقل برای اکران‌های اختصاصی و رویدادمحور برترین آثار سینمای جهان و انیمه‌های برجسته است. ما با همکاری بهترین سالن‌های سینمایی مجهز به پیشرفته‌ترین سیستم‌های صوت دالبی اتموس و تصویر کریستالی در شهرهای تهران، شیراز، اصفهان، مشهد و تبریز، تجربه‌ای بی‌نظیر و تکرارنشدنی را برای دوستداران سینما و انیمه خلق می‌کنیم.',
      aboutVision: 'هدف ما ایجاد بستری مدرن، شفاف و بدون دغدغه برای گردهمایی علاقه‌مندان به سینما و تجربه مشترک شاهکارهای پرده نقره‌ای با بالاترین کیفیت ممکن است.',
      contactEmail: 'contact@orbit-cinema.ir',
      contactPhone: '۰۲۱-۸۸۹۹۰۰۱۱',
      contactAddress: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۸',
      contactInstagram: 'orbit_screenings',
      contactTelegram: 'orbit_screenings',
      seatHoldMinutes: 30,
      paymentExpiresIn: '30m',
      varizaCardLast4: '8589',
      appUrl: 'https://small-crabs-say.loca.lt',
    }
  );
}

export function updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
  const db = getDb();
  db.settings = {
    ...getSiteSettings(),
    ...updates,
  };
  saveDb(db);
  return db.settings;
}

// Support Tickets operations
export function getSupportTickets(): SupportTicket[] {
  const db = getDb();
  return db.tickets || [];
}

export function createSupportTicket(data: {
  name: string;
  phone: string;
  ticketId?: string;
  subject: string;
  message: string;
}): SupportTicket {
  const db = getDb();
  if (!db.tickets) {
    db.tickets = [];
  }

  const id = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
  const newTicket: SupportTicket = {
    id,
    name: data.name.trim(),
    phone: data.phone.trim(),
    ticketId: data.ticketId ? data.ticketId.trim().toUpperCase() : '',
    subject: data.subject.trim(),
    message: data.message.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.tickets.unshift(newTicket);
  saveDb(db);
  return newTicket;
}

export function updateSupportTicketStatus(id: string, status: 'pending' | 'resolved'): SupportTicket {
  const db = getDb();
  if (!db.tickets) {
    throw new Error('تیکتی ثبت نشده است.');
  }

  const ticketIndex = db.tickets.findIndex((t) => t.id === id);
  if (ticketIndex === -1) {
    throw new Error('تیکت با این مشخصات یافت نشد.');
  }

  db.tickets[ticketIndex].status = status;
  saveDb(db);
  return db.tickets[ticketIndex];
}

export function deleteSupportTicket(id: string): boolean {
  const db = getDb();
  if (!db.tickets) return false;

  const initialLen = db.tickets.length;
  db.tickets = db.tickets.filter((t) => t.id !== id);
  if (db.tickets.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}
