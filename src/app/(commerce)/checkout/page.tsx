'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { CartItem } from '@/types';
import { sendAuthenticatedRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from './Checkout.module.css';

type PaymentMethod = {
  id: number;
  bank: string;
  cardBrand: string;
  cardAlias: string | null;
  maskedCard: string;
  isDefault: boolean;
  lastUsedAt: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

type CreatedOrder = {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);
  const [isMethodSelectorOpen, setIsMethodSelectorOpen] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');

  const resetCheckoutState = () => {
    setItems([]);
    setReceiver('');
    setPhone('');
    setAddress('');
    setMemo('');
    setSelectedPaymentMethodId(null);
  };

  const fetchPaymentMethods = async () => {
    const response = await sendAuthenticatedRequest('/api/v1/payment-methods', 'GET');
    if (!response) return;

    const result = (await response.json()) as ApiResponse<PaymentMethod[]>;
    if (!response.ok || !result.success || !Array.isArray(result.data)) {
      return;
    }

    setPaymentMethods(result.data);
    if (!selectedPaymentMethodId) {
      const defaultMethod = result.data.find((method) => method.isDefault);
      setSelectedPaymentMethodId(defaultMethod?.id || result.data[0]?.id || null);
    }
  };

  useEffect(() => {
    const userId =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      alert('Please log in.');
      router.push('/login');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await sendAuthenticatedRequest(
          `/api/cart?userId=${userId}`,
          'GET',
        );
        if (!response) {
          alert('Request failed.');
          return;
        }

        const data = await response.json().catch(() => null);
        if (response.ok && Array.isArray(data)) {
          setItems(data);
        } else {
          alert(
            data?.error?.message ||
              data?.message ||
              'Failed to process request.',
          );
        }
      } catch (err) {
        console.error('Checkout failed.', err);
      }
    };

    void fetchCartItems();
    void fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => {
        const p = item.product;
        if (!p) return sum;
        const discountedPrice = Math.floor(
          p.price * (1 - (p.discountRate || 0) / 100),
        );
        return sum + discountedPrice * item.quantity;
      }, 0),
    [items],
  );

  const selectedMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId,
  );

  const handleOrder = async () => {
    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill out all shipping information.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in.');
      router.push('/login');
      return;
    }

    if (!items.length) {
      alert('No items in order.');
      return;
    }

    if (!selectedPaymentMethodId) {
      alert('Please select a payment method.');
      return;
    }

    const orderPayload = {
      userId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      receiver: receiver.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ...(memo?.trim() ? { memo: memo.trim() } : {}),
    };

    const orderResponse = await sendAuthenticatedRequest(
      '/api/v1/orders',
      'POST',
      orderPayload,
    );
    if (!orderResponse) {
      alert('Order request failed.');
      return;
    }

    const orderResult = (await orderResponse.json()) as ApiResponse<CreatedOrder>;
    if (!orderResponse.ok || !orderResult.success || !orderResult.data?.id) {
      alert(orderResult.error?.message || 'Failed to create order.');
      return;
    }

    const paymentResponse = await sendAuthenticatedRequest(
      '/api/v1/payments/checkout',
      'POST',
      {
        orderId: orderResult.data.id,
        paymentMethodId: selectedPaymentMethodId,
      },
    );
    if (!paymentResponse) {
      alert('Payment request failed.');
      return;
    }

    const paymentResult = (await paymentResponse.json()) as ApiResponse<{
      orderId: number;
    }>;
    if (!paymentResponse.ok || !paymentResult.success) {
      alert(paymentResult.error?.message || 'Payment failed.');
      return;
    }

    alert('Order and payment completed.');
    resetCheckoutState();
    router.replace('/mypage/orders');
  };

  return (
    <>
      <Header />
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutForm}>
          <h2>Shipping Information</h2>
          <input
            placeholder="Recipient"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <textarea
            placeholder="Delivery Note"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div className={styles.checkoutSummary}>
          <h2>Order Items</h2>

          <div className={styles.paymentMethodBox}>
            <div className={styles.paymentMethodHeader}>
              <span>Payment Method</span>
              <button
                type="button"
                className={styles.changeMethodBtn}
                onClick={() => setIsMethodSelectorOpen((prev) => !prev)}
              >
                Change payment card
              </button>
            </div>
            {selectedMethod ? (
              <p className={styles.paymentMethodText}>
                {selectedMethod.bank} · {selectedMethod.cardBrand} ·{' '}
                {selectedMethod.cardAlias
                  ? `${selectedMethod.cardAlias} · `
                  : ''}
                {selectedMethod.maskedCard}
              </p>
            ) : (
              <p className={styles.paymentMethodText}>
                No saved cards. Please add one in My Page first.
              </p>
            )}

            {isMethodSelectorOpen && (
              <div className={styles.methodSelectorList}>
                {paymentMethods.length === 0 ? (
                  <button
                    type="button"
                    className={styles.methodItem}
                    onClick={() => router.push('/mypage/payment')}
                  >
                    Go to Payment Methods
                  </button>
                ) : (
                  paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`${styles.methodItem} ${
                        method.id === selectedPaymentMethodId
                          ? styles.methodItemActive
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedPaymentMethodId(method.id);
                        setIsMethodSelectorOpen(false);
                      }}
                    >
                      {method.bank} · {method.cardBrand} ·{' '}
                      {method.cardAlias ? `${method.cardAlias} · ` : ''}
                      {method.maskedCard}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {items.map((item) => (
            <div key={item.id} className={styles.checkoutItem}>
              <span className={styles.itemName}>
                {item.product?.name || 'Unnamed product'}
              </span>
              <span className={styles.itemQty}>{item.quantity} pcs</span>
              <span className={styles.itemTotal}>
                {Math.floor(
                  (item.product?.price || 0) *
                    (1 - (item.product?.discountRate || 0) / 100) *
                    item.quantity,
                ).toLocaleString()}
                PHP
              </span>
            </div>
          ))}
          <div className={styles.totalPrice}>
            <span>Total Amount</span>
            <span>{totalPrice.toLocaleString()}PHP</span>
          </div>
          <button className={styles.orderBtn} onClick={handleOrder}>
            Complete Order + Payment
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
