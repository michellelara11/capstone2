// MultipleFiles/script.js
// Global variables
let cart = loadCartFromStorage();
const wishlist = loadWishlistFromStorage();
let currentProduct = null;
let editingItemIndex = -1;
let uploadedFiles = {
  govIdFront: null,
  govIdBack: null,
  selfie: null,
};
let currentCaptureType = ""; // To store whether we are capturing 'govIdFront', 'govIdBack', or 'selfie'

// Products data (defaults for fallback)
const products = {
  1: {
    id: 1,
    name: "Be Clever Enough Shirt",
    price: 550,
    description: "Premium quality shirt with clever design",
    image: "be clever.jpg",
    category: "shirts",
  },
  2: {
    id: 2,
    name: "Sie/Te T-shirt",
    price: 350,
    description: "Premium quality oversized shirt design",
    image: "sie.jpg",
    category: "shirts",
  },
  3: {
    id: 3,
    name: "What IT?",
    price: 350,
    description: "Modern design with bold statement",
    image: "what if.png",
    category: "shirts",
  },
  4: {
    id: 4,
    name: "Clever Premium",
    price: 550,
    description: "Premium quality clever design shirt",
    image: "clever.jpg",
    category: "shirts",
  },
};

// Dynamic products map loaded from Supabase when available
let productsDynamic = null;

function usingSupabase() {
  try {
    return !!(
      window &&
      window.sb &&
      window.SUPABASE_URL &&
      !String(window.SUPABASE_URL).includes("YOUR-PROJECT-REF")
    );
  } catch (_) {
    return false;
  }
}

function getProduct(productId) {
  const id = Number(productId);
  if (productsDynamic && productsDynamic[id]) return productsDynamic[id];
  return products[id];
}

async function fetchProductsFromDBAndRender() {
  if (!usingSupabase()) {
    renderHomeProducts(Object.values(products));
    renderAllProducts(Object.values(products));
    return;
  }
  try {
    const { data, error } = await window.sb
      .from("products")
      .select("id,name,price,description,category,stock,image")
      .order("id", { ascending: true });
    if (error) throw error;

    // Build dynamic map
    productsDynamic = {};
    (data || []).forEach((p) => {
      productsDynamic[p.id] = p;
    });

    const list = Object.values(productsDynamic);
    renderHomeProducts(list);
    renderAllProducts(list);

    // Update "See all" count if present
    const seeAllBtn = document.querySelector(".see-all");
    if (seeAllBtn) {
      seeAllBtn.textContent = `See all (${list.length})`;
    }
  } catch (err) {
    console.error("[Supabase] fetch products (user) error", err);
    // Fallback to defaults
    const list = Object.values(products);
    renderHomeProducts(list);
    renderAllProducts(list);
  }
}

function renderHomeProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  const top = list.slice(0, 3);
  if (top.length === 0) {
    grid.innerHTML =
      '<div class="no-data" style="grid-column:1/-1;">No products</div>';
    return;
  }
  grid.innerHTML = top
    .map(
      (p) => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image || ""}" alt="${p.name}" class="product-img">
        <button class="wishlist-btn" onclick="toggleWishlist(${p.id})">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p class="price">₱${Number(p.price).toFixed(2)}</p>
        <div class="product-actions">
          <button class="add-to-cart" onclick="addToCart(${
            p.id
          })">Add to Cart</button>
          <button class="buy-now" onclick="buyNow(${p.id})">Buy Now</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
  updateAllWishlistButtons();
}

function renderAllProducts(list) {
  const grid = document.querySelector("#all-products .all-products-grid");
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.innerHTML =
      '<div class="no-data" style="grid-column:1/-1;">No products</div>';
    return;
  }
  grid.innerHTML = list
    .map(
      (p) => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image || ""}" alt="${p.name}" class="product-img">
        <button class="wishlist-btn" onclick="toggleWishlist(${p.id})">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p class="price">₱${Number(p.price).toFixed(2)}</p>
        <div class="product-actions">
          <button class="add-to-cart" onclick="addToCart(${
            p.id
          })">Add to Cart</button>
          <button class="buy-now" onclick="buyNow(${p.id})">Buy Now</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
  updateAllWishlistButtons();
}

// Philippines phone number validation
function isValidPhilippinesPhone(phone) {
  // Validates a 10-digit number that does not start with 0
  const phoneRegex = /^[1-9][0-9]{9}$/;
  return phoneRegex.test(phone);
}

// Name validation (letters only)
function isValidName(name) {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(name);
}

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  updateCartCount();
  updateWishlistCount();
  animateOnScroll();
  setupPaymentListeners();
  startImageSlider();
  setupFormValidation();
  setupAddressAutoFill();
  setupDeliveryLocations();
  // Load products from DB and render both home and all-products grids
  fetchProductsFromDBAndRender();
});

// Initialize all event listeners
function initializeEventListeners() {
  // Navigation smooth scrolling
  document.querySelectorAll(".nav-link, .footer-nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");

      const allProductsVisible =
        document.getElementById("all-products").style.display !== "none";
      const isMainSection = [
        "#home",
        "#about",
        "#products",
        "#faqs",
        "#contact",
      ].includes(targetId);

      if (allProductsVisible && isMainSection) {
        // Ensure main sections are visible first
        showHomePage();
        setTimeout(() => {
          const target = document.querySelector(
            targetId === "#home" ? "#home" : targetId
          );
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        return;
      }

      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        // Update active nav link
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        // Add active class to the clicked link (only if it's a main nav link)
        if (this.classList.contains("nav-link")) {
          this.classList.add("active");
        }

        // Smooth scroll to section
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // FAQ toggles
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.parentElement;
      const isActive = faqItem.classList.contains("active");

      // Close all FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        faqItem.classList.add("active");
      }
    });
  });

  // Modal event listeners
  const modals = document.querySelectorAll(".modal");
  const closeButtons = document.querySelectorAll(".close");

  closeButtons.forEach((close) => {
    close.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
      document.body.style.overflow = "auto";
      // Stop camera stream if open
      closeCaptureModal();
    });
  });

  // Close modal when clicking outside
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        // Stop camera stream if open
        closeCaptureModal();
      }
    });
  });

  // Contact form submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleContactForm();
    });
  }

  // Hero CTA button
  const ctaBtn = document.querySelector(".cta-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      document.getElementById("products").scrollIntoView({
        behavior: "smooth",
      });
    });
  }
}

