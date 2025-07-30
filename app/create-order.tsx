import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCreateOrder } from "../hooks/useOrders";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MenuItem } from "../lib/supabase";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse cart from navigation params
  const cart: CartItem[] = params.cart ? JSON.parse(params.cart as string) : [];
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = useCreateOrder();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (!tableNumber.trim()) {
      Alert.alert("Error", "Please enter a table number");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Error", "Please add items to your order");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        table_number: tableNumber.trim(),
        items: cart.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          unit_price: item.menuItem.price,
          special_instructions: item.specialInstructions,
        })),
        notes: notes.trim() || undefined,
      };

      await createOrderMutation.mutateAsync(orderData);

      Alert.alert("Success", "Order created successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Order creation error:", error);
      let errorMessage = "Failed to create order";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CartItemRow = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemRow}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.menuItem.name}</Text>
        <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
      </View>
      <Text style={styles.cartItemPrice}>
        £{(item.menuItem.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Button
            title="Back"
            variant="ghost"
            size="small"
            icon="arrow-back"
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Create Order</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Table Number Input */}
          <Card variant="default" padding="medium" margin="medium">
            <Text style={styles.sectionTitle}>Table Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="restaurant"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter table number"
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="number-pad"
                autoFocus
              />
            </View>
          </Card>

          {/* Order Summary */}
          <Card variant="default" padding="medium" margin="medium">
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.orderItems}>
              {cart.map((item, index) => (
                <CartItemRow key={index} item={item} />
              ))}
            </View>

            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total ({totalItems} items)</Text>
              <Text style={styles.totalPrice}>£{totalPrice.toFixed(2)}</Text>
            </View>
          </Card>

          {/* Notes */}
          <Card variant="default" padding="medium" margin="medium">
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any special instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Create Order"
            size="large"
            fullWidth
            loading={isSubmitting}
            onPress={handleCreateOrder}
            disabled={!tableNumber.trim() || cart.length === 0}
          />

          {/* Real Database Info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Database Info:</Text>
            <Text style={styles.debugText}>Cart Items: {cart.length}</Text>
            <Text style={styles.debugText}>Table: {tableNumber}</Text>
            <Text style={styles.debugText}>
              Total: £{totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  orderItems: {
    marginBottom: 16,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  cartItemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    flex: 1,
  },
  cartItemQuantity: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
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
  notesInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
});
