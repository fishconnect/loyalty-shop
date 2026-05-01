// Menu data — แก้ไขได้ที่นี่ที่เดียว
window.SHOP_INFO = {
  name: "ครัวผู้ใหญ่ปอง",
  tagline: "อาหารตามสั่ง · ก๋วยเตี๋ยว · เครื่องดื่ม",
  phone: "061-962-3696",
  logo: "logo.jpg",
  defaultImage: "assets/menu-placeholder.jpg",
};

// ============================================
// Option presets
// ============================================
const _EGGS_5 = ['ไข่ดาวสุก', 'ไข่ดาวไม่สุก', 'ไข่เจียว', 'ไข่ต้ม'];
const _NOODLES_KT = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];   // ก๋วยเตี๋ยว 6 แบบ
const _NOODLES_PS = ['เส้นใหญ่', 'เส้นหมี่', 'เส้นมาม่า', 'เส้นเล็ก'];                    // ผัดซีอิ๊ว/ราดหน้า 4 แบบ

// 🆕 เพิ่มพิเศษ +10 — ใช้ร่วมเกือบทุกเมนู (ยกเว้นทานเล่น/ข้าวเปล่า/เครื่องดื่ม)
const OPT_EXTRA = () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 10, choices: ['พิเศษ'] });
// 🆕 เพิ่มพิเศษ +20 — ต้มยำ/ต้มจืด
const OPT_EXTRA_20 = () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 20, choices: ['พิเศษ'] });
// 🆕 พิเศษ +10 + กับข้าว +30 — รวมในกลุ่มเดียว ใช้ per-choice price
const OPT_EXTRA_AND_KAB_30 = () => ({
  kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0,
  choices: ['พิเศษ', 'กับข้าว'],
  prices: { 'พิเศษ': 10, 'กับข้าว': 30 }
});
// 🆕 พิเศษ +10 + กับข้าว +10 — สำหรับยำไข่เจียว/ยำไข่ดาว
const OPT_EXTRA_AND_KAB_10 = () => ({
  kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0,
  choices: ['พิเศษ', 'กับข้าว'],
  prices: { 'พิเศษ': 10, 'กับข้าว': 10 }
});

// Helper: per-choice prices for premium proteins (ลูกค้าเลือกข้ามรายการได้ในกลุ่มเดียว)
// Free = 0 (รวมในราคาอาหาร) — Premium = +10 (กุ้ง/ปลาหมึก/หมูกรอบ/รวมมิตร/ไข่เยี้ยวม้า/ไข่ข้น)
const PROTEIN_PREMIUM_PRICES = {
  'กุ้ง': 10, 'ปลาหมึก': 10, 'หมูกรอบ': 10,
  'รวมมิตร(หมู+หมึก+กุ้ง)': 10, 'ไข่เยี้ยวม้า': 10, 'ไข่ข้น': 10
};

// 1) ราดข้าวกะเพรา group: เนื้อ 1-3 (รวมเนื้อพื้นฐาน + พรีเมี่ยม +10) + เผ็ด + ไข่ +5 + เพิ่มพิเศษ + กับข้าว +30
const OPT_KAPRAO = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (1-3 อย่าง · บางรายการ +10฿)',
    min: 1, max: 3, priceEach: 0,
    choices: ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'หน่อไม้ดอง',
              'หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)', 'ไข่เยี้ยวม้า', 'ไข่ข้น'],
    prices: PROTEIN_PREMIUM_PRICES },
  OPT_SPICE_LEVEL(),
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 1b) ราดข้าว ผัดผัก (ไฟแดง): เนื้อ/ผัก 1-3 + เผ็ด + ไข่ +5 + เพิ่มพิเศษ + กับข้าว
const OPT_FAIDAENG = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ/ผัก (1-3 อย่าง · บางรายการ +10฿)',
    min: 1, max: 3, priceEach: 0,
    choices: ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'คะน้า', 'ผักบุ้ง', 'ผักรวม',
              'หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)', 'ไข่เยี้ยวม้า', 'ไข่ข้น'],
    prices: PROTEIN_PREMIUM_PRICES },
  OPT_SPICE_LEVEL(),
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 2) ข้าวผัด: เนื้อ 1 (รวมเนื้อพื้นฐาน + พรีเมี่ยม +10) + ไข่ +5 + เพิ่มพิเศษ
const OPT_KAOPAD = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +10฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่', 'แหนม',
              'หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA()
]);

