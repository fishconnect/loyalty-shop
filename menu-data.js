// Menu data — แก้ไขได้ที่นี่ที่เดียว
window.SHOP_INFO = {
  name: "ครัวผู้ใหญ่ปอง",
  tagline: "อาหารตามสั่ง · ก๋วยเตี๋ยว",
  phone: "061-962-3696",
  logo: "logo.jpg",
  defaultImage: "assets/menu-placeholder.jpg",
};

window.MENU = [
  {
    cat: "ข้าวผัด",
    emoji: "🍚",
    items: [
      { id: "fr-001", name: "ข้าวผัดหมูสับ", price: 50 },
      { id: "fr-002", name: "ข้าวผัดหมูชิ้น", price: 50 },
      { id: "fr-003", name: "ข้าวผัดไก่", price: 50 },
      { id: "fr-004", name: "ข้าวผัดกุ้ง", price: 50 },
      { id: "fr-005", name: "ข้าวผัดปลาหมึก", price: 50 },
      { id: "fr-006", name: "ข้าวผัดรวมมิตร", price: 50, note: "หมู+กุ้ง+ปลาหมึก" },
      { id: "fr-007", name: "ข้าวผัดหมูกรอบ", price: 50 },
      { id: "fr-008", name: "ข้าวผัดแหนม", price: 50 },
      { id: "fr-009", name: "ข้าวผัดกุนเชียง", price: 50 },
    ]
  },
  {
    cat: "ข้าวผัดกระเพรา",
    emoji: "🌶️",
    items: [
      { id: "kp-001", name: "ข้าวผัดกระเพราหมูสับ", price: 50 },
      { id: "kp-002", name: "ข้าวผัดกระเพราหมูชิ้น", price: 50 },
      { id: "kp-003", name: "ข้าวผัดกระเพราหมูกรอบ", price: 50 },
      { id: "kp-004", name: "ข้าวผัดกระเพราแหนม", price: 50 },
      { id: "kp-005", name: "ข้าวผัดกระเพรากุนเชียง", price: 50 },
      { id: "kp-006", name: "ข้าวผัดกระเพราไก่", price: 50 },
      { id: "kp-007", name: "ข้าวผัดกระเพรากุ้ง", price: 50 },
      { id: "kp-008", name: "ข้าวผัดกระเพราปลาหมึก", price: 50 },
      { id: "kp-009", name: "ข้าวผัดกระเพรารวมมิตร", price: 50, note: "หมู+กุ้ง+ปลาหมึก" },
    ]
  },
  {
    cat: "ข้าวผัดพริกแกง",
    emoji: "🍛",
    items: [
      { id: "pk-001", name: "ข้าวผัดพริกแกงหมูสับ", price: 50 },
      { id: "pk-002", name: "ข้าวผัดพริกแกงหมูชิ้น", price: 50 },
      { id: "pk-003", name: "ข้าวผัดพริกแกงหมูกรอบ", price: 50 },
      { id: "pk-004", name: "ข้าวผัดพริกแกงไก่", price: 50 },
      { id: "pk-005", name: "ข้าวผัดพริกแกงกุ้ง", price: 50 },
      { id: "pk-006", name: "ข้าวผัดพริกแกงปลาหมึก", price: 50 },
      { id: "pk-007", name: "ข้าวผัดพริกแกงรวมมิตร", price: 50, note: "หมู+กุ้ง+ปลาหมึก" },
    ]
  },
  {
    cat: "ข้าวกระเทียมพริกไทย",
    emoji: "🧄",
    items: [
      { id: "gp-001", name: "ข้าวกระเทียมพริกไทยหมูสับ", price: 50 },
      { id: "gp-002", name: "ข้าวกระเทียมพริกไทยหมูชิ้น", price: 50 },
      { id: "gp-003", name: "ข้าวกระเทียมพริกไทยหมูกรอบ", price: 50 },
      { id: "gp-004", name: "ข้าวกระเทียมพริกไทยไก่", price: 50 },
      { id: "gp-005", name: "ข้าวกระเทียมพริกไทยกุ้ง", price: 50 },
      { id: "gp-006", name: "ข้าวกระเทียมพริกไทยปลาหมึก", price: 50 },
      { id: "gp-007", name: "ข้าวกระเทียมพริกไทยรวมมิตร", price: 50, note: "หมู+กุ้ง+ปลาหมึก" },
    ]
  },
  {
    cat: "ราดหน้า / ผัดซีอิ๊ว",
    emoji: "🍜",
    items: [
      { id: "rn-001", name: "ราดหน้า เส้นเล็ก", price: 50 },
      { id: "rn-002", name: "ราดหน้า เส้นหมี่", price: 50 },
      { id: "rn-003", name: "ราดหน้า เส้นใหญ่", price: 50 },
      { id: "ps-001", name: "ผัดซีอิ๊ว เส้นเล็ก", price: 50 },
      { id: "ps-002", name: "ผัดซีอิ๊ว เส้นหมี่", price: 50 },
      { id: "ps-003", name: "ผัดซีอิ๊ว เส้นใหญ่", price: 50 },
    ]
  },
  {
    cat: "ก๋วยเตี๋ยว",
    emoji: "🥢",
    items: [
      { id: "kt-001", name: "ก๋วยเตี๋ยวหมูน้ำใส เส้นเล็ก", price: 30 },
      { id: "kt-002", name: "ก๋วยเตี๋ยวหมูน้ำใส เส้นใหญ่", price: 30 },
      { id: "kt-003", name: "ก๋วยเตี๋ยวหมูน้ำใส เส้นหมี่", price: 30 },
      { id: "kt-004", name: "ก๋วยเตี๋ยวหมูต้มยำ เส้นเล็ก", price: 30 },
      { id: "kt-005", name: "ก๋วยเตี๋ยวหมูต้มยำ เส้นใหญ่", price: 30 },
      { id: "kt-006", name: "ก๋วยเตี๋ยวหมูต้มยำ เส้นหมี่", price: 30 },
    ]
  },
  {
    cat: "เพิ่มเติม (อย่างละ +5.-)",
    emoji: "🍳",
    isAddOn: true,
    items: [
      { id: "add-001", name: "ไข่ดาวสุก", price: 5 },
      { id: "add-002", name: "ไข่ดาวไม่สุก", price: 5 },
      { id: "add-003", name: "ไข่เจียว", price: 5 },
      { id: "add-004", name: "ไข่ต้ม", price: 5 },
    ]
  }
];

