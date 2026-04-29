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

// 1) ราดข้าวกะเพรา group: เนื้อ 0-3 (ไม่บังคับ) + พิเศษ +10 (6 ตัว) + ไข่ +5
const OPT_KAPRAO = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ · เลือกได้สูงสุด 3 อย่าง)', min: 0, max: 3, priceEach: 0,
    choices: ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'หน่อไม้ดอง'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'ไข่เยี้ยวม้า', 'รวมมิตร(หมู+หมึก+กุ้ง)', 'ไข่ข้น'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] }
]);

// 2) ข้าวผัด: เนื้อ 0-1 (ไม่บังคับ) + +10 (มีหมูกรอบ) + ไข่ +5
const OPT_KAOPAD = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ)', min: 0, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่', 'แหนม'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] }
]);

// 2b) ราดข้าว-ไข่เจียว: เนื้อ 0-1 + +10 (3 ตัว ไม่มีหมูกรอบ)
const OPT_KAOPAD_KAI = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ)', min: 0, max: 1, priceEach: 0,
    choices: ['หมูสับ', 'ไก่สับ', 'แหนม'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'] }
]);

// 3) ผัดซีอิ๊ว: เนื้อ 0-1 + +10 (มีหมูกรอบ) + เลือกเส้น (จำเป็น)
const OPT_PADSEEW = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ)', min: 0, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] }
]);

// 4) ราดหน้า: เนื้อ 0-1 + +10 (ไม่มีหมูกรอบ) + เลือกเส้น (จำเป็น)
const OPT_RADNAA = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ)', min: 0, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] }
]);

// 5) สุกี้: เนื้อ 0-1 (ไม่บังคับ) + +5 (รวมมิตร/กุ้ง/ปลาหมึก)
const OPT_SUKI = () => ([
  { kind: 'addOn', label: 'เลือกเนื้อ (ไม่บังคับ)', min: 0, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+5)', min: 0, max: 99, priceEach: 5,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] }
]);

// 6) เมนูพิเศษ: ไข่ +5 อย่างเดียว
const OPT_EGG_ONLY = () => ([
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] }
]);

// 7) ก๋วยเตี๋ยว/เย็นตาโฟ ปกติ: เลือกเส้น 6 แบบ
const OPT_NOODLE_ONLY = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] }
]);

// 8) ต้มยำ: เลือกเส้น + รวมมิตรทะเล +10
const OPT_NOODLE_TOMYUM = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] },
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
]);

// 9) เกี๋ยว / เกาเหลา: รวมมิตรทะเล +10
const OPT_KIEW = () => ([
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
]);

// 10) เครื่องดื่มที่ปั่นได้: ปั่น +5 (optional, max 1)
const OPT_DRINK_BLEND = () => ([
  { kind: 'addOn', label: 'ตัวเลือก (+5)', min: 0, max: 1, priceEach: 5, choices: ['ปั่น'] }
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
      { id: 'rd-004', name: 'ราดข้าว ข้าวทอดกระเทียม',     price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-005', name: 'ราดข้าว ผัดฉ่า',               price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-006', name: 'ราดข้าว ผัดผักรวมมิตร',        price: 40, optionGroups: OPT_KAPRAO() },
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
      { id: 'ym-001', name: 'ยำวุ้นเส้นรวมมิตร',     price: 50 },
      { id: 'ym-002', name: 'ยำมาม่ารวมมิตร',          price: 50 },
      { id: 'ym-003', name: 'ยำรวมมิตร (ไม่ใส่เส้น)', price: 50 },
      { id: 'ym-004', name: 'ยำไข่เยี่ยวม้า',          price: 50 },
      { id: 'ym-005', name: 'ราดข้าว ยำไข่เจียว',     price: 45 },
      { id: 'ym-006', name: 'ราดข้าว ยำไข่ดาว',       price: 40 },
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
      { id: 'dr-001', name: 'ชานมไต้หวั่น', price: 25, optionGroups: OPT_DRINK_BLEND() },
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

window.applyMenuConfig = function(config) {
  config = config || { overrides: {}, custom: [] };
  const ov = config.overrides || {};
  const custom = config.custom || [];

  let result = MENU.map(cat => ({
    ...cat,
    items: cat.items.map(it => {
      const o = ov[it.id];
      if (!o) return { ...it, available: true };
      return {
        ...it,
        ...(o.name ? { name: o.name } : {}),
        ...(o.price != null ? { price: Number(o.price) } : {}),
        ...(o.image ? { image: o.image } : {}),
        available: o.available !== false
      };
    })
  }));

  custom.forEach(c => {
    const item = {
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.image ? { image: c.image } : {}),
      ...(c.optionGroups ? { optionGroups: c.optionGroups } : {})
    };
    const targetCat = result.find(cat => cat.cat === c.category);
    if (targetCat) targetCat.items.push(item);
    else result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🍽️', items: [item] });
  });

  return result;
};
