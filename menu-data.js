// Menu data — แก้ไขได้ที่นี่ที่เดียว
window.SHOP_INFO = {
  name: "ครัวผู้ใหญ่ปอง",
  tagline: "อาหารตามสั่ง · ก๋วยเตี๋ยว",
  phone: "061-962-3696",
  logo: "logo.jpg",
  defaultImage: "assets/menu-placeholder.jpg",
};

// ============================================
// Option presets — 7 แบบ
// ============================================
const _EGGS_5 = ['ไข่ดาวสุก', 'ไข่ดาวไม่สุก', 'ไข่เจียว', 'ไข่ต้ม'];
const _NOODLES = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];

// 1) ราดข้าวกะเพรา group: เนื้อ max 3 + พิเศษ +10 (7 ตัวเลือก) + ไข่ +5
const OPT_KAPRAO = () => ([
  { kind: 'required', label: 'เลือกเนื้อ (สูงสุด 3 อย่าง)', min: 1, max: 3, priceEach: 0,
    choices: ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'หน่อไม้ดอง'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'ไข่เยี้ยวม้า', 'ไข่เจียวฟูกรอบ', 'รวมมิตร(หมู+หมึก+กุ้ง)', 'ไข่ข้น'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5,
    choices: [..._EGGS_5] }
]);

// 2) ข้าวผัด/ผัดซีอิ้ว: เนื้อ max 1 (3 ตัวเลือก) + +10 (มีหมูกรอบ) + ไข่
const OPT_STIRFRY_FULL = () => ([
  { kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5,
    choices: [..._EGGS_5] }
]);

// 3) ราดหน้า: เนื้อ max 1 + +10 (ไม่มีหมูกรอบ) + ไม่มีไข่
const OPT_RADNAA = () => ([
  { kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] }
]);

// 4) สุกี้: เนื้อ max 1 (หมูชิ้น/ไก่) + +5 (รวมมิตร/กุ้ง/ปลาหมึก) — ไม่มีไข่
const OPT_SUKI = () => ([
  { kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
    choices: ['หมูชิ้น', 'ไก่'] },
  { kind: 'addOn', label: 'เพิ่มของพิเศษ (+5)', min: 0, max: 99, priceEach: 5,
    choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] }
]);

// 5) เมนูพิเศษ: ไข่ +5 อย่างเดียว
const OPT_EGG_ONLY = () => ([
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] }
]);

// 6) ก๋วยเตี๋ยว/เย็นตาโฟ ปกติ: เลือกเส้น
const OPT_NOODLE_ONLY = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES] }
]);

// 7) ต้มยำ: เลือกเส้น + รวมมิตรทะเล +10
const OPT_NOODLE_TOMYUM = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES] },
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
]);

// 8) เกี๋ยว: รวมมิตรทะเล +10
const OPT_KIEW = () => ([
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
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
      { id: 'sf-001', name: 'ข้าวผัด',  price: 40, optionGroups: OPT_STIRFRY_FULL() },
      { id: 'sf-002', name: 'ผัดซีอิ้ว', price: 40, optionGroups: OPT_STIRFRY_FULL() },
      { id: 'sf-003', name: 'ราดหน้า',  price: 40, optionGroups: OPT_RADNAA() },
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
      { id: 'sp-003', name: 'ราดข้าว ผัดพริกปลาดุกสด',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-004', name: 'ราดข้าว ผัดพริกปลาดุกทอด',             price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-005', name: 'ราดข้าว สามชั้นทอดน้ำปลา',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-006', name: 'ราดข้าว สามชั้นคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-007', name: 'ราดข้าว หมูกรอบคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-008', name: 'ราดข้าว ห่อหมกทะเลไข่ข้น',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-009', name: 'ราดข้าว กระเพราหมูสับใส้กรอกแดง',       price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-010', name: 'ราดข้าว กระเพราหมูสับ + หมูยอ',         price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-011', name: 'ราดข้าว ผัดเต้าหู้หมูสับ',               price: 40, optionGroups: OPT_EGG_ONLY() },
    ]
  },
  {
    cat: "ยำ",
    emoji: "🥗",
    items: [
      { id: 'ym-001', name: 'ยำวุ้นเส้น',          price: 50 },
      { id: 'ym-002', name: 'ยำมาม่า',              price: 50 },
      { id: 'ym-003', name: 'ยำรวมมิตร',           price: 50 },
      { id: 'ym-004', name: 'ราดข้าว ยำไข่เจียว',  price: 45 },
      { id: 'ym-005', name: 'ราดข้าว ยำไข่ดาว',    price: 40 },
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
    cat: "เครื่องดื่ม",
    emoji: "🥤",
    items: [
      { id: 'dr-001', name: 'ชานมไข่มุก', price: 20 },
      { id: 'dr-002', name: 'น้ำอัดลม',    price: 20 },
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
  REWARD_DISCOUNT_AMOUNT: 50,        // จำนวนเงินที่ลด
  AWARD_ON_STATUS: 'delivered',      // ได้แต้มเมื่อสถานะนี้
  // เมนูเครื่องดื่มที่ใช้แลกได้ (10 แต้ม)
  DRINK_REWARD_IDS: ['dr-001', 'dr-002'],
};

// คำนวณแต้มจากยอดเงิน (เศษทศนิยมปัด floor — 99฿ ได้ 1 แต้ม, 100฿ ได้ 2 แต้ม)
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
