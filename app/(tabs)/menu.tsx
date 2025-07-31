import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useMenuByCategory, useMenuSearch } from "../../hooks/useMenu";
import { MenuItem } from "../../lib/supabase";

const { width } = Dimensions.get("window");

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function MenuScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartAnimation] = useState(new Animated.Value(0));

  const { data: menuData, isLoading } = useMenuByCategory();
  const { data: searchResults } = useMenuSearch(searchQuery);

  const displayData = searchQuery ? searchResults : menuData;
  const categories = displayData?.map((cat) => cat.name) || [];

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Animate cart summary when items are added/removed
  useEffect(() => {
    if (totalItems > 0) {
      Animated.spring(cartAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(cartAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [totalItems]);

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCreateOrder = () => {
    router.push({
      pathname: "/create-order",
      params: { cart: JSON.stringify(cart) },
    });
    // Clear cart after navigating (simulating successful order creation)
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  const CategoryTab = ({
    category,
    isSelected,
  }: {
    category: string;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryTabText,
          isSelected && styles.categoryTabTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const MenuItemCard = ({ item }: { item: MenuItem }) => {
    const cartItem = cart.find((cartItem) => cartItem.menuItem.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <View style={styles.menuItemCard}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            )}
            <View style={styles.menuItemFooter}>
              <View style={styles.menuItemBadges}>
                {item.is_vegetarian && (
                  <View style={[styles.badge, styles.vegetarianBadge]}>
                    <Ionicons name="leaf" size={10} color="#16a34a" />
                    <Text style={[styles.badgeText, { color: "#16a34a" }]}>
                      Veg
                    </Text>
                  </View>
                )}
                {item.is_vegan && (
                  <View style={[styles.badge, styles.veganBadge]}>
                    <Ionicons name="leaf" size={10} color="#7c3aed" />
                    <Text style={[styles.badgeText, { color: "#7c3aed" }]}>
                      Vegan
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.priceText}>£{item.price.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.menuItemActions}>
            {quantity > 0 ? (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, quantity - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#ef4444" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#10b981" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryTab,
              !selectedCategory && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryTabText,
                !selectedCategory && styles.categoryTabTextActive,
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <CategoryTab
              key={category}
              category={category}
              isSelected={selectedCategory === category}
            />
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={[
          styles.menuContainer,
          totalItems > 0 && styles.menuContainerWithCart,
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="restaurant" size={32} color="#4f46e5" />
            </View>
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : displayData ? (
          <View style={styles.menuGrid}>
            {displayData
              .filter(
                (category) =>
                  !selectedCategory || category.name === selectedCategory
              )
              .map((category) => (
                <View key={category.name} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <View style={styles.categoryDivider} />
                  </View>
                  <View style={styles.categoryItems}>
                    {category.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="restaurant-outline" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>No menu items found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or check back later
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Live Cart Summary - Now at bottom */}
      <Animated.View
        style={[
          styles.cartSummary,
          {
            transform: [
              {
                translateY: cartAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: cartAnimation,
          },
        ]}
      >
        <View style={styles.cartSummaryContent}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{totalItems} items</Text>
            <Text style={styles.cartTotal}>£{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.cartActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCart}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createOrderButton}
              onPress={handleCreateOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.createOrderText}>Create Order</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.card,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  cartSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cartSummaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e7ff",
  },
  cartTotal: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
  },
  cartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  createOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createOrderText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary[500],
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background.card,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "400",
  },
  categoriesWrapper: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  categoryTabTextActive: {
    color: "#ffffff",
  },
  menuContainer: {
    flex: 1,
  },
  menuContainerWithCart: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind cart
  },
  menuContent: {
    paddingBottom: 24,
  },
  menuGrid: {
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  categoryDivider: {
    height: 3,
    backgroundColor: Colors.primary[500],
    width: 40,
    borderRadius: 2,
  },
  categoryItems: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingSpinner: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: Colors.primary[50],
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: "#f8fafc",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  menuItemCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    shadowColor: Colors.border.dark,
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
    lineHeight: 22,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemBadges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  vegetarianBadge: {
    backgroundColor: "#f0fdf4",
  },
  veganBadge: {
    backgroundColor: "#faf5ff",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuItemActions: {
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: Colors.primary[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 4,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    minWidth: 20,
    textAlign: "center",
  },
});
