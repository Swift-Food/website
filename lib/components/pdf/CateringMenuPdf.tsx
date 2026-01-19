"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// =============================================================================
// FONT CONFIGURATION - Change font here
// =============================================================================
// Options: 'ibm-plex-mono' | 'jetbrains-mono' | 'fira-code' | 'courier' (built-in)
const ACTIVE_FONT: keyof typeof FONT_CONFIGS = "courier";

interface FontConfig {
  family: string;
  fonts: Array<{
    src: string;
    fontWeight: number;
    fontStyle?: "normal" | "italic" | "oblique";
  }>;
}

const FONT_CONFIGS: Record<string, FontConfig> = {
  "ibm-plex-mono": {
    family: "IBM Plex Mono",
    fonts: [
      { src: "/fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/IBM_Plex_Mono/IBMPlexMono-Bold.ttf", fontWeight: 700 },
      {
        src: "/fonts/IBM_Plex_Mono/IBMPlexMono-Italic.ttf",
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  },
  "jetbrains-mono": {
    family: "JetBrains Mono",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yK9jOVmUsaaDhw.woff2",
        fontWeight: 700,
      },
    ],
  },
  "fira-code": {
    family: "Fira Code",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/firacode/v21/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sJVD7Ng.woff2",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/firacode/v21/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_ONrJVD7Ng.woff2",
        fontWeight: 700,
      },
    ],
  },
  courier: {
    family: "Courier",
    fonts: [], // Built-in, no registration needed
  },
};

// Register font if not built-in
const fontConfig = FONT_CONFIGS[ACTIVE_FONT];
if (fontConfig.fonts.length > 0) {
  Font.register({
    family: fontConfig.family,
    fonts: fontConfig.fonts,
  });
}

// Font family references
const FONT_FAMILY = fontConfig.family;

// Helper to format allergen names (e.g., "cereals_containing_gluten" -> "Cereals Containing Gluten")
const formatAllergen = (allergen: string): string => {
  return allergen
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper to normalize and format allergens (handles both string and array input)
const formatAllergens = (allergens: string | string[] | undefined): string => {
  if (!allergens) return "";

  // If it's a string, it might be comma-separated or a single allergen
  const allergenArray = typeof allergens === "string"
    ? allergens.split(",").map(a => a.trim())
    : allergens;

  return allergenArray.map(formatAllergen).join(", ");
};
// =============================================================================

// Types
export interface PdfAddon {
  name: string;
  quantity: number;
  price?: number;
  groupTitle?: string;
}

export interface PdfMenuItem {
  quantity: number;
  name: string;
  description?: string;
  allergens?: string | string[];
  unitPrice?: number;
  image?: string;
  addons?: PdfAddon[];
}

export interface PdfCategory {
  name: string;
  items: PdfMenuItem[];
}

export interface PdfSession {
  date: string;
  sessionName: string;
  time: string;
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
  coverPage: {
    backgroundColor: "#efeae0",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 24,
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
    marginHorizontal: 20,
    letterSpacing: 1,
  },
  coverBrandName: {
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: 2,
  },
  menuPage: {
    backgroundColor: "#efeae0",
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
  },
  dateHeader: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateUnderline: {
    height: 1,
    backgroundColor: "#000",
    marginBottom: 16,
  },
  sessionHeader: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  categoryHeader: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: 8,
    textDecoration: "underline",
    alignSelf: "flex-start",
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
    fontWeight: 700,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 4,
    color: "#333",
  },
  menuItemAllergens: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#333",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 4,
  },
  menuItemAddons: {
    fontSize: 9,
    color: "#444",
    marginTop: 4,
    marginBottom: 4,
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
    marginBottom: 32,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 700,
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
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#666",
  },
});

// Cover Page Component - Using pre-designed image
const CoverPage: React.FC = () => (
  <Page size="A4">
    <Image src="/Swift_PDF_Cover_Page.png" style={{ width: "100%", height: "100%" }} />
  </Page>
);

// Original Cover Page Component (commented out)
// const CoverPageOriginal: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => (
//   <Page size="A4" style={styles.coverPage}>
//     <Text style={styles.coverTitle}>FOOD CATERING MENU</Text>
//     <View style={styles.coverTitleUnderline} />
//     {logoUrl && <Image src={logoUrl} style={styles.coverLogo} />}
//     <View style={styles.coverTagline}>
//       <Text style={styles.coverTaglineText}>Local</Text>
//       <Text style={styles.coverTaglineText}>Simple</Text>
//       <Text style={styles.coverTaglineText}>Reliable</Text>
//     </View>
//     <Text style={styles.coverBrandName}>SWIFT FOOD</Text>
//   </Page>
// );

