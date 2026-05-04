const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Inserting Test Cafe...');
  
  // 1. Insert Restaurant
  const { data: restaurant, error: rError } = await supabase
    .from('restaurants')
    .insert({
      name: 'Test Cafe',
      slug: 'test-cafe',
      primary_color: '#3498db'
    })
    .select()
    .single();

  if (rError) {
    console.error('Failed to insert restaurant:', rError);
    return;
  }

  console.log('Restaurant created:', restaurant.id);

  // 2. Insert Category
  const { data: category, error: cError } = await supabase
    .from('categories')
    .insert({
      restaurant_id: restaurant.id,
      name: 'Test Drinks',
      sort_order: 1
    })
    .select()
    .single();

  if (cError) {
    console.error('Failed to insert category:', cError);
    return;
  }

  // 3. Insert Menu Item
  const { error: mError } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: restaurant.id,
      category_id: category.id,
      name: 'Test Coffee',
      description: 'A delicious test coffee.',
      price: 4.50,
      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
      is_available: true
    });

  if (mError) {
    console.error('Failed to insert menu item:', mError);
    return;
  }

  console.log('Test Cafe fully seeded! You can now visit /test-cafe/menu');
}

seed();
