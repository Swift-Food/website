import { useState } from 'react';
import { cateringService } from '@/services/api/catering.api';

interface OrderItemForPromo {
  restaurantId: string;
  restaurantName: string;
  menuItems: any[];
  status: string;
  restaurantCost: number;
  totalPrice: number;
}

export function usePromoCode() {
  const [promoCodes, setPromoCodes] = useState<string[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromoCode = async (orderItems: OrderItemForPromo[]) => {
    if (!promoInput.trim()) return;

    setValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const validation = await cateringService.validatePromoCode(
        promoInput.toUpperCase(),
        orderItems
      );

      if (validation.valid) {
        if (!promoCodes.includes(promoInput.toUpperCase())) {
          setPromoCodes([...promoCodes, promoInput.toUpperCase()]);
          setPromoSuccess(
            `Promo code "${promoInput.toUpperCase()}" applied! You saved £${validation.discount?.toFixed(2)}`
          );
          setPromoInput('');
        } else {
          setPromoError('This promo code has already been applied');
        }
      } else {
        setPromoError(validation.reason || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = (codeToRemove: string) => {
    const updatedCodes = promoCodes.filter((code) => code !== codeToRemove);
    setPromoCodes(updatedCodes);
    setPromoSuccess('');
    setPromoError('');
  };

  const resetPromoState = () => {
    setPromoSuccess('');
    setPromoError('');
  };

  return {
    promoCodes,
    promoInput,
    validatingPromo,
    promoError,
    promoSuccess,
    setPromoInput,
    setPromoCodes,
    handleApplyPromoCode,
    handleRemovePromoCode,
    resetPromoState,
  };
}