// Menu Item Component
const MenuItem: React.FC<{ item: PdfMenuItem; showPrice: boolean }> = ({
  item,
  showPrice,
}) => {
  // Group addons by groupTitle
  const groupedAddons: Record<string, Array<{ name: string; quantity: number }>> = {};
  if (item.addons && item.addons.length > 0) {
    item.addons.forEach((addon) => {
      const group = addon.groupTitle || "Options";
      if (!groupedAddons[group]) {
        groupedAddons[group] = [];
      }
      groupedAddons[group].push({ name: addon.name, quantity: addon.quantity });
    });
  }

  // Format addons as a single line: "Group: item1, item2 | Group2: item3"
  const addonsText = Object.entries(groupedAddons)
    .map(([groupTitle, addons]) => {
      const addonsList = addons
        .map((a) => `${a.quantity > 1 ? `${a.quantity}x ` : ""}${a.name}`)
        .join(", ");
      return `${groupTitle}: ${addonsList}`;
    })
    .join("  |  ");

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>
          {item.quantity}x {item.name}
        </Text>
        {item.description && (
          <Text style={styles.menuItemDescription}>{item.description}</Text>
        )}
        {addonsText && (
          <Text style={styles.menuItemAddons}>{addonsText}</Text>
        )}
        {item.allergens && (Array.isArray(item.allergens) ? item.allergens.length > 0 : item.allergens) && (
          <Text style={styles.menuItemAllergens}>
            Allergen: {formatAllergens(item.allergens)}
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
};

// Menu Content Component
const MenuContent: React.FC<{
  sessions: PdfSession[];
  showPrices: boolean;
  deliveryCharge?: number;
  totalPrice?: number;
}> = ({ sessions, showPrices, deliveryCharge, totalPrice }) => (
  <Page size="A4" style={styles.menuPage} wrap>
    {sessions.map((session, sessionIndex) => (
      <View key={sessionIndex} wrap={false}>
        <Text style={styles.dateHeader}>{session.date}</Text>
        <View style={styles.dateUnderline} />
        <Text style={styles.sessionHeader}>
          {session.sessionName} {session.time}
        </Text>

        {session.categories.map((category, catIndex) => (
          <View key={catIndex}>
            {session.categories.length > 1 && (
              <Text style={styles.categoryHeader}>
                {category.name}
              </Text>
            )}
            {category.items.map((item, itemIndex) => (
              <MenuItem key={itemIndex} item={item} showPrice={showPrices} />
            ))}
          </View>
        ))}

        {showPrices && session.subtotal !== undefined && (
          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalText}>
              Subtotal: £{session.subtotal.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    ))}

    {showPrices &&
      (deliveryCharge !== undefined || totalPrice !== undefined) && (
        <View style={styles.totalsContainer}>
          {/* Calculate and show overall subtotal (sum of all sessions) */}
          {/* {sessions.length > 0 && (
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryText}>
                Subtotal: £{sessions.reduce((sum, s) => sum + (s.subtotal || 0), 0).toFixed(2)}
              </Text>
            </View>
          )}
          {deliveryCharge !== undefined && deliveryCharge > 0 && (
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryText}>
                Delivery Charge: £{Number(deliveryCharge).toFixed(2)}
              </Text>
            </View>
          )} */}
          {totalPrice !== undefined && (
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Total Catering Cost:  £{sessions.reduce((sum, s) => sum + (s.subtotal || 0), 0).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        *Images are for illustrative purposes only. Actual dishes may vary in
        appearance, portion size, and presentation due to preparation and
        ingredient differences.
      </Text>
    </View>
  </Page>
);

// Main Document Component
export const CateringMenuPdf: React.FC<CateringMenuPdfProps> = ({
  sessions,
  showPrices,
  deliveryCharge,
  totalPrice,
  // logoUrl: _logoUrl, // Currently unused - cover page uses static image
}) => (
  <Document>
    <CoverPage />
    <MenuContent
      sessions={sessions}
      showPrices={showPrices}
      deliveryCharge={deliveryCharge}
      totalPrice={totalPrice}
    />
  </Document>
);

export default CateringMenuPdf;
