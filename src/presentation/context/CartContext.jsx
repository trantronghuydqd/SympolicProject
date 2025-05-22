import React, { createContext, useContext, useState, useEffect } from 'react';
import { CouponService } from '../../business/services/couponService';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Tải giỏ hàng từ localStorage khi khởi tạo
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
    }
    
    // Tải phương thức vận chuyển đã chọn
    const savedShippingMethod = localStorage.getItem('selectedShippingMethod');
    if (savedShippingMethod) {
      setSelectedShippingMethod(JSON.parse(savedShippingMethod));
    }

    // Tải mã giảm giá đã áp dụng
    const savedCoupon = localStorage.getItem('coupon');
    if (savedCoupon) {
      const parsedCoupon = JSON.parse(savedCoupon);
      setCoupon(parsedCoupon);
      setDiscountAmount(parsedCoupon.discount_amount || 0);
    }
  }, []);

  // Lưu giỏ hàng vào localStorage khi thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    // Tính toán tổng số lượng và tổng giá trị
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
    
    // Khi giỏ hàng thay đổi, cập nhật lại số tiền giảm giá nếu có mã
    if (coupon) {
      applyDiscount(coupon);
    }
  }, [cartItems]);
  
  // Lưu phương thức vận chuyển vào localStorage khi thay đổi
  useEffect(() => {
    if (selectedShippingMethod) {
      localStorage.setItem('selectedShippingMethod', JSON.stringify(selectedShippingMethod));
    }
  }, [selectedShippingMethod]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, color, size, quantity, finalPrice, inventoryId) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa (với cùng màu sắc và kích thước)
    const existingItemIndex = cartItems.findIndex(
      item => 
        item.product.product_id === product.product_id && 
        item.color.color_id === color.color_id && 
        item.size.size_id === size.size_id
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, cập nhật số lượng
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      // Nếu chưa có, thêm mới vào giỏ hàng
      setCartItems([
        ...cartItems,
        {
          id: Date.now().toString(),
          product,
          color,
          size,
          quantity,
          finalPrice,
          inventoryId
        }
      ]);
    }
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    
    // Nếu giỏ hàng trống, xóa khỏi localStorage
    if (updatedCart.length === 0) {
      localStorage.removeItem('cart');
      removeCoupon(); // Xóa cả mã giảm giá nếu giỏ hàng trống
    }
  };

  // Xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    // Cũng xóa phương thức vận chuyển đã chọn
    setSelectedShippingMethod(null);
    localStorage.removeItem('selectedShippingMethod');
    // Xóa mã giảm giá
    removeCoupon();
  };
  
  // Áp dụng mã giảm giá
  const applyCoupon = async (couponCode) => {
    if (!couponCode) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return false;
    }
    
    setCouponLoading(true);
    setCouponError(null);
    
    try {
      const couponService = new CouponService();
      const result = await couponService.applyCoupon(couponCode, totalPrice);
      
      if (result.valid) {
        const couponObject = {
          code: couponCode,
          coupon_id: result.coupon_id,
          discount_amount: result.discount_amount
        };
        
        setCoupon(couponObject);
        setDiscountAmount(result.discount_amount);
        localStorage.setItem('coupon', JSON.stringify(couponObject));
        return true;
      } else {
        setCouponError(result.message || 'Mã giảm giá không hợp lệ');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      setCouponError('Đã xảy ra lỗi khi áp dụng mã giảm giá');
      return false;
    } finally {
      setCouponLoading(false);
    }
  };
  
  // Cập nhật số tiền giảm giá dựa vào mã giảm giá
  const applyDiscount = (couponData) => {
    if (!couponData) return;
    
    // Trong thực tế, chúng ta sẽ gọi lại API để cập nhật số tiền giảm giá
    // Nhưng hiện tại chỉ cần giữ nguyên giá trị từ couponData
    setDiscountAmount(couponData.discount_amount || 0);
  };
  
  // Xóa mã giảm giá
  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
    localStorage.removeItem('coupon');
  };
  
  // Tính tổng tiền (bao gồm phí vận chuyển và giảm giá)
  const calculateTotal = () => {
    const subtotal = totalPrice;
    const discount = discountAmount;
    const shippingFee = selectedShippingMethod ? Number(selectedShippingMethod.base_fee) : 0;
    return Math.max(0, subtotal - discount) + shippingFee;
  };

  const value = {
    cartItems,
    totalItems,
    totalPrice,
    selectedShippingMethod,
    setSelectedShippingMethod,
    calculateTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    discountAmount,
    couponLoading, 
    couponError,
    setCouponError,
    applyCoupon,
    removeCoupon
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 