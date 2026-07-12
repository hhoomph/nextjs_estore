const fs = require('fs');
const path = require('path');

// Read the en.json file
const enPath = path.join(__dirname, 'messages/en.json');
const faPath = path.join(__dirname, 'messages/fa.json');

let enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Add Footer keys for English
enData["Footer & Additional UI"] = {
  ...enData["Footer & Additional UI"],
  description: "Your premier online shopping destination for curated products, reliable checkout, and thoughtful customer support.",
  shop: "Shop",
  products: "Products",
  categories: "Categories",
  deals: "Deals",
  popular: "Popular",
  cart: "Cart",
  wishlist: "Wishlist",
  helpSupport: "Help & Support",
  account: "Account",
  signIn: "Sign In",
  signUp: "Sign Up",
  profile: "Profile",
  downloadApp: "Download App",
  downloadAppDescription: "Get started in seconds – it is fast, free, and easy.",
  downloadOn: "Download on the",
  appStore: "App Store",
  getItOn: "Get it on",
  googlePlay: "Google Play",
  paymentMethods: "Payment Methods"
};

// Write the updated en.json
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf-8');

// Read the fa.json file
let faData = JSON.parse(fs.readFileSync(faPath, 'utf-8'));

// Add Footer keys for Persian
faData["Footer & Additional UI"] = {
  ...faData["Footer & Additional UI"],
  description: "مرکز اولین خرید آنلاین برای محصولات دسته‌بندی شده، تسویه حساب مطمئن و پشتیبانی مشتریانه.",
  shop: "فروشگاه",
  products: "محصولات",
  categories: "دسته‌بندی‌ها",
  deals: "تخفیف‌ها",
  popular: "محبوب",
  cart: "سبد خرید",
  wishlist: "لیست علاقه‌مندی‌ها",
  helpSupport: "راهنما و پشتیبانی",
  account: "حساب کاربری",
  signIn: "ورود",
  signUp: "ثبت نام",
  profile: "پروفایل",
  downloadApp: "دانلود برنامه",
  downloadAppDescription: "در چند ثانیه شروع کنید - سریع، رایگان و آسان است.",
  downloadOn: "دانلود روی",
  appStore: "App Store",
  getItOn: "دریافت کنید در",
  googlePlay: "Google Play",
  paymentMethods: "روش‌های پرداخت"
};

// Write the updated fa.json
fs.writeFileSync(faPath, JSON.stringify(faData, null, 2) + '\n', 'utf-8');

console.log('Successfully updated both JSON files with Footer & Additional UI keys');
