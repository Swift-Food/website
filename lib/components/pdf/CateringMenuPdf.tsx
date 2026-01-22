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

// Dietary filter configuration with colors and abbreviations
const DIETARY_CONFIG: Record<string, { abbrev: string; label: string; color: string; bgColor: string }> = {
  vegetarian: { abbrev: "V", label: "Vegetarian", color: "#fff", bgColor: "#22c55e" },
  vegan: { abbrev: "VG", label: "Vegan", color: "#fff", bgColor: "#15803d" },
  halal: { abbrev: "H", label: "Halal", color: "#fff", bgColor: "#0d9488" },
  pescatarian: { abbrev: "P", label: "Pescatarian", color: "#fff", bgColor: "#3b82f6" },
  no_nut: { abbrev: "NN", label: "No Nuts", color: "#fff", bgColor: "#f97316" },
  no_dairy: { abbrev: "ND", label: "No Dairy", color: "#fff", bgColor: "#a855f7" },
  no_gluten: { abbrev: "GF", label: "Gluten Free", color: "#fff", bgColor: "#a16207" },
  nonvegetarian: { abbrev: "NV", label: "Non-Veg", color: "#fff", bgColor: "#dc2626" },
};

// Get all unique dietary filters from sessions for the legend
const getAllDietaryFilters = (sessions: PdfSession[]): string[] => {
  const filters = new Set<string>();
  sessions.forEach(session => {
    session.categories.forEach(category => {
      category.items.forEach(item => {
        if (item.dietaryFilters) {
          item.dietaryFilters.forEach(filter => {
            const key = filter.toLowerCase();
            if (DIETARY_CONFIG[key]) {
              filters.add(key);
            }
          });
        }
      });
    });
  });
  return Array.from(filters);
};
// =============================================================================

// Types
export interface PdfAddon {
  name: string;
  quantity: number;
  price?: number;
  groupTitle?: string;
  allergens?: string | string[];
  dietaryRestrictions?: string[];
}