// Helper: คำนวณกล่องที่นับเป็นแต้ม (จานหลัก = 1 กล่อง, เพิ่มเติมไม่นับ)
window.countMainDishes = function(items) {
  let count = 0;
  items.forEach(it => {
    const cat = MENU.find(c => c.items.some(i => i.id === it.id));
    if (cat && !cat.isAddOn) count += (it.qty || 1);
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
  done:       { label: 'จัดส่งสำเร็จ',  custLabel: 'จัดส่งสำเร็จ ขอบคุณครับ', icon: '✅', color: '#16a34a', next: null, nextLabel: '', stage: 6 }, // legacy
  cancelled:  { label: 'ยกเลิก',         custLabel: 'ออเดอร์นี้ถูกยกเลิก', icon: '❌', color: '#dc2626', next: null, nextLabel: '', stage: 0 }
};

// Apply overrides + custom items from Firestore config
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

  // Append custom items
  custom.forEach(c => {
    const item = {
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.image ? { image: c.image } : {})
    };
    if (c.isAddOn || c.category === '_addon_') {
      // Add to add-on category
      let addOnCat = result.find(cat => cat.isAddOn);
      if (!addOnCat) {
        addOnCat = { cat: 'เพิ่มเติม (อย่างละ +5.-)', emoji: '🍳', isAddOn: true, items: [] };
        result.push(addOnCat);
      }
      addOnCat.items.push(item);
    } else {
      const targetCat = result.find(cat => cat.cat === c.category && !cat.isAddOn);
      if (targetCat) {
        targetCat.items.push(item);
      } else {
        result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🍽️', items: [item] });
      }
    }
  });

  return result;
};
