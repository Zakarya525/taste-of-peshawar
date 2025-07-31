import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Colors } from "../constants/Colors";
import { useCreateOrder } from "../hooks/useOrders";
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
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName}>{item.menuItem.name}</Text>
          {item.specialInstructions && (
            <Text style={styles.cartItemInstructions}>
              Note: {item.specialInstructions}
            </Text>
          )}
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.cartItemQuantity}>×{item.quantity}</Text>
        </View>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Order</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Table Number Input */}
          <Card
            variant="default"
            padding="medium"
            margin="medium"
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="restaurant"
                size={20}
                color={Colors.primary[500]}
              />
              <Text style={styles.sectionTitle}>Table Number</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="keypad"
                size={20}
                color={Colors.text.tertiary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter table number"
                placeholderTextColor={Colors.text.muted}
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="number-pad"
                autoFocus
              />
              {tableNumber && (
                <View style={styles.validationIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success[500]}
                  />
                </View>
              )}
            </View>
          </Card>

          {/* Order Summary */}
          <Card
            variant="default"
            padding="medium"
            margin="medium"
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={20} color={Colors.primary[500]} />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            {cart.length > 0 ? (
              <>
                <View style={styles.orderItems}>
                  {cart.map((item, index) => (
                    <CartItemRow key={index} item={item} />
                  ))}
                </View>

                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items</Text>
                    <Text style={styles.summaryValue}>{totalItems}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      £{totalPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>
                      £{totalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="basket-outline"
                  size={48}
                  color={Colors.neutral[300]}
                />
                <Text style={styles.emptyText}>No items in cart</Text>
              </View>
            )}
          </Card>

          {/* Notes Section */}
          <Card
            variant="default"
            padding="medium"
            margin="medium"
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text"
                size={20}
                color={Colors.primary[500]}
              />
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <Text style={styles.optionalLabel}>(Optional)</Text>
            </View>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any special instructions for the kitchen..."
                placeholderTextColor={Colors.text.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.notesFooter}>
                <Text style={styles.characterCount}>
                  {notes.length}/200 characters
                </Text>
              </View>
            </View>
          </Card>

          {/* Order Summary Card */}
          {cart.length > 0 && tableNumber && (
            <Card
              variant="default"
              padding="medium"
              margin="medium"
              style={styles.previewCard}
            >
              <View style={styles.previewHeader}>
                <Ionicons name="eye" size={20} color={Colors.secondary[500]} />
                <Text style={styles.previewTitle}>Order Preview</Text>
              </View>
              <View style={styles.previewContent}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Table</Text>
                  <Text style={styles.previewValue}>#{tableNumber}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Items</Text>
                  <Text style={styles.previewValue}>{totalItems} dishes</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total</Text>
                  <Text style={styles.previewTotal}>
                    £{totalPrice.toFixed(2)}
                  </Text>
                </View>
                {notes && (
                  <View style={styles.previewNotesRow}>
                    <Text style={styles.previewLabel}>Notes</Text>
                    <Text style={styles.previewNotes}>{notes}</Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Footer with Submit Button */}
        <View style={styles.footer}>
          <Button
            title={isSubmitting ? "Creating Order..." : "Create Order"}
            size="large"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onPress={handleCreateOrder}
            disabled={!tableNumber.trim() || cart.length === 0}
            style={styles.submitButton}
          />

          <View style={styles.footerInfo}>
            <View style={styles.infoItem}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.text.tertiary}
              />
              <Text style={styles.infoText}>
                Order will be sent directly to the kitchen
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  optionalLabel: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: "italic",
    marginLeft: "auto",
  },

  // Input Section
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  validationIcon: {
    marginLeft: 8,
  },

  // Cart Items
  orderItems: {
    marginBottom: 20,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  cartItemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 16,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  cartItemInstructions: {
    fontSize: 14,
    color: Colors.warning[600],
    fontStyle: "italic",
  },
  quantityContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  cartItemQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary[600],
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },

  // Order Summary
  orderSummary: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary[500],
  },

  // Notes Section
  notesContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  notesInput: {
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "right",
  },

  // Preview Card
  previewCard: {
    backgroundColor: Colors.secondary[50],
    borderColor: Colors.secondary[200],
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary[700],
  },
  previewContent: {
    gap: 12,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  previewValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  previewTotal: {
    fontSize: 16,
    color: Colors.secondary[600],
    fontWeight: "700",
  },
  previewNotesRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  previewNotes: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  submitButton: {
    marginBottom: 12,
  },
  footerInfo: {
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
