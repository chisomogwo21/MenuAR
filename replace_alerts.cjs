const fs = require('fs');

const files = [
  'src/pages/Onboarding.tsx',
  'src/pages/superadmin/Restaurants.tsx',
  'src/pages/customer/ARPreview.tsx',
  'src/pages/customer/Cart.tsx',
  'src/pages/customer/DishDetail.tsx',
  'src/pages/admin/MenuManager.tsx',
  'src/pages/admin/Settings.tsx',
  'src/components/customer/BottomNav.tsx',
  'src/components/customer/AIAssistant.tsx',
  'src/components/admin/DishDrawer.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Just use a blanket regex to replace all alert(...) with console.error(...)
  // but let's try to match anything inside alert(...)
  content = content.replace(/alert\((.*)\)/g, 'console.error($1)');
  
  fs.writeFileSync(file, content);
}
console.log('Done replacing alerts');