// 2b) ราดข้าว-ไข่เจียว: เนื้อ 1 (พื้นฐาน + พรีเมี่ยม +10) + เพิ่มพิเศษ + กับข้าว
const OPT_KAOPAD_KAI = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +10฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูสับ', 'ไก่สับ', 'แหนม',
              'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  OPT_EXTRA_AND_KAB_30()
]);

// 2c) มาม่าผัดขึ้เมา / ผัดมาม่า: เนื้อ 1 (พื้นฐาน + พรีเมี่ยม +10) + ไข่ +5 + เพิ่มพิเศษ
const OPT_NOODLE_STIRFRY = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +10฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่',
              'หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA()
]);

// 2d) ต้มยำ: เนื้อ 1-3 (พื้นฐาน + พรีเมี่ยม +10) + เผ็ด + เพิ่มพิเศษ +20
const OPT_TOMYUM_DISH = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (1-3 อย่าง · บางรายการ +10฿)',
    min: 1, max: 3, priceEach: 0,
    choices: ['หมูสับ', 'หมูชิ้น', 'ไก่',
              'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  OPT_SPICE_LEVEL(),
  OPT_EXTRA_20()
]);

// 2e) ต้มจืด: แค่เพิ่มพิเศษ +20
const OPT_TOMJUED = () => ([ OPT_EXTRA_20() ]);

// 3) ผัดซีอิ๊ว: เนื้อ 1 (พื้นฐาน + พรีเมี่ยม +10) + เลือกเส้น (จำเป็น) + เพิ่มพิเศษ
const OPT_PADSEEW = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +10฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่',
              'หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] },
  OPT_EXTRA()
]);

// 4) ราดหน้า: เนื้อ 1 (พื้นฐาน + พรีเมี่ยม +10) + เลือกเส้น (จำเป็น) + เพิ่มพิเศษ
const OPT_RADNAA = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +10฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่',
              'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: PROTEIN_PREMIUM_PRICES },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] },
  OPT_EXTRA()
]);

// 5) สุกี้: เนื้อ 1 (พื้นฐาน + พรีเมี่ยม +5) + เพิ่มพิเศษ
// (สุกี้ใช้ +5 ไม่ใช่ +10 — กำหนด price แยกที่ choice)
const OPT_SUKI = () => ([
  { kind: 'required',
    label: 'เลือกเนื้อ (เลือก 1 · บางรายการ +5฿)',
    min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'ไก่',
              'กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'],
    prices: { 'กุ้ง': 5, 'ปลาหมึก': 5, 'รวมมิตร(หมู+หมึก+กุ้ง)': 5 } },
  OPT_EXTRA()
]);

// 6) เมนูพิเศษ: ไข่ +5 + เพิ่มพิเศษ + กับข้าว +30
const OPT_EGG_ONLY = () => ([
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 6b) ยำ ทั่วไป (มีแค่เพิ่มพิเศษ)
const OPT_EXTRA_ONLY = () => ([ OPT_EXTRA() ]);

// 6c) ราดข้าว ยำไข่เจียว / ยำไข่ดาว (เพิ่มพิเศษ + กับข้าว ราคาถูกพิเศษ)
const OPT_YAM_RICE = () => ([ OPT_EXTRA_AND_KAB_10() ]);

// 7) ก๋วยเตี๋ยว/เย็นตาโฟ ปกติ: เลือกเส้น 6 แบบ + เพิ่มพิเศษ
const OPT_NOODLE_ONLY = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] },
  OPT_EXTRA()
]);

// 8) ต้มยำ / ก๋วยเตี๋ยวแห้ง: เลือกเส้น + รวมมิตรทะเล +10 + เพิ่มพิเศษ
const OPT_NOODLE_TOMYUM = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] },
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] },
  OPT_EXTRA()
]);