export interface PdfMenuItem {
  quantity: number;
  name: string;
  description?: string;
  allergens?: string | string[];
  dietaryFilters?: string[];
  unitPrice?: number;
  image?: string;
  addons?: PdfAddon[];
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
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
  deliveryFee?: number;
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
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },
  menuItemContent: {
    flex: 1,
    paddingRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
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
  menuItemDietaryFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginBottom: 4,
    marginTop: 2,
  },
  dietaryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 3,
  },
  dietaryBadgeText: {
    fontSize: 7,
    fontWeight: 700,
  },
  dietaryLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#999",
    gap: 8,
  },
  dietaryLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dietaryLegendBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  dietaryLegendText: {
    fontSize: 6,
    color: "#666",
  },
  menuItemPrice: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 4,
  },
  menuItemPortions: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  menuItemAddons: {
    fontSize: 9,
    color: "#444",
    marginTop: 4,
    marginBottom: 4,
  },
  addonsContainer: {
    marginTop: 8,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#9ca3af",
  },
  addonsSection: {
    marginBottom: 6,
  },
  addonsSectionHeader: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 3,
  },
  addonBullet: {
    fontSize: 10,
    color: "#4b5563",
    marginRight: 6,
  },
  addonText: {
    fontSize: 10,
    color: "#4b5563",
  },
  addonDietaryBadges: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    gap: 2,
  },
  addonDietaryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  addonDietaryBadgeText: {
    fontSize: 7,
    fontWeight: 700,
  },
  addonAllergenText: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 4,
  },
  mainItemAllergenContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  mainItemAllergenLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1f2937",
  },
  mainItemAllergenText: {
    fontSize: 11,
    color: "#1f2937",
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
  totalCateringText: {
    fontSize: 13,
    fontWeight: 500,
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
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
    fontWeight: 400,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 500,
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
  const groupedAddons: Record<string, PdfAddon[]> = {};
  if (item.addons && item.addons.length > 0) {
    item.addons.forEach((addon) => {
      const group = addon.groupTitle || "Extra Add-ons";
      if (!groupedAddons[group]) {
        groupedAddons[group] = [];
      }
      groupedAddons[group].push(addon);
    });
  }

  // Calculate portions and serves
  const cateringQuantityUnit = item.cateringQuantityUnit || 1;
  const feedsPerUnit = item.feedsPerUnit || 1;
  const numPortions = Math.round(item.quantity / cateringQuantityUnit);
  const totalServes = Math.round(numPortions * feedsPerUnit);

  return (
    <View style={styles.menuItem} wrap={false}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>
          {item.quantity}x {item.name}
        </Text>
        {item.description && (
          <Text style={styles.menuItemDescription}>{item.description}</Text>
        )}
        {/* Addon sections with left border */}
        {Object.keys(groupedAddons).length > 0 && (
          <View style={styles.addonsContainer}>
            {Object.entries(groupedAddons).map(([groupTitle, addons]) => (
              <View key={groupTitle} style={styles.addonsSection}>
                <Text style={styles.addonsSectionHeader}>{groupTitle}:</Text>
                {addons.map((addon, idx) => {
                  const hasAllergens = addon.allergens && (
                    Array.isArray(addon.allergens) ? addon.allergens.length > 0 : addon.allergens.trim() !== ""
                  );
                  const allergenText = hasAllergens ? formatAllergens(addon.allergens) : "";
                  const hasDietary = addon.dietaryRestrictions && addon.dietaryRestrictions.length > 0;
                  return (
                    <View key={idx} style={styles.addonRow}>
                      <Text style={styles.addonBullet}>•</Text>
                      <Text style={styles.addonText}>
                        {addon.quantity > 1 ? `${addon.quantity}x ` : ""}{addon.name}
                      </Text>
                      {hasDietary && (
                        <View style={styles.addonDietaryBadges}>
                          {addon.dietaryRestrictions!.map((filter, filterIdx) => {
                            const config = DIETARY_CONFIG[filter.toLowerCase()];
                            if (!config) return null;
                            return (
                              <View key={filterIdx} style={[styles.addonDietaryBadge, { backgroundColor: config.bgColor }]}>
                                <Text style={[styles.addonDietaryBadgeText, { color: config.color }]}>{config.abbrev}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                      {allergenText && (
                        <Text style={styles.addonAllergenText}> (Allergen: {allergenText})</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
        {/* Main Item Allergen */}
        {item.allergens && (Array.isArray(item.allergens) ? item.allergens.length > 0 : item.allergens) && (
          <View style={styles.mainItemAllergenContainer}>
            <Text>
              <Text style={styles.mainItemAllergenLabel}>Main Item Allergen: </Text>
              <Text style={styles.mainItemAllergenText}>{formatAllergens(item.allergens)}</Text>
            </Text>
          </View>
        )}
        {/* Dietary badges */}
        {item.dietaryFilters && item.dietaryFilters.length > 0 && (
          <View style={styles.menuItemDietaryFilters}>
            {item.dietaryFilters.map((filter, idx) => {
              const config = DIETARY_CONFIG[filter.toLowerCase()];
              if (!config) return null;
              return (
                <View key={idx} style={[styles.dietaryBadge, { backgroundColor: config.bgColor }]}>
                  <Text style={[styles.dietaryBadgeText, { color: config.color }]}>{config.abbrev}</Text>
                </View>
              );
            })}
          </View>
        )}
        <Text style={styles.menuItemPortions}>
          {numPortions} portion{numPortions !== 1 ? "s" : ""} • Serves ~{totalServes} people
        </Text>
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
      <View key={sessionIndex}>
        {/* Session header - keep together */}
        <View wrap={false}>
          <Text style={styles.dateHeader}>{session.date}</Text>
          <View style={styles.dateUnderline} />
          <Text style={styles.sessionHeader}>
            {session.sessionName} {session.time}
          </Text>
        </View>

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
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.subtotalText}>
                Subtotal: £{session.subtotal.toFixed(2)}
              </Text>
              <Text style={[styles.deliveryText, { marginTop: 10 }]}>
                Delivery Fee: {session.deliveryFee !== undefined ? `£${session.deliveryFee.toFixed(2)}` : "TBC"}
              </Text>
            </View>
          </View>
        )}
      </View>
    ))}

    {showPrices && (
        <View style={styles.totalsContainer}>
          {/* Total Catering Costs */}
          <View style={styles.deliveryRow}>
            <Text style={styles.totalCateringText}>
              Total Catering Costs: £{sessions.reduce((sum, s) => sum + (s.subtotal || 0), 0).toFixed(2)}
            </Text>
          </View>
          {/* Total Delivery Costs */}
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryText}>
              Total Delivery Costs: {deliveryCharge !== undefined ? `£${deliveryCharge.toFixed(2)}` : "TBC"}
            </Text>
          </View>
          {/* Total Cost */}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total Cost: {deliveryCharge !== undefined
                ? `£${(sessions.reduce((sum, s) => sum + (s.subtotal || 0), 0) + deliveryCharge).toFixed(2)}`
                : `£${sessions.reduce((sum, s) => sum + (s.subtotal || 0), 0).toFixed(2)} + Delivery Costs TBC`}
            </Text>
          </View>
        </View>
      )}

    <View style={styles.footer} fixed>
      {/* Dietary Legend */}
      {getAllDietaryFilters(sessions).length > 0 && (
        <View style={styles.dietaryLegend}>
          {getAllDietaryFilters(sessions).map((filterKey) => {
            const config = DIETARY_CONFIG[filterKey];
            if (!config) return null;
            return (
              <View key={filterKey} style={styles.dietaryLegendItem}>
                <View style={[styles.dietaryLegendBadge, { backgroundColor: config.bgColor }]}>
                  <Text style={[styles.dietaryBadgeText, { color: config.color, fontSize: 5 }]}>{config.abbrev}</Text>
                </View>
                <Text style={styles.dietaryLegendText}>{config.label}</Text>
              </View>
            );
          })}
        </View>
      )}
      <Text style={[styles.footerText, { marginTop: 4 }]}>
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
