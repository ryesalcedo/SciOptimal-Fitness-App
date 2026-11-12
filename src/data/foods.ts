export interface CatalogFood {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const FOODS: CatalogFood[] = [
  { id: 'eggs', name: 'Eggs', serving: '2 large', calories: 156, protein: 13, carbs: 1, fat: 11 },
  { id: 'egg-whites', name: 'Egg whites', serving: '1 cup', calories: 126, protein: 26, carbs: 2, fat: 0 },
  { id: 'oatmeal', name: 'Oatmeal', serving: '1 cup cooked', calories: 166, protein: 6, carbs: 28, fat: 4 },
  { id: 'greek-yogurt', name: 'Greek yogurt', serving: '1 cup', calories: 180, protein: 20, carbs: 8, fat: 5 },
  { id: 'cottage', name: 'Cottage cheese', serving: '1 cup', calories: 206, protein: 24, carbs: 8, fat: 9 },
  { id: 'milk', name: 'Milk', serving: '1 cup', calories: 149, protein: 8, carbs: 12, fat: 8 },
  { id: 'whey', name: 'Whey protein', serving: '1 scoop', calories: 120, protein: 24, carbs: 3, fat: 2 },
  { id: 'banana', name: 'Banana', serving: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'apple', name: 'Apple', serving: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { id: 'blueberries', name: 'Blueberries', serving: '1 cup', calories: 84, protein: 1, carbs: 21, fat: 0 },
  { id: 'toast', name: 'Whole wheat toast', serving: '1 slice', calories: 81, protein: 4, carbs: 14, fat: 1 },
  { id: 'bagel', name: 'Bagel', serving: '1 medium', calories: 277, protein: 11, carbs: 55, fat: 2 },
  { id: 'peanut-butter', name: 'Peanut butter', serving: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16 },
  { id: 'almonds', name: 'Almonds', serving: '1 oz', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: 'chicken', name: 'Chicken breast', serving: '4 oz cooked', calories: 187, protein: 35, carbs: 0, fat: 4 },
  { id: 'turkey', name: 'Turkey breast', serving: '4 oz', calories: 153, protein: 34, carbs: 0, fat: 1 },
  { id: 'salmon', name: 'Salmon', serving: '4 oz', calories: 233, protein: 25, carbs: 0, fat: 14 },
  { id: 'tuna', name: 'Tuna', serving: '1 can in water', calories: 120, protein: 26, carbs: 0, fat: 1 },
  { id: 'shrimp', name: 'Shrimp', serving: '4 oz', calories: 112, protein: 24, carbs: 0, fat: 1 },
  { id: 'lean-beef', name: 'Lean ground beef', serving: '4 oz cooked', calories: 200, protein: 24, carbs: 0, fat: 11 },
  { id: 'steak', name: 'Sirloin steak', serving: '4 oz', calories: 230, protein: 26, carbs: 0, fat: 13 },
  { id: 'pork', name: 'Pork tenderloin', serving: '4 oz', calories: 168, protein: 26, carbs: 0, fat: 6 },
  { id: 'tofu', name: 'Firm tofu', serving: '4 oz', calories: 94, protein: 10, carbs: 2, fat: 5 },
  { id: 'rice', name: 'White rice', serving: '1 cup cooked', calories: 206, protein: 4, carbs: 45, fat: 0 },
  { id: 'brown-rice', name: 'Brown rice', serving: '1 cup cooked', calories: 218, protein: 5, carbs: 46, fat: 2 },
  { id: 'pasta', name: 'Pasta', serving: '2 oz dry', calories: 211, protein: 7, carbs: 43, fat: 1 },
  { id: 'potato', name: 'Potato', serving: '1 medium', calories: 161, protein: 4, carbs: 37, fat: 0 },
  { id: 'sweet-potato', name: 'Sweet potato', serving: '1 medium', calories: 112, protein: 2, carbs: 26, fat: 0 },
  { id: 'quinoa', name: 'Quinoa', serving: '1 cup cooked', calories: 222, protein: 8, carbs: 39, fat: 4 },
  { id: 'bread', name: 'White bread', serving: '1 slice', calories: 79, protein: 3, carbs: 15, fat: 1 },
  { id: 'tortilla', name: 'Flour tortilla', serving: '1 large', calories: 140, protein: 4, carbs: 24, fat: 4 },
  { id: 'broccoli', name: 'Broccoli', serving: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 1 },
  { id: 'spinach', name: 'Spinach', serving: '2 cups raw', calories: 14, protein: 2, carbs: 2, fat: 0 },
  { id: 'salad', name: 'Mixed greens', serving: '2 cups', calories: 20, protein: 2, carbs: 3, fat: 0 },
  { id: 'olive-oil', name: 'Olive oil', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 14 },
  { id: 'avocado', name: 'Avocado', serving: '1/2 fruit', calories: 120, protein: 2, carbs: 6, fat: 11 },
  { id: 'cheese', name: 'Cheddar cheese', serving: '1 oz', calories: 114, protein: 7, carbs: 0, fat: 9 },
  { id: 'mozzarella', name: 'Mozzarella', serving: '1 oz', calories: 85, protein: 6, carbs: 1, fat: 6 },
  { id: 'beans', name: 'Black beans', serving: '1 cup', calories: 227, protein: 15, carbs: 41, fat: 1 },
  { id: 'lentils', name: 'Lentils', serving: '1 cup cooked', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { id: 'hummus', name: 'Hummus', serving: '1/4 cup', calories: 100, protein: 5, carbs: 9, fat: 6 },
  { id: 'pizza', name: 'Cheese pizza', serving: '1 slice', calories: 285, protein: 12, carbs: 36, fat: 10 },
  { id: 'burger', name: 'Hamburger', serving: '1 sandwich', calories: 354, protein: 20, carbs: 30, fat: 16 },
  { id: 'fries', name: 'French fries', serving: 'medium', calories: 365, protein: 4, carbs: 48, fat: 17 },
  { id: 'burrito', name: 'Chicken burrito', serving: '1', calories: 650, protein: 35, carbs: 70, fat: 22 },
  { id: 'rice-bowl', name: 'Chicken rice bowl', serving: '1 bowl', calories: 540, protein: 38, carbs: 55, fat: 16 },
  { id: 'protein-bar', name: 'Protein bar', serving: '1 bar', calories: 200, protein: 20, carbs: 22, fat: 7 },
  { id: 'cereal', name: 'Cereal with milk', serving: '1 bowl', calories: 230, protein: 8, carbs: 42, fat: 4 },
  { id: 'pancakes', name: 'Pancakes', serving: '2 cakes', calories: 350, protein: 8, carbs: 58, fat: 10 },
  { id: 'coffee', name: 'Latte', serving: '12 oz', calories: 120, protein: 8, carbs: 12, fat: 5 },
  { id: 'soda', name: 'Soda', serving: '12 oz', calories: 140, protein: 0, carbs: 39, fat: 0 },
  { id: 'beer', name: 'Beer', serving: '12 oz', calories: 153, protein: 2, carbs: 13, fat: 0 },
  { id: 'wine', name: 'Wine', serving: '5 oz', calories: 125, protein: 0, carbs: 4, fat: 0 },
  { id: 'ice-cream', name: 'Ice cream', serving: '1 cup', calories: 273, protein: 5, carbs: 31, fat: 15 },
  { id: 'chips', name: 'Potato chips', serving: '1 oz', calories: 152, protein: 2, carbs: 15, fat: 10 },
  { id: 'granola', name: 'Granola', serving: '1/2 cup', calories: 220, protein: 5, carbs: 32, fat: 9 },
  { id: 'orange', name: 'Orange', serving: '1 medium', calories: 62, protein: 1, carbs: 15, fat: 0 },
  { id: 'strawberries', name: 'Strawberries', serving: '1 cup', calories: 49, protein: 1, carbs: 12, fat: 0 },
  { id: 'asparagus', name: 'Asparagus', serving: '6 spears', calories: 20, protein: 2, carbs: 4, fat: 0 },
  { id: 'rice-cakes', name: 'Rice cakes', serving: '2 cakes', calories: 70, protein: 1, carbs: 15, fat: 0 },
];

export function searchFoods<T extends { name: string }>(foods: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return foods.slice(0, 8);
  return foods
    .map((food) => {
      const name = food.name.toLowerCase();
      let score = 0;
      if (name === needle) score = 100;
      else if (name.startsWith(needle)) score = 80;
      else if (name.includes(needle)) score = 60;
      else if (needle.split(/\s+/).every((word) => name.includes(word))) score = 40;
      return { food, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.food);
}

export function parseMealText(text: string, foods: CatalogFood[] = FOODS): Array<{ food: CatalogFood; servings: number }> {
  const chunks = text.split(/\s*(?:,|\+|\band\b|\bwith\b)\s*/i).map((chunk) => chunk.trim()).filter(Boolean);
  const parsed: Array<{ food: CatalogFood; servings: number }> = [];
  chunks.forEach((chunk) => {
    const match = chunk.match(/^(\d+(?:\.\d+)?)?\s*(?:x\s*)?(.*)$/i);
    const servings = match?.[1] ? Number(match[1]) : 1;
    const name = (match?.[2] || chunk).trim();
    const food = searchFoods(foods, name)[0];
    if (food && name.length > 1) parsed.push({ food, servings: servings > 0 ? servings : 1 });
  });
  return parsed;
}
