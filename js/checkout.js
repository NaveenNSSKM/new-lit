/**
 * Checkout Page Controller
 */

let checkoutItem = null;
let totalAmount = 0.00;
let taxAmount = 0.00;
let userProfile = null;

// Load checkout item
const initCheckout = async () => {
  const storedItem = sessionStorage.getItem("AURA_CHECKOUT_ITEM");
  if (!storedItem) {
    window.showToast("No product selected for purchase.", "warning");
    setTimeout(() => { window.location.href = "shop.html"; }, 2000);
    return;
  }

  checkoutItem = JSON.parse(storedItem);
  userProfile = await window.authAPI.getUser();

  renderSummary();
  prefillShipping();
  setupCheckoutListeners();
};

// Render order invoice summary
const renderSummary = () => {
  const container = document.getElementById('checkout-summary-container');
  if (!container) return;

  const price = parseFloat(checkoutItem.price);
  const subtotal = price * checkoutItem.quantity;
  taxAmount = subtotal * 0.08;
  totalAmount = subtotal + taxAmount;

  // Render HTML
  container.innerHTML = `
    <div class="checkout-summary-item">
      <img src="${checkoutItem.image_url}" alt="${checkoutItem.name}" class="checkout-summary-img">
      <div class="checkout-summary-details">
        <h4>${checkoutItem.name}</h4>
        <div class="checkout-summary-meta">Color: ${checkoutItem.selected_color} | Size: ${checkoutItem.selected_size}</div>
        ${checkoutItem.custom_text ? `<div class="checkout-summary-meta" style="font-family:var(--font-display); font-weight:600; color:var(--accent-color);">PRINT: "${checkoutItem.custom_text}"</div>` : ''}
        <div style="font-size:0.875rem; font-weight:600;">$${price.toFixed(2)} x ${checkoutItem.quantity}</div>
      </div>
    </div>
  `;

  // Render receipt amounts
  document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summary-tax').textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `$${totalAmount.toFixed(2)}`;
};

// Prefill shipping info if logged in
const prefillShipping = () => {
  const guestWarning = document.getElementById('checkout-guest-warning');
  if (userProfile) {
    if (guestWarning) guestWarning.innerHTML = `Signed in as <strong>${userProfile.full_name}</strong>. Shipping profile loaded.`;
    
    document.getElementById('ship-name').value = userProfile.full_name || "";
    document.getElementById('ship-email').value = userProfile.email || "";
    document.getElementById('ship-phone').value = userProfile.phone || "";
    
    // Address parsing if formatted
    if (userProfile.address) {
      document.getElementById('ship-address').value = userProfile.address;
    }
  } else {
    if (guestWarning) guestWarning.innerHTML = `Checking out as <strong>Guest</strong>. <a href="#" id="checkout-auth-trigger" style="text-decoration:underline; font-weight:500;">Sign in</a> to save orders to your profile.`;
    
    document.getElementById('checkout-auth-trigger')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('auth-modal')?.classList.add('show');
    });
  }
};

// Bind Forms & payment actions
const setupCheckoutListeners = () => {
  const form = document.getElementById('checkout-shipping-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button to prevent double-click
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing Order...";
    }
    
    // Lock all fields to prevent tamper
    form.querySelectorAll('.form-input').forEach(input => {
      input.readOnly = true;
      input.style.backgroundColor = 'var(--bg-tertiary)';
    });

    const mockPaymentId = 'pay_direct_' + Math.floor(1000000000 + Math.random() * 9000000000);
    await completeOrder(mockPaymentId);
  });
};

// Write order details to DB post authorization
const completeOrder = async (paymentId) => {
  window.showToast("Placing your order...");

  const name = document.getElementById('ship-name').value;
  const email = document.getElementById('ship-email').value;
  const phone = document.getElementById('ship-phone').value;
  const street = document.getElementById('ship-address').value;
  const city = document.getElementById('ship-city').value;
  const zip = document.getElementById('ship-zip').value;

  const customPrintSuffix = checkoutItem.custom_text ? `\nPRINT: "${checkoutItem.custom_text}"` : '';
  const fullShippingAddress = `${name}\n${street}\n${city}, ${zip}\nPhone: ${phone}\nEmail: ${email}${customPrintSuffix}`;

  const orderData = {
    user_id: userProfile ? userProfile.id : null,
    product_id: checkoutItem.product_id,
    selected_size: checkoutItem.selected_size,
    selected_color: checkoutItem.selected_color,
    quantity: checkoutItem.quantity,
    total_amount: totalAmount,
    payment_id: paymentId,
    payment_status: 'Paid',
    shipping_address: fullShippingAddress
  };

  const { data, error } = await window.dbAPI.createOrder(orderData);

  if (error) {
    window.showToast("Failed to record order details in database: " + error.message, "danger");
    console.error("Order logging error:", error);

    // Re-enable submit button
    const submitBtn = document.querySelector('#checkout-shipping-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    }

    // Unlock all fields
    document.querySelectorAll('#checkout-shipping-form .form-input').forEach(input => {
      input.readOnly = false;
      input.style.backgroundColor = '';
    });
  } else {
    window.showToast("Order placed successfully!");
    
    const subtotal = parseFloat(checkoutItem.price) * checkoutItem.quantity;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    // Construct prefilled WhatsApp text message containing order details in proper list format
    const message = `🛍️ *NEW ORDER DETAILS (#AURA-${data.id.substring(0, 8).toUpperCase()})*
----------------------------------
👤 *SHIPPING DETAILS:*
- *Name:* ${name}
- *Email:* ${email}
- *Phone:* ${phone}
- *Address:* ${street}, ${city} - ${zip}

📦 *ORDER SUMMARY:*
- *Product Name:* ${checkoutItem.name}
- *Image URL:* ${checkoutItem.image_url}
- *Price:* $${parseFloat(checkoutItem.price).toFixed(2)}
- *Quantity:* ${checkoutItem.quantity}
- *Size:* ${checkoutItem.selected_size}
- *Color:* ${checkoutItem.selected_color}
${checkoutItem.custom_text ? `- *Custom Text:* "${checkoutItem.custom_text}"\n` : ''}
💵 *BILLING DETAILS:*
- *Subtotal:* $${subtotal.toFixed(2)}
- *Shipping:* FREE
- *Sales Tax (8%):* $${tax.toFixed(2)}
- *Total Amount:* $${total.toFixed(2)}
----------------------------------
Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919790486506?text=${encodedMessage}`;
    
    // Open WhatsApp link in a new window/tab
    try {
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.warn("Could not open WhatsApp window (blocked by popup blocker).", err);
    }
    
    // Clear session storage item
    sessionStorage.removeItem("AURA_CHECKOUT_ITEM");

    // Redirect directly to home page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1800);
  }
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initCheckout();
});
