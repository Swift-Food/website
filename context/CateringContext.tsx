// context/CateringContext.tsx

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EventDetails, SelectedMenuItem, ContactInfo } from '@/types/catering.types';

interface CateringContextType {
  currentStep: number;
  eventDetails: EventDetails | null;
  selectedItems: SelectedMenuItem[];
  contactInfo: ContactInfo | null;
  setCurrentStep: (step: number) => void;
  setEventDetails: (details: EventDetails) => void;
  addMenuItem: (item: SelectedMenuItem) => void;
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

  const addMenuItem = (newItem: SelectedMenuItem) => {
    // Ensure quantity is a multiple of 10
    const validQuantity = Math.max(10, Math.round(newItem.quantity / 10) * 10);
    
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

    const validQuantity = Math.max(10, Math.round(quantity / 10) * 10);
    
    setSelectedItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, quantity: validQuantity } : i))
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
        setCurrentStep,
        setEventDetails,
        addMenuItem,
        removeMenuItem,
        updateItemQuantity,
        setContactInfo,
        getTotalPrice,
        resetOrder,
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