// 9) เกี๋ยว / เกาเหลา: รวมมิตรทะเล +10 + เพิ่มพิเศษ
const OPT_KIEW = () => ([
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] },
  OPT_EXTRA()
]);

// 🌶️ ระดับความเผ็ด — ฟรี (รวมในราคาอาหาร) เลือก 1 อย่าง
const OPT_SPICE_LEVEL = () => ({
  kind: 'required', label: '🌶️ ระดับความเผ็ด', min: 1, max: 1, priceEach: 0,
  choices: ['ไม่เผ็ด', 'น้อย', 'กลาง', 'มาก', 'พิเศษ (จัดเต็ม)']
});

// 🍯 ระดับความหวาน — ฟรี เลือก 1 อย่าง (สำหรับเครื่องดื่ม)
const OPT_SWEETNESS = () => ({
  kind: 'required', label: '🍯 ระดับความหวาน', min: 1, max: 1, priceEach: 0,
  choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก']
});

// 10) เครื่องดื่มที่ปั่นได้: หวาน + ปั่น +5 (optional, max 1)
const OPT_DRINK_BLEND = () => ([
  OPT_SWEETNESS(),
  { kind: 'addOn', label: 'ตัวเลือก (+5)', min: 0, max: 1, priceEach: 5, choices: ['ปั่น'] }
]);

// 10b) ชานมไต้หวั่น: หวาน + 4 ตัวเลือก +5 each
const OPT_DRINK_TAIWAN = () => ([
  OPT_SWEETNESS(),
  { kind: 'addOn', label: 'ตัวเลือกพิเศษ (+5)', min: 0, max: 99, priceEach: 5, choices: ['ปั่น', 'ไข่มุก', 'บุก', 'ฟรุ๊ตสลัด'] }
]);

