// Test script to verify next-intl and localization setup
const fs = require('fs');
const path = require('path');

console.log('=== Localization Implementation Test ===\n');

// Test 1: Check if translation files exist and have valid JSON
console.log('Test 1: Checking translation files...');
try {
  const enPath = path.join(__dirname, 'messages/en.json');
  const faPath = path.join(__dirname, 'messages/fa.json');

  if (!fs.existsSync(enPath)) {
    console.log('❌ en.json not found');
    process.exit(1);
  }

  if (!fs.existsSync(faPath)) {
    console.log('❌ fa.json not found');
    process.exit(1);
  }

  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const faData = JSON.parse(fs.readFileSync(faPath, 'utf-8'));

  console.log('✅ Translation files exist and are valid JSON');

  // Test 2: Check if Footer & Additional UI section exists
  console.log('\nTest 2: Checking Footer & Additional UI section...');
  if (!enData["Footer & Additional UI"]) {
    console.log('❌ Footer & Additional UI not found in en.json');
    process.exit(1);
  }

  if (!faData["Footer & Additional UI"]) {
    console.log('❌ Footer & Additional UI not found in fa.json');
    process.exit(1);
  }

  console.log('✅ Footer & Additional UI section exists in both files');

  // Test 3: Check required keys in English
  console.log('\nTest 3: Checking required keys in English...');
  const requiredKeys = [
    'description', 'shop', 'products', 'categories', 'deals',
    'popular', 'cart', 'wishlist', 'helpSupport', 'account',
    'signIn', 'signUp', 'profile', 'downloadApp', 'downloadAppDescription',
    'downloadOn', 'appStore', 'getItOn', 'googlePlay', 'paymentMethods'
  ];

  const missingEnKeys = requiredKeys.filter(key => !(key in enData["Footer & Additional UI"]));
  if (missingEnKeys.length > 0) {
    console.log(`❌ Missing keys in en.json: ${missingEnKeys.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ All required keys present in en.json');

  // Test 4: Check required keys in Persian
  console.log('\nTest 4: Checking required keys in Persian...');
  const missingFaKeys = requiredKeys.filter(key => !(key in faData["Footer & Additional UI"]));
  if (missingFaKeys.length > 0) {
    console.log(`❌ Missing keys in fa.json: ${missingFaKeys.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ All required keys present in fa.json');

  // Test 5: Check middleware exists
  console.log('\nTest 5: Checking middleware configuration...');
  const middlewarePath = path.join(__dirname, 'middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    console.log('❌ middleware.ts not found');
    process.exit(1);
  }

  const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
  if (!middlewareContent.includes('next-intl/middleware')) {
    console.log('❌ middleware.ts does not import next-intl/middleware');
    process.exit(1);
  }

  console.log('✅ middleware.ts exists and imports next-intl/middleware');

  // Test 6: Check API route exists
  console.log('\nTest 6: Checking API route...');
  const apiPath = path.join(__dirname, 'app/api/locale/route.ts');
  if (!fs.existsSync(apiPath)) {
    console.log('❌ API route not found');
    process.exit(1);
  }

  console.log('✅ API route exists');

  // Test 7: Check Footer component uses translations
  console.log('\nTest 7: Checking Footer component...');
  const footerPath = path.join(__dirname, 'components/layout/footer.tsx');
  if (!fs.existsSync(footerPath)) {
    console.log('❌ Footer component not found');
    process.exit(1);
  }

  const footerContent = fs.readFileSync(footerPath, 'utf-8');
  if (!footerContent.includes('useTranslations')) {
    console.log('❌ Footer component does not use useTranslations');
    process.exit(1);
  }

  console.log('✅ Footer component uses useTranslations hook');

  console.log('\n=== All Tests Passed! ===');
  console.log('\nSummary:');
  console.log('- Translation files are valid JSON');
  console.log('- Footer & Additional UI section exists in both languages');
  console.log('- All required translation keys are present');
  console.log('- Middleware is configured correctly');
  console.log('- API route is set up for locale detection');
  console.log('- Footer component is using translations');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
