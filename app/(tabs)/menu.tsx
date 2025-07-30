import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMenuByCategory, useMenuSearch } from "../../hooks/useMenu";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
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
  const [showCart, setShowCart] = useState(false);

  const { data: menuData, isLoading } = useMenuByCategory();
  const { data: searchResults } = useMenuSearch(searchQuery);

  const displayData = searchQuery ? searchResults : menuData;
  const categories = displayData?.map((cat) => cat.name) || [];

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

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
    setShowCart(true);
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
    setShowCart(false);
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

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <Card variant="default" padding="medium" margin="small">
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          )}
          <View style={styles.menuItemBadges}>
            {item.is_vegetarian && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>V</Text>
              </View>
            )}
            {item.is_vegan && (
              <View style={[styles.badge, styles.veganBadge]}>
                <Text style={styles.badgeText}>VG</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.menuItemPrice}>
          <Text style={styles.priceText}>£{item.price.toFixed(2)}</Text>
          <Button
            title="Add"
            variant="primary"
            size="small"
            onPress={() => addToCart(item)}
          />
        </View>
      </View>
    </Card>
  );

  const CartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.menuItem.name}</Text>
        <Text style={styles.cartItemPrice}>
          £{(item.menuItem.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#ef4444" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setShowCart(!showCart)}
        >
          <Ionicons name="cart" size={24} color="#3b82f6" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!showCart ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#64748b"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search menu items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <CategoryTab
                key={category}
                category={category}
                isSelected={selectedCategory === category}
              />
            ))}
          </ScrollView>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading menu...</Text>
              </View>
            ) : displayData ? (
              displayData
                .filter(
                  (category) =>
                    !selectedCategory || category.name === selectedCategory
                )
                .map((category) => (
                  <View key={category.name}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    {category.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </View>
                ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No menu items</Text>
                <Text style={styles.emptySubtitle}>
                  Menu items will appear here
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        /* Cart View */
        <View style={styles.cartContainer}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Your Order</Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearCartText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartItemsContainer}>
            {cart.length > 0 ? (
              cart.map((item) => (
                <CartItem key={item.menuItem.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={48} color="#64748b" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            )}
          </ScrollView>

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>£{totalPrice.toFixed(2)}</Text>
              </View>
              <Button
                title="Create Order"
                size="large"
                fullWidth
                onPress={() => {
                  router.push({
                    pathname: "/create-order",
                    params: { cart: JSON.stringify(cart) }
                  });
                }}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  categoryTabActive: {
    backgroundColor: "#3b82f6",
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  categoryTabTextActive: {
    color: "#ffffff",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 24,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  menuItemBadges: {
    flexDirection: "row",
    gap: 4,
  },
  badge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  veganBadge: {
    backgroundColor: "#8b5cf6",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  menuItemPrice: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  cartContainer: {
    flex: 1,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  clearCartText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
  cartItemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 20,
    textAlign: "center",
  },
  emptyCart: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  cartFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
});