// Start image slider
function startImageSlider() {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  if (slides.length === 0) return;

  setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }, 5000);
}

// Setup form validation
function setupFormValidation() {
  // Phone number validation
  const phoneInputs = document.querySelectorAll(
    '.phone-input-group input[type="tel"]'
  );
  phoneInputs.forEach((input) => {
    input.addEventListener("input", function () {
      // Remove any non-digit characters
      let value = this.value.replace(/\D/g, "");

      // Apply dash formatting
      if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 3) + "-" + value.slice(3);
      } else if (value.length > 6) {
        value =
          value.slice(0, 3) +
          "-" +
          value.slice(3, 6) +
          "-" +
          value.slice(6, 10);
      }
      this.value = value;

      if (
        this.value &&
        !isValidPhilippinesPhone(this.value.replace(/-/g, ""))
      ) {
        this.setCustomValidity(
          "Please enter a 10-digit phone number (e.g., 9123456789) and do not start with 0."
        );
      } else {
        this.setCustomValidity("");
      }
    });
  });

  // Name validation
  const nameInput = document.getElementById("fullName");
  if (nameInput) {
    nameInput.addEventListener("input", function () {
      if (this.value && !isValidName(this.value)) {
        this.setCustomValidity("Name should only contain letters and spaces");
      } else {
        this.setCustomValidity("");
      }
    });
  }
}

// Setup address auto-fill
function setupAddressAutoFill() {
  const province = document.getElementById("province");
  const city = document.getElementById("city");
  const street = document.getElementById("street");
  const zipCode = document.getElementById("zipCode");
  const houseNumber = document.getElementById("houseNumber");
  const completeAddress = document.getElementById("completeAddress");

  if (!province || !city || !street || !zipCode || !completeAddress) return;

  function updateCompleteAddress() {
    const parts = [];

    if (houseNumber && houseNumber.value.trim()) {
      parts.push(houseNumber.value.trim());
    }
    if (street.value.trim()) {
      parts.push(street.value.trim());
    }
    if (city.value.trim()) {
      parts.push(city.value.trim());
    }
    if (province.value.trim()) {
      parts.push(province.value.trim());
    }
    if (zipCode.value.trim()) {
      parts.push(zipCode.value.trim());
    }

    completeAddress.value = parts.join(", ");
  }
  [province, city, street, zipCode, houseNumber].forEach((field) => {
    if (field) {
      field.addEventListener("input", updateCompleteAddress);
    }
  });
}

// Setup delivery locations
function setupDeliveryLocations() {
  const deliveryLocations = [
    {
      id: "loc1",
      name: "Clever Clothing Store",
      address: "123 Main St",
      barangay: "San Miguel",
      city: "Tarlac City",
      zipCode: "2300",
    },
    {
      id: "loc2",
      name: "Clever Clothing Store",
      address: "456 Plaza St",
      barangay: "Santa Rosa",
      city: "Tarlac City",
      zipCode: "2300",
    },
    {
      id: "loc3",
      name: "Clever Clothing Store",
      address: "789 Commerce Ave",
      barangay: "Sta. Ignacia",
      city: "Tarlac City",
      zipCode: "2300",
    },
  ];

  const barangayInput = document.getElementById("barangaySelect");
  if (barangayInput) {
    // Sync barangay with location selection
    const locationOptions = document.querySelectorAll('input[name="location"]');
    locationOptions.forEach((radio, index) => {
      radio.addEventListener("change", function () {
        if (this.checked && deliveryLocations[index]) {
          barangayInput.value = deliveryLocations[index].barangay;
        }
      });
    });
  }
}

// Setup payment method listeners
function setupPaymentListeners() {
  // Payment method change listener
  const paymentMethods = document.querySelectorAll('input[name="payment"]');
  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      const cashNote = document.getElementById("cashNote");
      const paymentMethodSelection = document.getElementById(
        "paymentMethodSelection"
      );
      const paymentInfo = document.getElementById("paymentInfo");

      if (this.value === "cash") {
        cashNote.style.display = "block";
        paymentMethodSelection.style.display = "none";
        paymentInfo.innerHTML = `
                    <p><strong>Payment</strong></p>
                    <p>Cash payment - Pay at store when claiming your order</p>
                `;
      } else {
        cashNote.style.display = "none";
        paymentMethodSelection.style.display = "block";
        paymentInfo.innerHTML = `
                    <p><strong>Payment</strong></p>
                    <p>${
                      this.value.charAt(0).toUpperCase() + this.value.slice(1)
                    } payment accepted for online orders</p>
                `;
      }
    });
  });

  // Payment method selection (QR vs Manual)
  const methodOptions = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  methodOptions.forEach((option) => {
    option.addEventListener("change", function () {
      const qrSection = document.getElementById("qrCodeSection");
      const manualSection = document.getElementById("manualInputSection");

      if (this.value === "qr") {
        qrSection.style.display = "block";
        manualSection.style.display = "none";
      } else {
        qrSection.style.display = "none";
        manualSection.style.display = "block";
      }
    });
  });

  // Delivery method change listener
  const deliveryMethods = document.querySelectorAll('input[name="delivery"]');
  deliveryMethods.forEach((method) => {
    method.addEventListener("change", function () {
      const dropoffLocations = document.getElementById("dropoffLocations");
      const deliveryFeeAmount = document.getElementById("deliveryFeeAmount");
      const deliveryInfo = document.getElementById("deliveryInfo");
      const paymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      );

      if (this.value === "pickup") {
        dropoffLocations.style.display = "block";
        deliveryFeeAmount.textContent = "₱0.00";

        if (paymentMethod && paymentMethod.value === "cash") {
          deliveryInfo.innerHTML = `
                        <p><strong>Estimated pickup</strong></p>
                        <p>Please pay in store and claim the item within 3 days (Mon-Sat: 8:00 AM - 8:00 PM)</p>
                    `;
        } else {
          deliveryInfo.innerHTML = `
                        <p><strong>Estimated pickup</strong></p>
                        <p>Item ready for pickup within 2-4 hours after payment confirmation (Mon-Sat: 8:00 AM - 8:00 PM)</p>
                    `;
        }

        updateCheckoutTotal();
      } else {
        dropoffLocations.style.display = "none";
        deliveryFeeAmount.textContent = "₱50.00";

        deliveryInfo.innerHTML = `
                    <p><strong>Estimated delivery</strong></p>
                    <p>Within city delivery service to your designated address (2:00 PM - 4:30 PM)</p>
                `;

        updateCheckoutTotal();
      }
    });
  });
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Show cart notification (center)
function showCartNotification(message) {
  const notification = document.getElementById("cartNotification");
  const text = document.getElementById("cartNotificationText");
  text.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Animate elements on scroll
function animateOnScroll() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".about-item, .product-card, .faq-item")
    .forEach((el) => {
      observer.observe(el);
    });
}

