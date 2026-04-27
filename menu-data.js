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
