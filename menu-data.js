// Menu data — แก้ไขได้ที่นี่ที่เดียว
window.SHOP_INFO = {
  name: "ครัวผู้ใหญ่ปอง",
  tagline: "อาหารตามสั่ง · ก๋วยเตี๋ยว",
  phone: "061-962-3696",
  logo: "logo.jpg",
  defaultImage: "assets/menu-placeholder.jpg",
};

// ============================================
// Option Groups — ใช้ร่วมกันหลาย item
// ============================================
const _PROTEINS = ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'หน่อไม้ดอง'];
const _ADDON_10 = ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'ไข่เยี้ยวม้า', 'ไข่เจียวฟูกรอบ', 'รวมมิตร(หมู หมึก กุ้ง)', 'ไข่ข้น'];
const _EGGS_5   = ['ไข่ดาวสุก', 'ไข่ดาวไม่สุก', 'ไข่เจียว', 'ไข่ต้ม'];
const _NOODLES  = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];

// Standard rice/stir-fry options (เลือกเนื้อ + พิเศษ +10 + ไข่ +5)
const OPT_FULL = () => ([
  { kind: 'required', label: 'เลือกเนื้อ',          min: 1, max: 1,  priceEach: 0,  choices: [..._PROTEINS] },
  { kind: 'addOn',    label: 'เพิ่มของพิเศษ (+10)', min: 0, max: 99, priceEach: 10, choices: [..._ADDON_10] },
  { kind: 'addOn',    label: 'เพิ่มไข่ (+5)',        min: 0, max: 99, priceEach: 5,  choices: [..._EGGS_5] }
]);

// เมนูพิเศษ: ไม่เลือกเนื้อ (มีในชื่อแล้ว) + ไข่ +5
const OPT_EGG_ONLY = () => ([
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] }
]);

// ก๋วยเตี๋ยว: เลือกเส้น
const OPT_NOODLE_ONLY = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES] }
]);

// ก๋วยเตี๋ยวต้มยำ/เย็นตาโฟต้มยำ: เลือกเส้น + รวมมิตรทะเล +10
const OPT_NOODLE_TOMYUM = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES] },
  { kind: 'addOn',    label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
]);

// เกี๋ยวน้ำหมูแดง: รวมมิตรทะเล +10
const OPT_KIEW = () => ([
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }
]);

// ============================================
// MENU
// ============================================
window.MENU = [
  {
    cat: "ราดข้าว / ผัด",
    emoji: "🍛",
    items: [
      { id: 'rd-001', name: 'ราดข้าว ผัดกระเพรา',          price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-002', name: 'ราดข้าว ใบโหรพา พริกแห้ง',     price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-003', name: 'ราดข้าว ผัดพริกแกง',           price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-004', name: 'ราดข้าว ข้าวทอดกระเทียม',      price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-005', name: 'ราดข้าว ผัดฉ่า',                price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-006', name: 'ราดข้าว ผัดผักรวมมิตร',         price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-007', name: 'ราดข้าว พริกสด',                price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-008', name: 'ราดข้าว พริกเผา',               price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-009', name: 'ราดข้าว น้ำมันหอย',             price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-010', name: 'ข้าวผัด',                       price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-011', name: 'ผัดซีอิ้ว',                      price: 40, optionGroups: OPT_FULL() },
      { id: 'rd-012', name: 'ราดหน้า',                        price: 40, optionGroups: OPT_FULL() },
    ]
  },
  {
    cat: "สุกี้",
    emoji: "🍲",
    items: [
      { id: 'sk-001', name: 'สุกี้น้ำ',  price: 45, optionGroups: OPT_FULL() },
      { id: 'sk-002', name: 'สุกี้แห้ง', price: 45, optionGroups: OPT_FULL() },
    ]
  },
  {
    cat: "เมนูพิเศษ ⭐",
    emoji: "⭐",
    items: [
      { id: 'sp-001', name: 'ราดข้าว ผัดเผ็ดหมูป่า',           price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-002', name: 'ราดข้าว ผัดพริกปลาดุกสด',         price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-003', name: 'ราดข้าว ผัดพริกปลาดุกทอด',        price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-004', name: 'ราดข้าว สามชั้นทอดน้ำปลา',         price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-005', name: 'ราดข้าว สามชั้นคั่วพริกเกลือ',     price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-006', name: 'ราดข้าว หมูกรอบคั่วพริกเกลือ',     price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-007', name: 'ราดข้าว ห่อหมกทะเลไข่ข้น',         price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-008', name: 'ราดข้าว กระเพราหมูสับใส้กรอกแดง',   price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-009', name: 'ราดข้าว กระเพราหมูสับ + หมูยอ',     price: 40, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-010', name: 'ราดข้าว ผัดเต้าหู้หมูสับ',           price: 40, optionGroups: OPT_EGG_ONLY() },
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
    cat: "ก๋วยเตี๋ยว",
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
];

// ============================================
// Helpers
// ============================================

// Calculate per-line total: base price + sum of selected option prices
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

// Build display string for selected options (e.g., "หมูสับ, +หมูกรอบ, +ไข่ดาวสุก")
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

// Count main dishes for loyalty (legacy: 20 boxes = 1 free)
// New: every item in MENU is a main dish (add-ons are now options, not separate items)
window.countMainDishes = function(items) {
  let count = 0;
  items.forEach(it => {
    if (it.id && it.id.startsWith('add-')) return; // legacy add-on items
    count += (it.qty || 1);
  });
  return count;
};

// Order status state machine
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

// Apply overrides + custom items from Firestore config (price/name/availability/image)
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

  // Append custom items (no optionGroups by default — admin can add them later via UI)
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