// ============================================
// MENU
// ============================================
window.MENU = [
  {
    cat: "ราดข้าวกะเพรา",
    emoji: "🌶️",
    items: [
      { id: 'rd-001', name: 'ราดข้าว ผัดกระเพรา',         price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-002', name: 'ราดข้าว ใบโหรพา พริกแห้ง',    price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-003', name: 'ราดข้าว ผัดพริกแกง',          price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-010', name: 'ราดข้าว พะแนง',                price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-004', name: 'ราดข้าว ทอดกระเทียม',         price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-005', name: 'ราดข้าว ผัดฉ่า',               price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-006', name: 'ราดข้าว ผัดผัก (ไฟแดง)',      price: 40, optionGroups: OPT_FAIDAENG() },
      { id: 'rd-007', name: 'ราดข้าว พริกสด',               price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-008', name: 'ราดข้าว พริกเผา',              price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-009', name: 'ราดข้าว น้ำมันหอย',            price: 40, optionGroups: OPT_KAPRAO() },
    ]
  },
  {
    cat: "ข้าวผัด / ผัดเส้น",
    emoji: "🍚",
    items: [
      { id: 'sf-001', name: 'ข้าวผัด',           price: 40, optionGroups: OPT_KAOPAD() },
      { id: 'sf-004', name: 'ราดข้าว-ไข่เจียว',  price: 40, optionGroups: OPT_KAOPAD_KAI() },
      { id: 'sf-002', name: 'ผัดซีอิ๊ว',          price: 40, optionGroups: OPT_PADSEEW() },
      { id: 'sf-005', name: 'มาม่าผัดขึ้เมา',     price: 40, optionGroups: OPT_NOODLE_STIRFRY() },
      { id: 'sf-006', name: 'ผัดมาม่า',           price: 40, optionGroups: OPT_NOODLE_STIRFRY() },
      { id: 'sf-003', name: 'ราดหน้า',           price: 40, optionGroups: OPT_RADNAA() },
    ]
  },
  {
    cat: "สุกี้",
    emoji: "🍲",
    items: [
      { id: 'sk-001', name: 'สุกี้น้ำ',  price: 45, optionGroups: OPT_SUKI() },
      { id: 'sk-002', name: 'สุกี้แห้ง', price: 45, optionGroups: OPT_SUKI() },
    ]
  },
  {
    cat: "เมนูพิเศษ ⭐",
    emoji: "⭐",
    items: [
      { id: 'sp-001', name: 'ราดข้าว ปลาหมึกผัดไข่เค็ม',          price: 60, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-002', name: 'ราดข้าว ผัดเผ็ดหมูป่า',                price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-003', name: 'ราดข้าว ผัดกระเพราหมูป่า',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-004', name: 'ราดข้าว ผัดพริกปลาดุกสด',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-005', name: 'ราดข้าว ผัดพริกปลาดุกทอด',             price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-006', name: 'ราดข้าว สามชั้นทอดน้ำปลา',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-007', name: 'ราดข้าว สามชั้นคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-008', name: 'ราดข้าว หมูกรอบคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-009', name: 'ราดข้าว ห่อหมกทะเลไข่ข้น',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-010', name: 'ราดข้าว กระเพราหมูสับใส้กรอกแดง',       price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-011', name: 'ราดข้าว กระเพราหมูสับ + หมูยอ',         price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-012', name: 'ราดข้าว ผัดเต้าหู้หมูสับ',               price: 40, optionGroups: OPT_EGG_ONLY() },
    ]
  },
  {
    cat: "ยำ",
    emoji: "🥗",
    items: [
      { id: 'ym-001', name: 'ยำวุ้นเส้นรวมมิตร',     price: 50, optionGroups: OPT_EXTRA_ONLY() },
      { id: 'ym-002', name: 'ยำมาม่ารวมมิตร',          price: 50, optionGroups: OPT_EXTRA_ONLY() },
      { id: 'ym-003', name: 'ยำรวมมิตร (ไม่ใส่เส้น)', price: 50, optionGroups: OPT_EXTRA_ONLY() },
      { id: 'ym-004', name: 'ยำไข่เยี่ยวม้า',          price: 50, optionGroups: OPT_EXTRA_ONLY() },
      { id: 'ym-005', name: 'ราดข้าว ยำไข่เจียว',     price: 40, optionGroups: OPT_YAM_RICE() },
      { id: 'ym-006', name: 'ราดข้าว ยำไข่ดาว',       price: 40, optionGroups: OPT_YAM_RICE() },
    ]
  },
  {
    cat: "ต้มยำ / ต้มจืด",
    emoji: "🍲",
    items: [
      { id: 'ty-001', name: 'ต้มยำน้ำข้น',         price: 70, optionGroups: OPT_TOMYUM_DISH() },
      { id: 'ty-002', name: 'ต้มยำน้ำใส',         price: 60, optionGroups: OPT_TOMYUM_DISH() },
      { id: 'ty-003', name: 'ต้มจืดเต้าหู้หมูสับ', price: 60, optionGroups: OPT_TOMJUED() },
    ]
  },
  {
    cat: "ทานเล่น / สเต๊ก",
    emoji: "🍗",
    items: [
      { id: 'tn-001', name: 'สเต็กสันคอ',              price: 89 },
      { id: 'tn-002', name: 'เฟร์นฟรายทอด',            price: 39 },
      { id: 'tn-003', name: 'ไก่ป๊อบ',                  price: 49 },
      { id: 'tn-004', name: 'เฟร์นฟรายทอด + ไก่ป๊อบ',  price: 59 },
    ]
  },
  {
    cat: "ข้าว / ของเสริม",
    emoji: "🍚",
    items: [
      { id: 'rc-001', name: 'ข้าวเปล่า', price: 5 },
    ]
  },
  {
    cat: "ก๋วยเตี๋ยว / เย็นตาโฟ",
    emoji: "🍜",
    items: [
      { id: 'kt-001', name: 'ก๋วยเตี๋ยวหมูน้ำใส', price: 30, optionGroups: OPT_NOODLE_ONLY() },
      { id: 'kt-002', name: 'ก๋วยเตี๋ยวต้มยำ',     price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
      { id: 'kt-005', name: 'ก๋วยเตี๋ยวแห้ง',      price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
      { id: 'kt-003', name: 'เย็นตาโฟ',             price: 30, optionGroups: OPT_NOODLE_ONLY() },
      { id: 'kt-004', name: 'เย็นตาโฟต้มยำ',       price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
    ]
  },
  {
    cat: "เกี๋ยว",
    emoji: "🍝",
    items: [
      { id: 'kw-001', name: 'เกี๋ยวน้ำหมูแดง',         price: 40, optionGroups: OPT_KIEW() },
      { id: 'kw-002', name: 'บะหมี่เกี๋ยวน้ำ-หมูแดง', price: 40, optionGroups: OPT_KIEW() },
    ]
  },
  {
    cat: "เกาเหลา",
    emoji: "🍲",
    items: [
      { id: 'kl-001', name: 'เกาเหลาหมู น้ำใส',        price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-002', name: 'เกาเหลาเย็นตาโฟ',         price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-003', name: 'เกาเหลาหมู ต้มยำ',        price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-004', name: 'เกาเหลาเย็นตาโฟ ต้มยำ',  price: 40, optionGroups: OPT_KIEW() },
    ]
  },
  {
    cat: "เครื่องดื่ม - ชา/กาแฟ/นม",
    emoji: "🥤",
    items: [
      { id: 'dr-001', name: 'ชานมไต้หวั่น', price: 25, optionGroups: OPT_DRINK_TAIWAN() },
      { id: 'dr-002', name: 'ชาไทย',          price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-003', name: 'ชาเขียว',        price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-004', name: 'กาแฟสด',         price: 35, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-005', name: 'กาแฟเนส',        price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-006', name: 'โกโก้',           price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-007', name: 'นมชมพู',          price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-008', name: 'ชาดำเย็น',        price: 20, optionGroups: OPT_DRINK_BLEND() },
    ]
  },
  {
    cat: "เครื่องดื่ม - โซดาผลไม้",
    emoji: "🍹",
    items: [
      { id: 'dr-101', name: 'น้ำแดงโซดา',       price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-102', name: 'น้ำเขียวโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-103', name: 'สเตอร์เบอรี่โซดา', price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-104', name: 'บลูฮาวายโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-105', name: 'ลิ้นจี่โซดา',       price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-106', name: 'สัปปะรดโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
    ]
  },
  {
    cat: "เครื่องดื่ม - แก้วโอ่ง",
    emoji: "🧊",
    items: [
      { id: 'dr-201', name: 'โค๊กแก้วโอ่ง',                price: 20 },
      { id: 'dr-202', name: 'น้ำแดงแฟนต้าแก้วโอ่ง',      price: 20 },
      { id: 'dr-203', name: 'น้ำเขียวแฟนต้าแก้วโอ่ง',     price: 20 },
      { id: 'dr-204', name: 'น้ำส้มแฟนต้าแก้วโอ่ง',       price: 20 },
      { id: 'dr-205', name: 'สไปร์แก้วโอ่ง',               price: 20 },
      { id: 'dr-206', name: 'น้ำแข็งเปล่าแก้วโอ่ง',        price: 5 },
      { id: 'dr-207', name: 'น้ำแข็งตักถุง (เล็ก)',          price: 5 },
      { id: 'dr-208', name: 'น้ำแข็งตักถุง (ใหญ่)',          price: 10 },
      { id: 'dr-209', name: 'โค๊กขวดแก้ว',                   price: 12 },
    ]
  },
];

// ============================================
// FACTORY MENU — เมนูสำหรับโรงงาน (50฿/จาน, ไม่ร่วมโปรแต้ม)
// ============================================
const _F_EGG = ['ไข่ดาว', 'ไข่เจียว'];
const _F_NOODLES = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];

// Free egg add-on (ฟรี รวมในราคาแล้ว)
const F_OPT_FREE_EGG = () => ({
  kind: 'addOn', label: '🥚 ฟรี ไข่ดาว/ไข่เจียว (เลือก 1)',
  min: 0, max: 1, priceEach: 0, choices: [..._F_EGG]
});

// Protein presets
const F_PROTEIN_BASIC = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูชิ้น', 'หมูสับ', 'ไก่']
});
const F_PROTEIN_BASIC_SEA = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูชิ้น', 'หมูสับ', 'ไก่', 'รวมมิตรทะเล']
});
const F_PROTEIN_SEA = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร']
});
const F_NOODLE_CHOICE = () => ({
  kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._F_NOODLES]
});
const F_NOODLE_TOPPING = () => ({
  kind: 'required', label: 'เลือกเนื้อ (ฟรี)', min: 1, max: 1, priceEach: 0,
  choices: ['หมู', 'รวมมิตรทะเล']
});

