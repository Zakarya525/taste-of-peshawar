import { useQuery } from "@tanstack/react-query";
import { supabase, MenuItem, MenuCategory } from "../lib/supabase";

// Query keys
export const menuKeys = {
  all: ["menu"] as const,
  categories: () => [...menuKeys.all, "categories"] as const,
  items: () => [...menuKeys.all, "items"] as const,
  itemsByCategory: (categoryId: string) =>
    [...menuKeys.items(), "category", categoryId] as const,
  search: (query: string) => [...menuKeys.items(), "search", query] as const,
};

// Fetch all menu categories
export const useMenuCategories = () => {
  return useQuery({
    queryKey: menuKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch menu items with categories
export const useMenuItems = () => {
  return useQuery({
    queryKey: menuKeys.items(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_with_categories")
        .select("*")
        .order("category_order", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch menu items by category
export const useMenuItemsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: menuKeys.itemsByCategory(categoryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `
          *,
          menu_categories!inner(*)
        `
        )
        .eq("category_id", categoryId)
        .eq("is_available", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
};

// Search menu items
export const useMenuSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: menuKeys.search(searchQuery),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_with_categories")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq("is_available", true)
        .order("category_order", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 0,
  });
};

// Get menu items grouped by category
export const useMenuByCategory = () => {
  const { data: menuItems } = useMenuItems();
  const { data: categories } = useMenuCategories();

  if (!menuItems || !categories) {
    return { data: null, isLoading: true };
  }

  const groupedMenu = categories.map((category) => ({
    ...category,
    items: menuItems.filter((item) => item.category_name === category.name),
  }));

  return { data: groupedMenu, isLoading: false };
};

// Get vegetarian/vegan items
export const useVegetarianItems = () => {
  return useQuery({
    queryKey: [...menuKeys.items(), "vegetarian"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_with_categories")
        .select("*")
        .eq("is_available", true)
        .or("is_vegetarian.eq.true,is_vegan.eq.true")
        .order("category_order", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Get popular items (items with most orders in last 7 days)
export const usePopularItems = () => {
  return useQuery({
    queryKey: [...menuKeys.items(), "popular"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from("order_items_details")
        .select(
          `
          menu_item_id,
          item_name,
          SUM(quantity) as total_ordered
        `
        )
        .gte("created_at", sevenDaysAgo)
        .group("menu_item_id, item_name")
        .order("total_ordered", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};
