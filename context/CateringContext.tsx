// context/CateringContext.tsx

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EventDetails, SelectedMenuItem, ContactInfo } from '@/types/catering.types';

interface CateringContextType {
  currentStep: number;
  eventDetails: EventDetails | null;
  selectedItems: SelectedMenuItem[];
  contactInfo: ContactInfo | null;
  promoCodes: string[] | null,
  setCurrentStep: (step: number) => void;
  setEventDetails: (details: EventDetails) => void;
  addMenuItem: (item: SelectedMenuItem) => void;
  setPromoCodes: (code : string[]) => void;
  removeMenuItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  setContactInfo: (info: ContactInfo) => void;
  getTotalPrice: () => number;
  resetOrder: () => void;
  

}

const CateringContext = createContext<CateringContextType | undefined>(undefined);

export function CateringProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedMenuItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [promoCodes, setPromoCodes] = useState<string[]>([]);

  const addMenuItem = (newItem: SelectedMenuItem) => {
    // Store the exact quantity (multiples of 7)
    const validQuantity = Math.max(7, newItem.quantity);
    
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.item.id === newItem.item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += validQuantity;
        return updated;
      }
      return [...prev, { ...newItem, quantity: validQuantity }];
    });
  };
  
 

  const removeMenuItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMenuItem(itemId);
      return;
    }
    
    // Store the exact quantity (no rounding to 10)
    setSelectedItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, quantity: quantity } : i))
    );
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || '0');
      const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
      const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
      return total + itemPrice * quantity;
    }, 0);
  };

  const resetOrder = () => {
    setCurrentStep(1);
    setEventDetails(null);
    setSelectedItems([]);
    setContactInfo(null);
  };

  return (
    <CateringContext.Provider
      value={{
        currentStep,
        eventDetails,
        selectedItems,
        contactInfo,
        promoCodes,
        setCurrentStep,
        setEventDetails,
        addMenuItem,
        removeMenuItem,
        updateItemQuantity,
        setContactInfo,
        getTotalPrice,
        resetOrder,
        setPromoCodes,
      }}
    >
      {children}
    </CateringContext.Provider>
  );
}

export function useCatering() {
  const context = useContext(CateringContext);
  if (!context) {
    throw new Error('useCatering must be used within CateringProvider');
  }
  return context;
}