window.FACTORY_MENU = [
  {
    cat: "ผัด / ราดข้าว",
    emoji: "🌶️",
    items: [
      { id: 'fc-001', name: 'ผัดกระเพรา',          price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-002', name: 'ผัดกระเพรารวมมิตร',    price: 50, optionGroups: [F_PROTEIN_SEA()] },
      { id: 'fc-003', name: 'ผัดพริกแกง',           price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-004', name: 'ผัดพริกแกงรวมมิตร',    price: 50, optionGroups: [F_PROTEIN_SEA()] },
      { id: 'fc-005', name: 'ผัดพะแนง',              price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-006', name: 'ผัดพริกสด',             price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-007', name: 'ราดหน้า',               price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-008', name: 'ผัดซีอิ๊ว',              price: 50, optionGroups: [F_PROTEIN_BASIC_SEA(), { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['เส้นใหญ่', 'เส้นเล็ก', 'เส้นหมี่', 'เส้นมาม่า'] }] },
    ]
  },
  {
    cat: "ข้าวผัด / ข้าวต้ม",
    emoji: "🍚",
    items: [
      { id: 'fc-101', name: 'ข้าวผัด',           price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-102', name: 'ข้าวผัดรวมมิตร',     price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-103', name: 'ข้าวต้ม',            price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-104', name: 'มาม่าผัดขี้เมา',     price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
    ]
  },
  {
    cat: "สุกี้ / ยำ",
    emoji: "🍲",
    items: [
      { id: 'fc-201', name: 'สุกี้น้ำ',  price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-202', name: 'สุกี้แห้ง', price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-203', name: 'ยำรวมมิตร', price: 50, optionGroups: [
        { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['วุ้นเส้น', 'มาม่า'] }
      ] },
    ]
  },
  {
    cat: "ก๋วยเตี๋ยว / เย็นตาโฟ",
    emoji: "🍜",
    items: [
      { id: 'fc-301', name: 'ก๋วยเตี๋ยวหมูน้ำใส', price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-302', name: 'ก๋วยเตี๋ยวต้มยำ',     price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-303', name: 'ก๋วยเตี๋ยวแห้ง',      price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-304', name: 'เย็นตาโฟ',             price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-305', name: 'เย็นตาโฟต้มยำ',       price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
    ]
  },
  {
    cat: "ข้าวพิเศษ",
    emoji: "🍱",
    items: [
      { id: 'fc-401', name: 'ข้าวปลาดุกทอด',           price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-402', name: 'ข้าวปลาดุกผัดพริกแกง',     price: 50 },
      { id: 'fc-403', name: 'ข้าวปลาดุกผัดกระเพรา',     price: 50 },
      { id: 'fc-404', name: 'ข้าวหมูทอด',              price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-405', name: 'ข้าวหมูทอดกระเทียม',     price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-406', name: 'ข้าวไข่เจียวกุ้ง',         price: 50 },
    ]
  },
  {
    cat: "ของแห้ง / อื่นๆ",
    emoji: "🍜",
    items: [
      { id: 'fc-501', name: 'มาม่าน้ำข้น (ของแห้ง)',    price: 50 },
      { id: 'fc-502', name: 'ไข่ดิบ (ของแห้ง)',         price: 50 },
      { id: 'fc-503', name: 'ข้าวเปล่า + ไข่ดิบ',       price: 50 },
      { id: 'fc-504', name: 'ข้าวเปล่า + มาม่าต้มยำ',   price: 50 },
    ]
  },
  {
    cat: "เครื่องดื่ม",
    emoji: "🥤",
    items: [
      { id: 'fc-601', name: 'น้ำโค๊กแก้วโอ่ง', price: 20 },
    ]
  },
];

// ============================================
// Loyalty config — โปรใหม่
// ============================================
window.LOYALTY = {
  POINTS_PER_BAHT: 1 / 50,          // 50฿ = 1 แต้ม
  SIGNUP_BONUS: 5,                   // สมัครครั้งแรก +5
  REWARD_DRINK_POINTS: 10,           // 10 แต้ม = ฟรีเครื่องดื่ม
  REWARD_DISCOUNT_POINTS: 15,        // 15 แต้ม = ลด 50฿
  REWARD_DISCOUNT_AMOUNT: 50,
  AWARD_ON_STATUS: 'delivered',
  // เครื่องดื่มที่ใช้แลกได้ด้วย 10 แต้ม
  // ชานมไต้หวั่น 25฿ + แก้วโอ่ง 20฿ ทุกตัว (ยกเว้นน้ำแข็งเปล่า)
  DRINK_REWARD_IDS: [
    'dr-001',  // ชานมไต้หวั่น 25
    'dr-201',  // โค๊กแก้วโอ่ง 20
    'dr-202',  // น้ำแดงแฟนต้าแก้วโอ่ง 20
    'dr-203',  // น้ำเขียวแฟนต้าแก้วโอ่ง 20
    'dr-204',  // น้ำส้มแฟนต้าแก้วโอ่ง 20
    'dr-205',  // สไปร์แก้วโอ่ง 20
  ],
};

// คำนวณแต้มจากยอดเงิน
window.calcPointsFromAmount = function(amount) {
  return Math.floor((amount || 0) * LOYALTY.POINTS_PER_BAHT);
};

// ============================================
// Helpers
// ============================================
window.calcLinePrice = function(item, selectedOptions) {
  let base = item.price || 0;
  if (item.optionGroups && selectedOptions) {
    item.optionGroups.forEach((g, gi) => {
      const sel = selectedOptions[gi] || [];
      base += (g.priceEach || 0) * sel.length;
    });
  }
  return base;
};

window.formatOptionSummary = function(item, selectedOptions, opts) {
  opts = opts || {};
  if (!item.optionGroups || !selectedOptions) return '';
  const parts = [];
  item.optionGroups.forEach((g, gi) => {
    const sel = selectedOptions[gi] || [];
    sel.forEach(c => {
      const prefix = (g.priceEach > 0) ? '+' : '';
      const suffix = (opts.showPrice && g.priceEach > 0) ? ` (+${g.priceEach})` : '';
      parts.push(prefix + c + suffix);
    });
  });
  return parts.join(opts.sep || ', ');
};

window.countMainDishes = function(items) {
  let count = 0;
  items.forEach(it => {
    if (it.id && it.id.startsWith('add-')) return;
    count += (it.qty || 1);
  });
  return count;
};

window.STATUSES = {
  pending:    { label: 'รอยืนยัน',     custLabel: 'รอร้านยืนยันรายการ', icon: '⏳', color: '#f59e0b', next: 'confirmed', nextLabel: '✓ ยืนยันรายการ', stage: 1 },
  confirmed:  { label: 'ยืนยันแล้ว',    custLabel: 'ร้านยืนยันแล้ว — เตรียมทำอาหาร', icon: '📋', color: '#1652F0', next: 'cooking', nextLabel: '🔥 เริ่มทำอาหาร', stage: 2 },
  cooking:    { label: 'กำลังทำ',       custLabel: 'กำลังทำอาหารให้คุณ', icon: '👨‍🍳', color: '#f97316', next: 'ready', nextLabel: '✓ อาหารเสร็จ — พร้อมส่ง', stage: 3 },
  ready:      { label: 'พร้อมจัดส่ง',   custLabel: 'อาหารเสร็จแล้ว · รอการจัดส่ง', icon: '📦', color: '#16a34a', next: 'delivering', nextLabel: '🚚 รับงานจัดส่ง', stage: 4 },
  delivering: { label: 'กำลังจัดส่ง',   custLabel: 'กำลังจัดส่งให้คุณ', icon: '🚚', color: '#06b6d4', next: 'delivered', nextLabel: '✓ จัดส่งสำเร็จ', stage: 5 },
  delivered:  { label: 'จัดส่งสำเร็จ',  custLabel: 'จัดส่งสำเร็จ ขอบคุณครับ', icon: '✅', color: '#16a34a', next: null, nextLabel: '', stage: 6 },
  done:       { label: 'จัดส่งสำเร็จ',  custLabel: 'จัดส่งสำเร็จ ขอบคุณครับ', icon: '✅', color: '#16a34a', next: null, nextLabel: '', stage: 6 },
  cancelled:  { label: 'ยกเลิก',         custLabel: 'ออเดอร์นี้ถูกยกเลิก', icon: '❌', color: '#dc2626', next: null, nextLabel: '', stage: 0 }
};

// Get unique add-on/option choices from a menu (used by admin to toggle availability)
window.getMenuChoices = function(menu) {
  const map = new Map();
  (menu || []).forEach(cat => {
    cat.items.forEach(it => {
      (it.optionGroups || []).forEach(g => {
        (g.choices || []).forEach(c => {
          if (!map.has(c)) {
            map.set(c, { name: c, priceEach: g.priceEach || 0, sampleLabel: g.label });
          }
        });
      });
    });
  });
  return Array.from(map.values()).sort((a, b) => (a.priceEach - b.priceEach) || a.name.localeCompare(b.name, 'th'));
};

// Filter out disabled choices in optionGroups (helper used by both apply funcs)
function _filterDisabledChoices(item, disabledSet) {
  if (!item.optionGroups || !disabledSet || disabledSet.size === 0) return item;
  const filtered = item.optionGroups.map(g => ({
    ...g,
    choices: (g.choices || []).filter(c => !disabledSet.has(c))
  })).filter(g => g.choices.length > 0); // drop empty groups
  return { ...item, optionGroups: filtered };
}

// 🏭 Apply factory menu config (overrides + custom factory items + disabledChoices)
window.applyFactoryConfig = function(config) {
  config = config || { overrides: {}, custom: [], disabledChoices: [] };
  const ov = config.overrides || {};
  const custom = config.custom || [];
  const disabled = new Set(config.disabledChoices || []);

  let result = (window.FACTORY_MENU || []).map(cat => ({
    ...cat,
    items: cat.items.map(it => {
      const o = ov[it.id];
      let item;
      if (!o) item = { ...it, available: true };
      else item = {
        ...it,
        ...(o.name ? { name: o.name } : {}),
        ...(o.price != null ? { price: Number(o.price) } : {}),
        available: o.available !== false
      };
      return _filterDisabledChoices(item, disabled);
    })
  }));

  custom.forEach(c => {
    const item = _filterDisabledChoices({
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.optionGroups ? { optionGroups: c.optionGroups } : {})
    }, disabled);
    const targetCat = result.find(cat => cat.cat === c.category);
    if (targetCat) targetCat.items.push(item);
    else result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🏭', items: [item] });
  });

  return result;
};

window.applyMenuConfig = function(config) {
  config = config || { overrides: {}, custom: [], disabledChoices: [] };
  const ov = config.overrides || {};
  const custom = config.custom || [];
  const disabled = new Set(config.disabledChoices || []);

  let result = MENU.map(cat => ({
    ...cat,
    items: cat.items.map(it => {
      const o = ov[it.id];
      let item;
      if (!o) item = { ...it, available: true };
      else item = {
        ...it,
        ...(o.name ? { name: o.name } : {}),
        ...(o.price != null ? { price: Number(o.price) } : {}),
        ...(o.image ? { image: o.image } : {}),
        available: o.available !== false
      };
      return _filterDisabledChoices(item, disabled);
    })
  }));

  custom.forEach(c => {
    const item = _filterDisabledChoices({
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.image ? { image: c.image } : {}),
      ...(c.optionGroups ? { optionGroups: c.optionGroups } : {})
    }, disabled);
    const targetCat = result.find(cat => cat.cat === c.category);
    if (targetCat) targetCat.items.push(item);
    else result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🍽️', items: [item] });
  });

  return result;
};
