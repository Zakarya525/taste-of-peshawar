import React, { useState, useMemo } from "react";
import {
  View,
  Text,
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
      className={`px-4 py-2 rounded-full ${
        isSelected ? "bg-blue-600" : "bg-gray-200"
      }`}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-gray-700"
        }`}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <Card variant="default" padding="medium" margin="small">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            {item.name}
          </Text>
          {item.description && (
            <Text className="text-sm text-gray-600 mb-2">
              {item.description}
            </Text>
          )}
          <View className="flex-row gap-2">
            {item.is_vegetarian && (
              <View className="bg-green-500 px-3 py-1 rounded-md">
                <Text className="text-xs font-bold text-white">V</Text>
              </View>
            )}
            {item.is_vegan && (
              <View className="bg-purple-600 px-3 py-1 rounded-md">
                <Text className="text-xs font-bold text-white">VG</Text>
              </View>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-gray-900 mb-2">
            £{item.price.toFixed(2)}
          </Text>
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
    <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {item.menuItem.name}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          £{(item.menuItem.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#ef4444" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-900 min-w-[20px] text-center">
          {item.quantity}
        </Text>
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Menu</Text>
        <TouchableOpacity
          className="relative p-2"
          onPress={() => setShowCart(!showCart)}
        >
          <Ionicons name="cart" size={24} color="#3b82f6" />
          {totalItems > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!showCart ? (
        <>
          {/* Search Bar */}
          <View className="px-4 py-4">
            <View className="flex-row items-center bg-white rounded-lg p-4 min-h-12 shadow-sm">
              <Ionicons
                name="search"
                size={20}
                color="#64748b"
                className="mr-3"
              />
              <TextInput
                className="flex-1 text-base text-gray-900"
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
            className="bg-white border-b border-gray-200"
          >
            <View className="flex-row px-4 py-3">
              {categories.map((category) => (
                <CategoryTab
                  key={category}
                  category={category}
                  isSelected={selectedCategory === category}
                />
              ))}
            </View>
          </ScrollView>

          {/* Menu Items */}
          <ScrollView className="px-4">
            {isLoading ? (
              <View className="flex items-center py-10">
                <Text className="text-base text-gray-600">Loading menu...</Text>
              </View>
            ) : displayData ? (
              displayData
                .filter(
                  (category) =>
                    !selectedCategory || category.name === selectedCategory
                )
                .map((category) => (
                  <View key={category.name}>
                    <Text className="text-xl font-bold text-gray-900 mb-6 mt-6">
                      {category.name}
                    </Text>
                    {category.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </View>
                ))
            ) : (
              <View className="flex items-center py-10">
                <Ionicons name="restaurant-outline" size={48} color="#64748b" />
                <Text className="text-lg font-semibold text-gray-900 mt-6">
                  No menu items
                </Text>
                <Text className="text-base text-gray-600 mt-2">
                  Menu items will appear here
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        /* Cart View */
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Your Order</Text>
            <TouchableOpacity onPress={clearCart}>
              <Text className="text-base text-red-500 font-medium">Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="px-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <CartItem key={item.menuItem.id} item={item} />
              ))
            ) : (
              <View className="flex items-center py-10">
                <Ionicons name="cart-outline" size={48} color="#64748b" />
                <Text className="text-base text-gray-600 mt-6">
                  Your cart is empty
                </Text>
              </View>
            )}
          </ScrollView>

          {cart.length > 0 && (
            <View className="px-4 py-4 bg-white border-t border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-2xl font-bold text-gray-900">
                  £{totalPrice.toFixed(2)}
                </Text>
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