// Show all products page
function showAllProductsPage() {
  // Hide main sections
  document.getElementById("home").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("products").style.display = "none";
  document.getElementById("faqs").style.display = "none";

  // Show all products page
  document.getElementById("all-products").style.display = "block";

  // Scroll to top of the all products page
  document.getElementById("all-products").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // Apply animation to product cards
  const productCards = document.querySelectorAll("#all-products .product-card");
  productCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.animation = `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`;
  });

  // Update wishlist buttons state
  updateAllWishlistButtons();
}

// Go back to home
function goBackHome() {
  // Show main sections
  document.getElementById("home").style.display = "flex";
  document.getElementById("about").style.display = "block";
  document.getElementById("products").style.display = "block";
  document.getElementById("faqs").style.display = "block";

  // Hide all products page
  document.getElementById("all-products").style.display = "none";
}

// Show home page (helper function)
function showHomePage() {
  if (document.getElementById("all-products").style.display !== "none") {
    goBackHome();
  }
}

// Wishlist functions
function toggleWishlist(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const existingIndex = wishlist.findIndex((item) => item.id === productId);
  const button =
    document.querySelector(`[data-id="${productId}"] .wishlist-btn i`) ||
    document.querySelector(
      `.wishlist-btn[onclick="toggleWishlist(${productId})"] i`
    );

  if (existingIndex >= 0) {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
    if (button) {
      button.className = "far fa-heart";
    }
    showCartNotification(`${product.name} removed from wishlist!`);
  } else {
    // Add to wishlist
    wishlist.push({
      ...product,
    });
    if (button) {
      button.className = "fas fa-heart";
    }
    showCartNotification(`${product.name} added to wishlist!`);
  }

  updateWishlistCount();
  updateAllWishlistButtons();
  saveWishlistToStorage();
}

// Update all wishlist buttons
function updateAllWishlistButtons() {
  // Update buttons on both homepage and all products page
  const buttons = document.querySelectorAll(".wishlist-btn i");
  buttons.forEach((button) => {
    const productCard = button.closest(".product-card");
    if (productCard) {
      const productId = Number.parseInt(productCard.dataset.id);
      const isInWishlist = wishlist.some((item) => item.id === productId);
      button.className = isInWishlist ? "fas fa-heart" : "far fa-heart";
    }
  });

  // Update related product wishlist buttons
  const relatedButtons = document.querySelectorAll(".related-wishlist i");
  relatedButtons.forEach((button) => {
    const relatedItem = button.closest(".related-item");
    if (relatedItem) {
      const onclick = relatedItem.getAttribute("onclick");
      if (onclick) {
        const productId = Number.parseInt(
          onclick.match(/viewProduct\$(\d+)\$/)[1]
        ); // Corrected regex
        const isInWishlist = wishlist.some((item) => item.id === productId);
        button.className = isInWishlist ? "fas fa-heart" : "far fa-heart";
      }
    }
  });
}

// Show wishlist modal
function showWishlistModal() {
  updateWishlistDisplay();
  const wishlistModal = document.getElementById("wishlistModal");
  wishlistModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Update wishlist display
function updateWishlistDisplay() {
  const wishlistItems = document.getElementById("wishlistItems");

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = `
            <div class="empty-wishlist">
                <p>Your wishlist is empty</p>
                <p>Add some products to your favorites!</p>
            </div>
        `;
    return;
  }

  wishlistItems.innerHTML = "";

  wishlist.forEach((item, index) => {
    const wishlistItemHTML = `
            <div class="wishlist-item">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="wishlist-item-details">
                    <h4>${item.name}</h4>
                    <div class="wishlist-item-price">₱${item.price.toFixed(
                      2
                    )}</div>
                </div>
                <div class="wishlist-item-actions">
                    <button class="move-to-cart" onclick="moveToCart(${index})">Move to Cart</button>
                    <button class="remove-wishlist" onclick="removeFromWishlist(${index})">Remove</button>
                </div>
            </div>
        `;
    wishlistItems.insertAdjacentHTML("beforeend", wishlistItemHTML);
  });
}

// Move from wishlist to cart
function moveToCart(index) {
  const item = wishlist[index];

  // Add to cart with default size
  const existingCartItem = cart.find(
    (cartItem) => cartItem.id === item.id && cartItem.size === "M"
  );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cart.push({
      ...item,
      quantity: 1,
      size: "M",
    });
  }

  // Remove from wishlist
  wishlist.splice(index, 1);

  updateCartCount();
  updateWishlistCount();
  updateWishlistDisplay();
  updateAllWishlistButtons();
  showCartNotification(`${item.name} moved to cart!`);
  saveCartToStorage();
  saveWishlistToStorage();
}

// Remove from wishlist
function removeFromWishlist(index) {
  const item = wishlist[index];
  wishlist.splice(index, 1);

  updateWishlistCount();
  updateWishlistDisplay();
  updateAllWishlistButtons();
  showCartNotification(`${item.name} removed from wishlist!`);
  saveWishlistToStorage();
}

// Update wishlist count display
function updateWishlistCount() {
  const wishlistCount = document.querySelector(".wishlist-count");
  const totalItems = wishlist.length;
  wishlistCount.textContent = totalItems;

  if (totalItems > 0) {
    wishlistCount.style.display = "flex";
  } else {
    wishlistCount.style.display = "none";
  }
}

// Show cart modal
function showCartModal() {
  updateCartDisplay();
  const cartModal = document.getElementById("cartModal");
  cartModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalAmount = document.getElementById("cartTotalAmount");

  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <p>Add some products to get started!</p>
            </div>
        `;
    cartTotalAmount.textContent = "₱0.00";
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItemHTML = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-meta">Size: ${item.size} | Qty: ${
      item.quantity
    }</div>
                    <div class="cart-item-controls">
                        <button class="edit-item" onclick="editCartItem(${index})" title="Edit">Edit</button>
                        <button class="remove-item" onclick="removeFromCart(${index})" title="Remove">Remove</button>
                    </div>
                </div>
                <div class="cart-item-price">₱${itemTotal.toFixed(2)}</div>
            </div>
        `;
    cartItems.insertAdjacentHTML("beforeend", cartItemHTML);
  });

  cartTotalAmount.textContent = `₱${total.toFixed(2)}`;
}

