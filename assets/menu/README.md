# 🖼️ Menu item images

Drop JPG files here named after each menu item ID and they'll appear
on the customer menu automatically — no admin upload, no Firestore.

## Naming convention

```
assets/menu/<item-id>.jpg
```

For example:

| Item               | ID         | Filename            |
|--------------------|------------|---------------------|
| ข้าวผัดกระเพรา      | `rd-001`   | `rd-001.jpg`        |
| ข้าวผัด             | `sf-001`   | `sf-001.jpg`        |
| ผัดซีอิ๊ว           | `sf-002`   | `sf-002.jpg`        |
| ต้มยำกุ้ง           | `ty-XXX`   | `ty-XXX.jpg`        |

To see every ID, open the **admin page → 🖼️ รูปเมนู (Image IDs)** tab —
it lists all 123 menu items with their IDs and a "📋 Copy ID" button.

## Cascade order

The customer menu picks an image in this order:

1. **Admin upload** (`it.image` — base64 in localStorage, only on the
   device that uploaded it)
2. **This folder** (`assets/menu/<id>.jpg`) ← **the recommended path**
3. **Placeholder** (`assets/menu-placeholder.jpg`) + the category emoji
   overlay if neither of the above is present

So just drop a JPG in here, commit, and every device sees it instantly.

## Tips

- **JPEG, ~400px wide** is plenty — keeps git small and loads fast
- Square (1:1) aspect ratio looks best in both list cards and the
  popular grid
- Filename is **lowercase** (item IDs are already lowercase)
- Any file that fails to load silently falls back to the placeholder
