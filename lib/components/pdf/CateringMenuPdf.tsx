"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// Using Courier (built-in monospace font) as fallback
// IBM Plex Mono requires TTF files to be served locally
const FONT_FAMILY = "Courier";
const FONT_FAMILY_BOLD = "Courier-Bold";
const FONT_FAMILY_ITALIC = "Courier-Oblique";

// Types
export interface PdfMenuItem {
  quantity: number;
  name: string;
  description?: string;
  allergens?: string[];
  unitPrice?: number;
  image?: string;
}

export interface PdfCategory {
  name: string;
  items: PdfMenuItem[];
}

export interface PdfSession {
  date: string; // "December 5"
  sessionName: string; // "Dinner"
  time: string; // "19:00"
  categories: PdfCategory[];
  subtotal?: number;
}

export interface CateringMenuPdfProps {
  sessions: PdfSession[];
  showPrices: boolean;
  deliveryCharge?: number;
  totalPrice?: number;
  logoUrl?: string;
}

// Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#efeae0",
    padding: 40,
    fontFamily: FONT_FAMILY,
  },
  // Cover page styles
  coverPage: {
    backgroundColor: "#efeae0",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY_BOLD,
    letterSpacing: 4,
    marginBottom: 8,
  },
  coverTitleUnderline: {
    width: 280,
    height: 1,
    backgroundColor: "#000",
    marginBottom: 40,
  },
  coverLogo: {
    width: 280,
    height: 280,
    marginBottom: 40,
  },
  coverTagline: {
    flexDirection: "row",
    marginBottom: 30,
  },
  coverTaglineText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    marginHorizontal: 20,
    letterSpacing: 1,
  },
  coverBrandName: {
    fontSize: 48,
    fontFamily: FONT_FAMILY_BOLD,
    letterSpacing: 2,
  },
  // Menu page styles
  menuPage: {
    backgroundColor: "#efeae0",
    padding: 40,
    paddingBottom: 60,
    fontFamily: FONT_FAMILY,
  },
  dateHeader: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    marginBottom: 4,
  },
  dateUnderline: {
    height: 1,
    backgroundColor: "#000",
    marginBottom: 16,
  },
  sessionHeader: {
    fontSize: 20,
    fontFamily: FONT_FAMILY_BOLD,
    marginBottom: 8,
  },
  categoryHeader: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    marginBottom: 12,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  menuItemContent: {
    flex: 1,
    paddingRight: 12,
  },
  menuItemName: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_BOLD,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_ITALIC,
    marginBottom: 4,
    color: "#333",
  },
  menuItemAllergens: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_ITALIC,
    color: "#333",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_ITALIC,
    marginTop: 4,
  },
  menuItemImage: {
    width: 100,
    height: 70,
    objectFit: "cover",
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  subtotalText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_BOLD,
  },
  totalsContainer: {
    marginTop: 24,
    paddingTop: 16,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  totalText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY_BOLD,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 8,
    fontFamily: FONT_FAMILY_ITALIC,
    color: "#666",
  },
});

// Cover Page Component
const CoverPage: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTitle}>FOOD CATERING MENU</Text>
    <View style={styles.coverTitleUnderline} />
    {logoUrl && <Image src={logoUrl} style={styles.coverLogo} />}
    <View style={styles.coverTagline}>
      <Text style={styles.coverTaglineText}>Local</Text>
      <Text style={styles.coverTaglineText}>Simple</Text>
      <Text style={styles.coverTaglineText}>Reliable</Text>
    </View>
    <Text style={styles.coverBrandName}>SWIFT FOOD</Text>
  </Page>
);

// Menu Item Component
const MenuItem: React.FC<{ item: PdfMenuItem; showPrice: boolean }> = ({
  item,
  showPrice,
}) => (
  <View style={styles.menuItem}>
    <View style={styles.menuItemContent}>
      <Text style={styles.menuItemName}>
        {item.quantity}x {item.name}
      </Text>
      {item.description && (
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      )}
      {item.allergens && item.allergens.length > 0 && (
        <Text style={styles.menuItemAllergens}>
          Allergen: {item.allergens.join(", ")}
        </Text>
      )}
      {showPrice && item.unitPrice !== undefined && (
        <Text style={styles.menuItemPrice}>
          Unit Price £{" "}
          {item.unitPrice === 0 ? "FREE" : item.unitPrice.toFixed(2)}
        </Text>
      )}
    </View>
    {item.image && <Image src={item.image} style={styles.menuItemImage} />}
  </View>
);

// Menu Page Component - renders sessions with their categories
const MenuContent: React.FC<{
  sessions: PdfSession[];
  showPrices: boolean;
  deliveryCharge?: number;
  totalPrice?: number;
}> = ({ sessions, showPrices, deliveryCharge, totalPrice }) => {
  // Group content into pages - we'll let react-pdf handle page breaks naturally
  return (
    <Page size="A4" style={styles.menuPage} wrap>
      {sessions.map((session, sessionIndex) => (
        <View key={sessionIndex} wrap={false}>
          {/* Date Header */}
          <Text style={styles.dateHeader}>{session.date}</Text>
          <View style={styles.dateUnderline} />

          {/* Session Header */}
          <Text style={styles.sessionHeader}>
            {session.sessionName} {session.time}
          </Text>

          {/* Categories and Items */}
          {session.categories.map((category, catIndex) => (
            <View key={catIndex}>
              {/* Only show category header if there are multiple categories or it's meaningful */}
              {session.categories.length > 1 && (
                <Text style={styles.categoryHeader}>
                  Category: {category.name}
                </Text>
              )}

              {/* Menu Items */}
              {category.items.map((item, itemIndex) => (
                <MenuItem key={itemIndex} item={item} showPrice={showPrices} />
              ))}
            </View>
          ))}

          {/* Session Subtotal */}
          {showPrices && session.subtotal !== undefined && (
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalText}>
                Sub Total: £ {session.subtotal.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      ))}

      {/* Final Totals - only on last page */}
      {showPrices &&
        (deliveryCharge !== undefined || totalPrice !== undefined) && (
          <View style={styles.totalsContainer}>
            {deliveryCharge !== undefined && deliveryCharge > 0 && (
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryText}>
                  Delivery Charge: £ {deliveryCharge}
                </Text>
              </View>
            )}
            {totalPrice !== undefined && (
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>
                  Total Price: £ {totalPrice.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          *Images are for illustrative purposes only. Actual dishes may vary in
          appearance, portion size, and presentation due to preparation and
          ingredient differences.
        </Text>
      </View>
    </Page>
  );
};

// Main Document Component
export const CateringMenuPdf: React.FC<CateringMenuPdfProps> = ({
  sessions,
  showPrices,
  deliveryCharge,
  totalPrice,
  logoUrl,
}) => (
  <Document>
    <CoverPage logoUrl={logoUrl} />
    <MenuContent
      sessions={sessions}
      showPrices={showPrices}
      deliveryCharge={deliveryCharge}
      totalPrice={totalPrice}
    />
  </Document>
);

export default CateringMenuPdf;