// Edit cart item
function editCartItem(index) {
  editingItemIndex = index;
  const item = cart[index];

  const editModal = document.createElement("div");
  editModal.className = "edit-item-modal";
  editModal.innerHTML = `
        <div class="edit-item-content">
            <h3>Edit Item</h3>
            <div class="edit-form">
                <label>Size:</label>
                <select id="editSize">
                    <option value="XS" ${
                      item.size === "XS" ? "selected" : ""
                    }>XS</option>
                    <option value="S" ${
                      item.size === "S" ? "selected" : ""
                    }>S</option>
                    <option value="M" ${
                      item.size === "M" ? "selected" : ""
                    }>M</option>
                    <option value="L" ${
                      item.size === "L" ? "selected" : ""
                    }>L</option>
                    <option value="XL" ${
                      item.size === "XL" ? "selected" : ""
                    }>XL</option>
                </select>
                
                <label>Quantity:</label>
                <input type="number" id="editQuantity" value="${
                  item.quantity
                }" min="1">
                
                <div class="edit-actions">
                    <button class="save-changes" onclick="saveItemChanges()">Save Changes</button>
                    <button class="cancel-edit" onclick="cancelEdit()">Cancel</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(editModal);
}

// Save item changes
function saveItemChanges() {
  const newSize = document.getElementById("editSize").value;
  const newQuantity = Number.parseInt(
    document.getElementById("editQuantity").value
  );

  if (editingItemIndex >= 0 && newQuantity > 0) {
    cart[editingItemIndex].size = newSize;
    cart[editingItemIndex].quantity = newQuantity;

    updateCartCount();
    updateCartDisplay();
    showCartNotification("Item updated successfully");
    saveCartToStorage();
  }

  cancelEdit();
}

// Cancel edit
function cancelEdit() {
  const editModal = document.querySelector(".edit-item-modal");
  if (editModal) {
    document.body.removeChild(editModal);
  }
  editingItemIndex = -1;
}

// Remove from cart
function removeFromCart(index) {
  if (confirm("Remove this item from cart?")) {
    const item = cart[index];
    cart.splice(index, 1);
    updateCartCount();
    updateCartDisplay();
    showCartNotification(`${item.name} removed from cart`);
    saveCartToStorage();

    // Also update checkout if it's open
    if (document.getElementById("checkoutModal").style.display === "block") {
      updateCheckoutItems();
      updateCheckoutTotal();
    }
  }
}

// Show products (for Add Item button)
function showProducts() {
  document.getElementById("cartModal").style.display = "none";
  showHomePage();
  setTimeout(() => {
    document.getElementById("products").scrollIntoView({
      behavior: "smooth",
    });
  }, 100);
  document.body.style.overflow = "auto";
}

// Add item to cart
function addToCart(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const existingItem = cart.find(
    (item) => item.id === productId && item.size === "M"
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
      size: "M",
    });
  }

  updateCartCount();
  showCartNotification(`${product.name} added to cart!`);
  saveCartToStorage();
}

// Buy now function
function buyNow(productId) {
  const product = getProduct(productId);
  if (!product) return;

  // Clear cart and add only this item
  cart = [
    {
      ...product,
      quantity: 1,
      size: "M",
    },
  ];

  updateCartCount();
  saveCartToStorage();
  showCheckout();
}

// Add to cart from modal
function addToCartFromModal() {
  if (!currentProduct) return;

  const size = document.getElementById("sizeSelect").value;
  const quantity = Number.parseInt(document.getElementById("quantity").value);

  const existingItem = cart.find(
    (item) => item.id === currentProduct.id && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...currentProduct,
      quantity: quantity,
      size: size,
    });
  }

  updateCartCount();
  showCartNotification(`${currentProduct.name} added to cart!`);
  saveCartToStorage();
}

// Update cart count display
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (totalItems > 0) {
    cartCount.style.display = "flex";
  } else {
    cartCount.style.display = "none";
  }
}

// View product details
function viewProduct(productId) {
  const product = getProduct(productId);
  if (!product) return;

  currentProduct = product;

  // Update modal content
  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productDescription").textContent =
    product.description;
  document.getElementById("productPrice").textContent = `₱${product.price}.00`;

  // Update images
  const mainImg = document.getElementById("mainProductImg");
  const thumb1Img = document.getElementById("thumb1Img");
  const thumb2Img = document.getElementById("thumb2Img");

  mainImg.src = product.image;
  mainImg.alt = product.name;

  thumb1Img.src = product.image;
  thumb1Img.alt = product.name;

  thumb2Img.src = product.image;
  thumb2Img.alt = product.name;

  // Reset form
  document.getElementById("quantity").value = 1;
  document.getElementById("sizeSelect").value = "M";

  // Show modal
  const modal = document.getElementById("productModal");
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Change product image
function changeImage(imageIndex) {
  if (!currentProduct) return;

  // Update active thumbnail
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.classList.remove("active");
  });

  const thumbnails = document.querySelectorAll(".thumbnail");
  if (thumbnails[imageIndex]) {
    thumbnails[imageIndex].classList.add("active");
  }
}

// Quantity controls
function increaseQuantity() {
  const quantityInput = document.getElementById("quantity");
  quantityInput.value = Number.parseInt(quantityInput.value) + 1;
}

function decreaseQuantity() {
  const quantityInput = document.getElementById("quantity");
  const currentValue = Number.parseInt(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
  }
}

// Proceed to checkout from cart
function proceedToCheckoutFromCart() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error");
    return;
  }

  document.getElementById("cartModal").style.display = "none";
  showCheckout();
}

// Proceed to checkout
function proceedToCheckout() {
  if (!currentProduct) return;

  const size = document.getElementById("sizeSelect").value;
  const quantity = Number.parseInt(document.getElementById("quantity").value);

  const existingItem = cart.find(
    (item) => item.id === currentProduct.id && item.size === size
  );

  if (!existingItem) {
    cart.push({
      ...currentProduct,
      quantity: quantity,
      size: size,
    });
    updateCartCount();
    saveCartToStorage();
  }

  showCheckout();
}

// Show checkout modal
function showCheckout() {
  document.getElementById("productModal").style.display = "none";

  updateCheckoutItems();
  updateCheckoutTotal();

  const checkoutModal = document.getElementById("checkoutModal");
  checkoutModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Update checkout items display
function updateCheckoutItems() {
  const checkoutItems = document.getElementById("checkoutItems");
  checkoutItems.innerHTML = "";

  cart.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "checkout-item";
    itemElement.innerHTML = `
            <div class="checkout-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Size: ${item.size} | Qty: ${item.quantity}</p>
            </div>
            <div class="checkout-item-price">₱${(
              item.price * item.quantity
            ).toFixed(2)}</div>
            <div class="checkout-item-actions">
                <button class="checkout-edit" onclick="editCheckoutItem(${index})" title="Edit">Edit</button>
                <button class="checkout-remove" onclick="removeFromCheckout(${index})" title="Remove">Remove</button>
            </div>
        `;
    checkoutItems.appendChild(itemElement);
  });
}

// Edit checkout item
function editCheckoutItem(index) {
  editCartItem(index);
}

// Remove from checkout
function removeFromCheckout(index) {
  removeFromCart(index);
}

// Update checkout total
function updateCheckoutTotal() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryMethod = document.querySelector(
    'input[name="delivery"]:checked'
  );
  const deliveryFee =
    deliveryMethod && deliveryMethod.value === "pickup" ? 0 : 50;
  const total = subtotal + deliveryFee;

  document.getElementById("subtotalAmount").textContent = `₱${subtotal.toFixed(
    2
  )}`;
  document.getElementById(
    "deliveryFeeAmount"
  ).textContent = `₱${deliveryFee.toFixed(2)}`;
  document.getElementById("totalAmount").textContent = `₱${total.toFixed(2)}`;
}

// Function to start camera stream
async function startCamera(facingMode, videoElement) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    videoElement.srcObject = stream;
    videoElement.play();
    // Set transform for selfie camera to mirror the image
    if (facingMode === "user") {
      videoElement.style.transform = "scaleX(-1)";
    } else {
      videoElement.style.transform = "scaleX(1)";
    }
    return stream;
  } catch (err) {
    showNotification(
      "Camera access denied. Please allow camera access.",
      "error"
    );
    console.error("Error accessing camera: ", err);
    return null;
  }
}

// Capture government ID (camera only)
async function captureGovId() {
  currentCaptureType = "govIdFront";
  await showCaptureModal("Take Photo of Government ID (Front)", "environment");
}

// Capture selfie (front camera only)
async function captureSelfie() {
  currentCaptureType = "selfie";
  await showCaptureModal("Take Selfie for Verification", "user");
}

// Show generic capture modal
async function showCaptureModal(title, facingMode) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification("Camera not supported on this device.", "error");
    return;
  }

  const captureModal = document.createElement("div");
  captureModal.className = "capture-modal";
  captureModal.innerHTML = `
        <div class="capture-content">
            <h3>${title}</h3>
            <div class="camera-view">
                <video id="cameraFeed" autoplay playsinline></video>
                <canvas id="captureCanvas" style="display:none;"></canvas>
                <button class="capture-btn" id="captureButton">Capture</button>
                <button class="cancel-capture" onclick="closeCaptureModal()">Cancel</button>
            </div>
        </div>
    `;

  document.body.appendChild(captureModal);
  const videoElement = document.getElementById("cameraFeed");
  const captureButton = document.getElementById("captureButton");

  const stream = await startCamera(facingMode, videoElement);
  if (!stream) {
    closeCaptureModal();
    return;
  }

  captureButton.onclick = async () => {
    const canvas = document.getElementById("captureCanvas");
    const context = canvas.getContext("2d");

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    const image = new Image();
    image.src = imageDataUrl;

    image.onload = async () => {
      // Adjust the blur detection threshold
      const isClearEnough = await isImageClear(image, 5); // Lower threshold (e.g., 5) for more leniency
      if (!isClearEnough) {
        showNotification(
          "Image might be too blurry. Please ensure text and face are clearly visible and retake.",
          "error"
        );
        return;
      }

      showImagePreviewModal(imageDataUrl, canvas);
    };
  };
}

function showImagePreviewModal(imageDataUrl, canvas) {
  const previewModal = document.createElement("div");
  previewModal.className = "modal";
  previewModal.id = "imagePreviewModal";
  previewModal.style.display = "block";
  previewModal.innerHTML = `
    <div class="modal-content preview-modal-content">
      <span class="close" onclick="closeImagePreview()">&times;</span>
      <h2>Preview Image</h2>
      <div class="preview-container">
        <img id="previewImage" src="${imageDataUrl}" alt="Preview" class="preview-image">
      </div>
      <p class="preview-text">Does this image look good? Make sure the text/face is clear and visible.</p>
      <div class="preview-actions">
        <button class="secondary-btn" onclick="closeImagePreview()">Retake</button>
        <button class="primary-btn" onclick="confirmImageCapture('${imageDataUrl}', ${canvas.width}, ${canvas.height})">Confirm & Submit</button>
      </div>
    </div>
  `;

  document.body.appendChild(previewModal);
}

function closeImagePreview() {
  const previewModal = document.getElementById("imagePreviewModal");
  if (previewModal) {
    previewModal.remove();
  }
  // Reopen the capture modal for retaking
  if (currentCaptureType === "govIdFront") {
    showCaptureModal("Take Photo of Government ID (Front)", "environment");
  } else if (currentCaptureType === "govIdBack") {
    showCaptureModal("Take Photo of Government ID (Back)", "environment");
  } else if (currentCaptureType === "selfie") {
    showCaptureModal("Take Selfie for Verification", "user");
  }
}

function confirmImageCapture(imageDataUrl, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  const image = new Image();
  image.src = imageDataUrl;
  image.onload = () => {
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(async (blob) => {
      if (currentCaptureType === "govIdFront") {
        uploadedFiles.govIdFront = blob;
        document.getElementById("govIdStatus").textContent =
          "✅ Government ID Front captured";
        showNotification(
          "Government ID Front captured successfully. Now capture the back.",
          "success"
        );
        closeImagePreview();
        closeCaptureModal();
        currentCaptureType = "govIdBack";
        await showCaptureModal(
          "Take Photo of Government ID (Back)",
          "environment"
        );
      } else if (currentCaptureType === "govIdBack") {
        uploadedFiles.govIdBack = blob;
        document.getElementById("govIdStatus").textContent =
          "✅ Government ID (Front & Back) captured";
        showNotification(
          "Government ID Back captured successfully.",
          "success"
        );
        closeImagePreview();
        closeCaptureModal();
      } else if (currentCaptureType === "selfie") {
        uploadedFiles.selfie = blob;
        document.getElementById("selfieStatus").textContent =
          "✅ Selfie captured";
        showNotification("Selfie captured successfully.", "success");
        closeImagePreview();
        closeCaptureModal();
      }
    }, "image/png");
  };
}

// Check if image is clear (simple blur detection)
// Added a 'threshold' parameter to control leniency
function isImageClear(img, threshold = 10) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let sumVariance = 0;
    let count = 0;

    // Simple variance check on pixel differences
    // This is a basic edge detection method; higher variance implies more detail/less blur
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Check neighbors (simplified for speed)
      // Compare current pixel with the one to its right
      if (i + 4 < pixels.length) {
        const r2 = pixels[i + 4];
        const g2 = pixels[i + 5];
        const b2 = pixels[i + 6];
        sumVariance += Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2);
        count++;
      }
    }
    const averageVariance = sumVariance / count;
    // Resolve true if average variance is above the given threshold
    resolve(averageVariance > threshold);
  });
}

// Close capture modal
function closeCaptureModal() {
  const captureModal = document.querySelector(".capture-modal");
  if (captureModal) {
    const video = captureModal.querySelector("video");
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    document.body.removeChild(captureModal);
  }
}

// Face verification function
function verifyFaceMatch(govIdFrontFile, govIdBackFile, selfieFile) {
  // In a real application, this would use AI/ML services for face verification
  // For demo purposes, we'll simulate the verification
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      const isMatch = Math.random() > 0.1;
      resolve(isMatch);
    }, 2000);
  });
}

async function saveOrderToDatabase(orderData) {
  try {
    if (usingSupabase()) {
      // Save to Supabase
      const { data, error } = await window.sb.from("orders").insert([
        {
          order_number: orderData.orderNumber,
          customer_name: orderData.customer.name,
          customer_email: orderData.customer.email,
          customer_phone: orderData.customer.phone,
          customer_address: orderData.customer.address,
          customer_barangay: orderData.customer.barangay,
          customer_gender: orderData.customer.gender,
          customer_age: orderData.customer.age,
          customer_alt_contact: orderData.customer.altContact,
          customer_notes: orderData.customer.notes,
          items: JSON.stringify(orderData.items),
          delivery_method: orderData.delivery.method,
          delivery_location: orderData.delivery.location,
          delivery_fee: orderData.delivery.fee,
          delivery_estimated_date: orderData.delivery.estimatedDate,
          payment_method: orderData.payment.method,
          payment_type: orderData.payment.paymentType,
          total: orderData.total,
          status: "pending",
          created_at: new Date().toISOString(),
          has_pre_invoice: orderData.delivery.method === "pickup",
          has_real_invoice: false,
        },
      ]);

      if (error) throw error;
      console.log("[v0] Order saved to Supabase:", data);
      return data?.[0]?.id;
    } else {
      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      const newOrder = {
        id: "ORD_" + Date.now(),
        ...orderData,
        status: "pending",
        created_at: new Date().toISOString(),
        has_pre_invoice: orderData.delivery.method === "pickup",
        has_real_invoice: false,
      };
      orders.push(newOrder);
      localStorage.setItem("user_orders", JSON.stringify(orders));
      console.log("[v0] Order saved to localStorage:", newOrder);
      return newOrder.id;
    }
  } catch (error) {
    console.error("[v0] Error saving order:", error);
    throw error;
  }
}

async function saveCustomerToDatabase(customerData) {
  try {
    if (usingSupabase()) {
      // Check if customer already exists
      const { data: existing } = await window.sb
        .from("customers")
        .select("id")
        .eq("email", customerData.email)
        .single();

      if (existing) {
        console.log("[v0] Customer already exists:", existing.id);
        return existing.id;
      }

      // Save new customer to Supabase
      const { data, error } = await window.sb.from("customers").insert([
        {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          barangay: customerData.barangay,
          gender: customerData.gender,
          age: customerData.age,
          alt_contact: customerData.altContact,
          notes: customerData.notes,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      console.log("[v0] Customer saved to Supabase:", data);
      return data?.[0]?.id;
    } else {
      // Save to localStorage
      const customers = JSON.parse(
        localStorage.getItem("user_customers") || "[]"
      );
      const existingCustomer = customers.find(
        (c) => c.email === customerData.email
      );

      if (existingCustomer) {
        console.log("[v0] Customer already exists:", existingCustomer.id);
        return existingCustomer.id;
      }

      const newCustomer = {
        id: "CUST_" + Date.now(),
        ...customerData,
        created_at: new Date().toISOString(),
      };
      customers.push(newCustomer);
      localStorage.setItem("user_customers", JSON.stringify(customers));
      console.log("[v0] Customer saved to localStorage:", newCustomer);
      return newCustomer.id;
    }
  } catch (error) {
    console.error("[v0] Error saving customer:", error);
    throw error;
  }
}

async function generateAndSaveRealInvoice(orderData, orderId) {
  try {
    const invoiceData = {
      order_id: orderId,
      invoice_number: "INV_" + Date.now(),
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      customer_address: orderData.customer.address,
      items: JSON.stringify(orderData.items),
      subtotal: orderData.total - orderData.delivery.fee,
      delivery_fee: orderData.delivery.fee,
      amount: orderData.total,
      payment_method: orderData.payment.method,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    if (usingSupabase()) {
      const { data, error } = await window.sb
        .from("invoices")
        .insert([invoiceData]);

      if (error) throw error;
      console.log("[v0] Invoice saved to Supabase:", data);
      return data?.[0]?.id;
    } else {
      const invoices = JSON.parse(
        localStorage.getItem("user_invoices") || "[]"
      );
      const newInvoice = {
        id: "REAL_INV_" + Date.now(),
        ...invoiceData,
      };
      invoices.push(newInvoice);
      localStorage.setItem("user_invoices", JSON.stringify(invoices));
      console.log("[v0] Invoice saved to localStorage:", newInvoice);
      return newInvoice.id;
    }
  } catch (error) {
    console.error("[v0] Error saving invoice:", error);
    throw error;
  }
}

// Confirm order
async function confirmOrder() {
  // Validate form
  const requiredFields = document.querySelectorAll(
    "#checkoutModal input[required], #checkoutModal select[required], #checkoutModal textarea[required]"
  );
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.style.borderColor = "#ff4757";
      isValid = false;
    } else {
      field.style.borderColor = "#ddd";
    }
  });

  // Validate phone numbers
  const phoneNumber = document.getElementById("phoneNumber");
  const altContactNumber = document.getElementById("altContactNumber");

  if (
    phoneNumber.value &&
    !isValidPhilippinesPhone(phoneNumber.value.replace(/-/g, ""))
  ) {
    phoneNumber.style.borderColor = "#ff4757";
    isValid = false;
  } else {
    phoneNumber.style.borderColor = "#ddd";
  }

  if (
    altContactNumber.value &&
    !isValidPhilippinesPhone(altContactNumber.value.replace(/-/g, ""))
  ) {
    altContactNumber.style.borderColor = "#ff4757";
    isValid = false;
  } else {
    altContactNumber.style.borderColor = "#ddd";
  }

  // Validate full name
  const fullName = document.getElementById("fullName");
  if (fullName.value && !isValidName(fullName.value)) {
    fullName.style.borderColor = "#ff4757";
    isValid = false;
  } else {
    fullName.style.borderColor = "#ddd";
  }

  const termsCheckbox = document.getElementById("terms");
  if (!termsCheckbox.checked) {
    isValid = false;
    showNotification("Please agree to the terms and conditions.", "error");
    return;
  }

  // Check if files are uploaded
  if (
    !uploadedFiles.govIdFront ||
    !uploadedFiles.govIdBack ||
    !uploadedFiles.selfie
  ) {
    showNotification(
      "Please capture Government ID (Front & Back) and Selfie for verification.",
      "error"
    );
    return;
  }

  if (!isValid) {
    showNotification("Please fill in all required fields correctly.", "error");
    return;
  }

  // Show processing
  const confirmBtn = document.querySelector(".confirm-btn");
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = "Processing...";
  confirmBtn.disabled = true;

  try {
    // Verify face match
    showNotification("Verifying identity...", "info");
    const isMatch = await verifyFaceMatch(
      uploadedFiles.govIdFront,
      uploadedFiles.govIdBack,
      uploadedFiles.selfie
    );

    if (!isMatch) {
      showNotification(
        "ID and selfie do not match. If you are nearby the store, we advise you to pay in cash.",
        "error"
      );
      confirmBtn.textContent = originalText;
      confirmBtn.disabled = false;
      return;
    }

    // Generate order
    const orderData = generateOrderData();

    showNotification("Saving customer information...", "info");
    const customerId = await saveCustomerToDatabase(orderData.customer);

    showNotification("Saving order...", "info");
    const orderId = await saveOrderToDatabase(orderData);

    showNotification("Generating invoice...", "info");
    const invoiceId = await generateAndSaveRealInvoice(orderData, orderId);

    generatePreInvoice(orderData);

    // Show success notification
    showNotification(
      "Order placed successfully! Check your invoice for details."
    );

    // Clear cart and close modal
    cart = [];
    uploadedFiles = { govIdFront: null, govIdBack: null, selfie: null };
    document.getElementById("govIdStatus").textContent = "";
    document.getElementById("selfieStatus").textContent = "";
    updateCartCount();
    saveCartToStorage();
    document.getElementById("checkoutModal").style.display = "none";
    document.body.style.overflow = "auto";
  } catch (error) {
    console.error("[v0] Order processing error:", error);
    showNotification(
      "An error occurred during order processing: " + error.message,
      "error"
    );
  } finally {
    confirmBtn.textContent = originalText;
    confirmBtn.disabled = false;
  }
}

// Generate order data
function generateOrderData() {
  const now = new Date();
  const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  return {
    orderNumber: "CC" + now.getTime(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    customer: {
      name: document.getElementById("fullName").value,
      phone:
        "+63" + document.getElementById("phoneNumber").value.replace(/-/g, ""),
      email: document.getElementById("emailAddress").value,
      address: document.getElementById("completeAddress").value,
      barangay: document.getElementById("barangaySelect").value,
      gender: document.getElementById("genderSelect").value,
      age: document.getElementById("ageInput").value,
      altContact:
        "+63" +
        document.getElementById("altContactNumber").value.replace(/-/g, ""),
      notes: document.getElementById("deliveryNotes").value || "None",
    },
    items: [...cart],
    delivery: {
      method: document.querySelector('input[name="delivery"]:checked').value,
      location:
        document.querySelector('input[name="location"]:checked')?.value || null,
      fee:
        document.querySelector('input[name="delivery"]:checked').value ===
        "pickup"
          ? 0
          : 50,
      estimatedDate: deliveryDate.toLocaleDateString(),
    },
    payment: {
      method: document.querySelector('input[name="payment"]:checked').value,
      paymentType:
        document.querySelector('input[name="paymentMethod"]:checked')?.value ||
        null,
    },
    total:
      cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
      (document.querySelector('input[name="delivery"]:checked').value ===
      "pickup"
        ? 0
        : 50),
  };
}

// Generate pre-invoice
function generatePreInvoice(orderData) {
  const invoiceContainer = document.getElementById("invoiceContainer");

  invoiceContainer.innerHTML = `
        <div class="invoice-header">
            <h2 class="invoice-title">ORDER INVOICE</h2>
            <p class="invoice-subtitle">Thank you for your purchase! Please keep this invoice for your records.</p>
        </div>
        
        <div class="invoice-details">
            <div class="invoice-section">
                <h4>Order Information</h4>
                <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p><strong>Date:</strong> ${orderData.date}</p>
                <p><strong>Time:</strong> ${orderData.time}</p>
            </div>
            
            <div class="invoice-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> ${orderData.customer.name}</p>
                <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
                <p><strong>Email:</strong> ${orderData.customer.email}</p>
                <p><strong>Delivery Method:</strong> ${
                  orderData.delivery.method === "pickup"
                    ? "Store Pickup"
                    : "Delivery"
                }</p>
            </div>
        </div>
        
        <div class="invoice-items">
            <h4>Items Ordered</h4>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.size}</td>
                            <td>${item.quantity}</td>
                            <td>₱${item.price.toFixed(2)}</td>
                            <td>₱${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
        
        <div class="invoice-total">
            <div class="invoice-total-line">
                <span>Subtotal:</span>
                <span>₱${(orderData.total - orderData.delivery.fee).toFixed(
                  2
                )}</span>
            </div>
            <div class="invoice-total-line">
                <span>Delivery Fee:</span>
                <span>₱${orderData.delivery.fee.toFixed(2)}</span>
            </div>
            <div class="invoice-total-line final">
                <span>TOTAL:</span>
                <span>₱${orderData.total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="invoice-footer">
            <p><strong>Important:</strong> ${
              orderData.delivery.method === "pickup"
                ? `Please claim your order within 3 days (by ${orderData.delivery.estimatedDate}).`
                : "Your order will be delivered within 3-5 business days."
            }</p>
            <p><strong>Store Hours:</strong> Monday - Saturday: 8:00 AM - 8:00 PM</p>
            <p><strong>Note:</strong> The shop does not refund any item. We only replace the item.</p>
            <p>Thank you for choosing Clever Clothing!</p>
        </div>
    `;

  // Show pre-invoice modal
  document.getElementById("preInvoiceModal").style.display = "block";
}

// Download invoice as PDF
async function downloadInvoice() {
  const invoiceContent = document.getElementById("invoiceContainer");
  const orderNumberElement = invoiceContent.querySelector(
    ".invoice-section p strong"
  );
  const orderNumber = orderNumberElement
    ? orderNumberElement.nextSibling.textContent.trim()
    : "invoice";

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");

  const canvas = await window.html2canvas(invoiceContent, { scale: 2 }); // Scale for better quality

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  doc.save(`Pre-Invoice-${orderNumber}.pdf`);
  showNotification("Invoice downloaded as PDF!", "success");
}

// Print invoice
function printInvoice() {
  const invoiceContent = document.getElementById("invoiceContainer").innerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Print Pre-Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
                    .invoice-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
                    .invoice-subtitle { color: #666; font-size: 14px; background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeaa7; }
                    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                    .invoice-section h4 { color: #333; margin-bottom: 10px; font-size: 16px; }
                    .invoice-section p { margin-bottom: 5px; color: #666; font-size: 14px; }
                    .invoice-items table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .invoice-items th, .invoice-items td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    .invoice-items th { background: #f8f9fa; font-weight: bold; color: #333; }
                    .invoice-total { text-align: right; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 30px; }
                    .invoice-total-line { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
                    .invoice-total-line.final { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; }
                    .invoice-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                ${invoiceContent}
            </body>
        </html>
    `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// Close invoice and show thank you
function closeInvoiceAndShowThankYou() {
  document.getElementById("preInvoiceModal").style.display = "none";
  document.getElementById("thankYouModal").style.display = "block";
}

// Close thank you modal
function closeThankYou() {
  document.getElementById("thankYouModal").style.display = "none";
  document.body.style.overflow = "auto";
}

// Show learn more modal
function showLearnMore(title, content, imageUrl) {
  document.getElementById("learnMoreTitle").textContent = title;
  document.getElementById("learnMoreContent").textContent = content;
  document.getElementById("learnMoreImage").src = imageUrl;
  document.getElementById("learnMoreModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close learn more modal
function closeLearnMore() {
  document.getElementById("learnMoreModal").style.display = "none";
  document.body.style.overflow = "auto";
}

// Handle contact form submission
function handleContactForm() {
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;

  // In a real application, this would send the email to the server
  // For demo purposes, we'll show a success message
  showNotification("Message sent successfully! We will get back to you soon.");

  // Clear form
  document.getElementById("contactForm").reset();
}

// Show Instagram message
function showInstagramMessage() {
  showNotification(
    "Admin is still working on making an account on this. We will inform you on our page once it's created. Thank you!",
    "info"
  );
}

// Smooth scroll behavior for navigation
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.15)";
  } else {
    navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  }

  // Update active nav link based on scroll position
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  let current = "";
  sections.forEach((section) => {
    if (section.style.display !== "none") {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const openModal = document.querySelector('.modal[style*="block"]');
    if (openModal) {
      openModal.style.display = "none";
      document.body.style.overflow = "auto";
    }

    const captureModal = document.querySelector(".capture-modal");
    if (captureModal) {
      closeCaptureModal();
    }
  }

  if (document.getElementById("productModal").style.display === "block") {
    if (e.key === "ArrowLeft") {
      const currentId = currentProduct ? currentProduct.id : 1;
      const prevId = currentId > 1 ? currentId - 1 : 4;
      viewProduct(prevId);
    } else if (e.key === "ArrowRight") {
      const currentId = currentProduct ? currentProduct.id : 1;
      const nextId = currentId < 4 ? currentId + 1 : 1;
      viewProduct(nextId);
    }
  }
});

// Add camera modal styles
const cameraStyles = `
    .capture-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .capture-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 600px; /* Increased max-width for landscape ID */
        width: 90%;
    }
    
    .camera-view {
        margin-top: 20px;
    }
    
    .camera-view video {
        width: 100%;
        max-width: 550px; /* Adjusted for landscape */
        height: auto;
        border-radius: 8px;
        margin-bottom: 20px;
        /* transform: scaleX(-1); This will be set dynamically based on facingMode */
    }
    
    .capture-btn, .cancel-capture {
        padding: 12px 25px;
        margin: 0 10px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        background: black; /* Changed to black */
        color: white; /* Changed to white */
    }
    
    .capture-btn:hover {
        background: #555;
    }
    
    .cancel-capture:hover {
        background: #555;
    }
`;

// Add camera styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = cameraStyles;
document.head.appendChild(styleSheet);

// Define STORAGE_KEYS object
const STORAGE_KEYS = {
  CART: "cleverClothingCart",
  WISHLIST: "cleverClothingWishlist",
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // All initialization code is already called above
  console.log("Clever Clothing website initialized successfully");
});

// Load cart from localStorage on startup
function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading cart from storage:", e);
    return [];
  }
}

// Load wishlist from localStorage on startup
function loadWishlistFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading wishlist from storage:", e);
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving cart to storage:", e);
  }
}

function saveWishlistToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (e) {
    console.error("Error saving wishlist to storage:", e);
  }
}
