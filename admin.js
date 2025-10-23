// Admin Dashboard JavaScript - Enhanced
class AdminDashboard {
  constructor() {
    this.currentUser = null;
    this.currentSection = "dashboard";
    this.products = this.loadProducts();
    this.orders = this.loadOrders();
    this.customers = this.loadCustomers();
    this.members = this.loadMembers();
    this.settings = this.loadSettings();
    this.stockRequests = this.loadStockRequests();
    this.reportRequests = this.loadReportRequests();
    this.reports = this.loadReports();
    this.notifications = this.loadNotifications();
    this.invoices = this.loadInvoices();

    this.initializeApp();
  }

  initializeApp() {
    this.initializeDefaultData();
    this.setupEventListeners();
    this.updateCurrentDate();
    this.checkLoginStatus();
  }

  initializeDefaultData() {
    const members = this.loadMembers();
    if (members.length === 0) {
      const defaultAdmin = {
        id: "ADMIN_001",
        username: "admin",
        password: "admin123",
        role: "head_admin",
        status: "active",
        createdDate: new Date().toISOString(),
        lastLogin: null,
      };
      localStorage.setItem("admin_members", JSON.stringify([defaultAdmin]));
      this.members = [defaultAdmin];
      console.log(
        "[Init] Default admin account created. Username: admin, Password: admin123"
      );
    }

    // Initialize default members if none exist
    // Members will only be added when explicitly created by the admin

    // Initialize default settings
    const settings = this.loadSettings();
    if (!settings.initialized) {
      const defaultSettings = {
        initialized: true,
        storeName: "Clever Clothing",
        storeAddress: "Tarlac City, Central Luzon, Philippines",
        storePhone: "+63 123 456 7893",
        storeEmail: "cleverclothing@gmail.com",
        deliveryFee: 50,
        resellerCommission: 15,
        autoApproval: false,
      };
      localStorage.setItem("admin_settings", JSON.stringify(defaultSettings));
      this.settings = defaultSettings;
    }

    // Initialize sample customers with verification data
    const customers = this.loadCustomers();
    if (customers.length === 0) {
      const sampleCustomers = [
        {
          id: "CUST_001",
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+63 912 345 6789",
          address: "123 Main Street, Subdivision ABC",
          barangay: "San Miguel",
          gender: "male",
          age: 28,
          govId:
            "https://placeholder-image-service.onrender.com/image/300x200?prompt=Government ID card showing personal details with official stamps and watermarks&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
          selfieVerification:
            "https://placeholder-image-service.onrender.com/image/300x400?prompt=Professional selfie photo of a person for identity verification with clear face visibility&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
          verificationStatus: "verified",
        },
        {
          id: "CUST_002",
          name: "Jane Smith",
          email: "jane.smith@email.com",
          phone: "+63 923 456 7890",
          address: "456 Oak Avenue, Village XYZ",
          barangay: "Santa Rosa",
          gender: "female",
          age: 32,
          govId:
            "https://placeholder-image-service.onrender.com/image/300x200?prompt=Government ID card with official seal and personal information clearly visible&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
          selfieVerification:
            "https://placeholder-image-service.onrender.com/image/300x400?prompt=Clear selfie verification photo showing full face for identity confirmation&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
          verificationStatus: "verified",
        },
      ];
      localStorage.setItem("admin_customers", JSON.stringify(sampleCustomers));
      this.customers = sampleCustomers;
    }

    // Initialize sample orders with verification data
    const orders = this.loadOrders();
    if (orders.length === 0) {
      const sampleOrders = [
        {
          id: "ORD_001",
          customer: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "+63 912 345 6789",
            address: "123 Main Street, Subdivision ABC",
            barangay: "San Miguel",
            gender: "male",
            age: 28,
            govId:
              "https://placeholder-image-service.onrender.com/image/300x200?prompt=Government ID card showing personal details with official stamps and watermarks&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
            selfieVerification:
              "https://placeholder-image-service.onrender.com/image/300x400?prompt=Professional selfie photo of a person for identity verification with clear face visibility&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
            verificationStatus: "verified",
          },
          items: [
            {
              id: 1,
              name: "Be Clever Enough",
              price: 550,
              quantity: 2,
              size: "L",
              image:
                "https://placeholder-image-service.onrender.com/image/100x100?prompt=Stylish black t-shirt with clever text design&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
            },
          ],
          total: 1150,
          status: "pending",
          date: new Date().toISOString(),
          delivery: {
            method: "pickup",
            fee: 0,
            estimatedDate: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
          },
          payment: {
            method: "cod",
            paymentType: "cash",
          },
          hasPreInvoice: false,
          hasRealInvoice: false,
        },
      ];
      localStorage.setItem("admin_orders", JSON.stringify(sampleOrders));
      this.orders = sampleOrders;
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Modal close buttons
    document.querySelectorAll(".close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal");
        if (modal) this.closeModal(modal.id);
      });
    });

    // Modal background clicks
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Form submissions
    this.setupFormListeners();

    // Quick action buttons
    this.setupQuickActionListeners();

    // Filter and search
    this.setupFilterListeners();

    // Click outside to close notifications
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".notification-bell") &&
        !e.target.closest(".notification-dropdown")
      ) {
        this.hideNotifications();
      }
    });

    const applyDateRangeBtn = document.getElementById("applyDateRange");
    if (applyDateRangeBtn) {
      applyDateRangeBtn.addEventListener("click", () => {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (!startDate || !endDate) {
          this.showNotification(
            "Please select both start and end dates",
            "error"
          );
          return;
        }

        if (new Date(startDate) > new Date(endDate)) {
          this.showNotification("Start date must be before end date", "error");
          return;
        }

        this.showNotification(
          "Analytics filtered for selected date range",
          "success"
        );
        this.loadAnalyticsData();
      });
    }
  }

  setupFormListeners() {
    // Product form
    const productForm = document.getElementById("productForm");
    if (productForm) {
      productForm.addEventListener("submit", (e) =>
        this.handleProductSubmit(e)
      );
    }

    // Customer form
    const customerForm = document.getElementById("customerForm");
    if (customerForm) {
      customerForm.addEventListener("submit", (e) =>
        this.handleCustomerSubmit(e)
      );
    }

    // Member form
    const memberForm = document.getElementById("memberForm");
    if (memberForm) {
      memberForm.addEventListener("submit", (e) => this.handleMemberSubmit(e));
    }

    // Stock form
    const stockForm = document.getElementById("stockForm");
    if (stockForm) {
      stockForm.addEventListener("submit", (e) => this.handleStockSubmit(e));
    }

    // Stock request form
    const stockRequestForm = document.getElementById("stockRequestFormSubmit");
    if (stockRequestForm) {
      stockRequestForm.addEventListener("submit", (e) =>
        this.handleStockRequestSubmit(e)
      );
    }

    // Report request form
    const reportRequestForm = document.getElementById(
      "reportRequestFormSubmit"
    );
    if (reportRequestForm) {
      reportRequestForm.addEventListener("submit", (e) =>
        this.handleReportRequestSubmit(e)
      );
    }

    // Report generation form
    const reportForm = document.getElementById("reportForm");
    if (reportForm) {
      reportForm.addEventListener("submit", (e) => this.handleReportSubmit(e));
    }

    // Settings forms
    const storeSettingsForm = document.getElementById("storeSettingsForm");
    if (storeSettingsForm) {
      storeSettingsForm.addEventListener("submit", (e) =>
        this.handleStoreSettingsSubmit(e)
      );
    }

    const passwordChangeForm = document.getElementById("passwordChangeForm");
    if (passwordChangeForm) {
      passwordChangeForm.addEventListener("submit", (e) =>
        this.handlePasswordChange(e)
      );
    }

    const systemSettingsForm = document.getElementById("systemSettingsForm");
    if (systemSettingsForm) {
      systemSettingsForm.addEventListener("submit", (e) =>
        this.handleSystemSettingsSubmit(e)
      );
    }
  }

  setupQuickActionListeners() {
    const addProductBtn = document.getElementById("addProductBtn");
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => this.showAddProductModal());
    }

    const addCustomerBtn = document.getElementById("addCustomerBtn");
    if (addCustomerBtn) {
      addCustomerBtn.addEventListener("click", () =>
        this.showAddCustomerModal()
      );
    }

    const addMemberBtn = document.getElementById("addMemberBtnHeader");
    if (addMemberBtn) {
      addMemberBtn.addEventListener("click", () => this.showAddMemberModal());
    }

    const updateStockBtn = document.getElementById("updateStockBtn");
    if (updateStockBtn) {
      updateStockBtn.addEventListener("click", () => this.showStockModal());
    }

    const newRequestBtn = document.getElementById("newRequestBtn");
    if (newRequestBtn) {
      newRequestBtn.addEventListener("click", () =>
        this.showStockRequestForm()
      );
    }

    const requestReportBtn = document.getElementById("requestReportBtn");
    if (requestReportBtn) {
      requestReportBtn.addEventListener("click", () =>
        this.showReportRequestForm()
      );
    }

    const generateReportBtn = document.getElementById("generateReportBtn");
    if (generateReportBtn) {
      generateReportBtn.addEventListener("click", () =>
        this.showReportGenerationForm()
      );
    }

    // Invoice buttons
    const generatePreInvoiceBtn = document.getElementById(
      "generatePreInvoiceBtn"
    );
    if (generatePreInvoiceBtn) {
      generatePreInvoiceBtn.addEventListener("click", () =>
        this.generatePreInvoice()
      );
    }

    const generateRealInvoiceBtn = document.getElementById(
      "generateRealInvoiceBtn"
    );
    if (generateRealInvoiceBtn) {
      generateRealInvoiceBtn.addEventListener("click", () =>
        this.generateRealInvoice()
      );
    }

    const printInvoiceBtn = document.getElementById("printInvoiceBtn");
    if (printInvoiceBtn) {
      printInvoiceBtn.addEventListener("click", () => this.printInvoice());
    }

    const verifyInvoiceBtn = document.getElementById("verifyInvoiceBtn");
    if (verifyInvoiceBtn) {
      verifyInvoiceBtn.addEventListener("click", () =>
        this.showInvoiceVerification()
      );
    }

    const markInvoiceVerifiedBtn = document.getElementById(
      "markInvoiceVerifiedBtn"
    );
    if (markInvoiceVerifiedBtn) {
      markInvoiceVerifiedBtn.addEventListener("click", () =>
        this.markInvoiceVerified()
      );
    }
  }

  setupFilterListeners() {
    const orderStatusFilter = document.getElementById("orderStatusFilter");
    if (orderStatusFilter) {
      orderStatusFilter.addEventListener("change", () => this.filterOrders());
    }

    const invoiceTypeFilter = document.getElementById("invoiceTypeFilter");
    if (invoiceTypeFilter) {
      invoiceTypeFilter.addEventListener("change", () => this.filterInvoices());
    }

    const customerSearch = document.getElementById("customerSearch");
    if (customerSearch) {
      customerSearch.addEventListener("input", () => this.searchCustomers());
    }

    // Stock product selector
    const stockProductId = document.getElementById("stockProductId");
    if (stockProductId) {
      stockProductId.addEventListener("change", () =>
        this.updateCurrentStock()
      );
    }

    // Member role selector
    const memberRole = document.getElementById("memberRole");
    if (memberRole) {
      memberRole.addEventListener("change", () => this.checkHeadAdminLimit());
    }

    // Report type selector
    const reportType = document.getElementById("reportType");
    if (reportType) {
      reportType.addEventListener("change", () => this.updateReportDateRange());
    }
  }

  // Authentication
  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginBtn = document.querySelector(".login-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const spinner = loginBtn.querySelector(".loading-spinner");
    const errorDiv = document.getElementById("loginError");

    // Show loading state
    btnText.style.display = "none";
    spinner.style.display = "block";
    loginBtn.disabled = true;
    errorDiv.style.display = "none";

    try {
      await this.fetchMembersFromDB();

      // Simulate login delay
      setTimeout(() => {
        const member = this.members.find(
          (m) =>
            m.username === username &&
            m.password === password &&
            m.status === "active"
        );

        if (member) {
          // Update last login
          member.lastLogin = new Date().toISOString();
          this.saveMembers();

          this.currentUser = member;
          localStorage.setItem("admin_current_user", JSON.stringify(member));

          this.showDashboard();
          this.showNotification("Login successful!", "success");
        } else {
          errorDiv.textContent = "Invalid username or password";
          errorDiv.style.display = "block";
        }

        // Reset button state
        btnText.style.display = "block";
        spinner.style.display = "none";
        loginBtn.disabled = false;
      }, 1500);
    } catch (error) {
      console.error("[Login] Error during authentication:", error);
      errorDiv.textContent = "Login error. Please try again.";
      errorDiv.style.display = "block";

      // Reset button state
      btnText.style.display = "block";
      spinner.style.display = "none";
      loginBtn.disabled = false;
    }
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem("admin_current_user");

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";

    // Reset form
    document.getElementById("loginForm").reset();
    document.getElementById("loginError").style.display = "none";

    this.showNotification("Logged out successfully", "info");
  }

  checkLoginStatus() {
    const savedUser = localStorage.getItem("admin_current_user");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showDashboard();
    }
  }

  showDashboard() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";

    this.updateUserInfo();
    this.updateNavigationAccess();
    this.loadDashboardData();
    this.showSection("dashboard");
    this.updateNotificationCount();
  }

  updateUserInfo() {
    document.getElementById("currentUser").textContent =
      this.currentUser.username;
    document.getElementById("userRole").textContent =
      this.currentUser.role === "head_admin" ? "Head Admin" : "Reseller";
  }

  updateNavigationAccess() {
    const isHeadAdmin = this.currentUser.role === "head_admin";

    // Hide/show navigation items based on role
    document.getElementById("membersNavItem").style.display = isHeadAdmin
      ? "block"
      : "none";
    document.getElementById("customersNavItem").style.display = isHeadAdmin
      ? "block"
      : "none";
    document.getElementById("settingsNavItem").style.display = isHeadAdmin
      ? "block"
      : "none";
    document.getElementById("invoicesNavItem").style.display = "block";

    // Update requests navigation text
    const requestsNavText = document.getElementById("requestsNavText");
    if (isHeadAdmin) {
      requestsNavText.textContent = "Requests";
    } else {
      requestsNavText.textContent = "Stock Requests";
    }

    // Show/hide reports section
    document.getElementById("reportsNavItem").style.display = "block";

    // Show limited access for resellers
    if (!isHeadAdmin) {
      document.getElementById("productsNavItem").style.display = "none";
      document.getElementById("ordersNavItem").style.display = "none";
      document.getElementById("inventoryNavItem").style.display = "none";
      document.getElementById("addMemberBtn").style.display = "none";
      document.getElementById("addProductQuick").style.display = "none";
      document.getElementById("stockRequestQuick").style.display = "block";
    }
  }

  // Navigation
  handleNavigation(e) {
    e.preventDefault();
    const section = e.target.closest(".nav-link").dataset.section;
    this.showSection(section);
  }

  showSection(sectionName) {
    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    const activeLink = document.querySelector(
      `[data-section="${sectionName}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }

    // Hide all sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
      targetSection.classList.add("active");
      this.currentSection = sectionName;
      this.loadSectionData(sectionName);
    }
  }

  loadSectionData(section) {
    switch (section) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "products":
        this.loadProductsData();
        break;
      case "orders":
        this.loadOrdersData();
        break;
      case "invoices":
        this.loadInvoicesData();
        break;
      case "customers":
        this.loadCustomersData();
        break;
      case "members":
        this.loadMembersData();
        break;
      case "inventory":
        this.loadInventoryData();
        break;
      case "requests":
        this.loadRequestsData();
        break;
      case "reports":
        this.loadReportsData();
        break;
      case "analytics":
        this.loadAnalyticsData();
        break;
      case "settings":
        this.loadSettingsData();
        break;
    }
  }

  // Dashboard Data
  loadDashboardData() {
    this.updateStats();
    this.loadRecentOrders();
  }

  updateStats() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalCustomers = this.customers.length;
    const totalProducts = this.products.length;

    document.getElementById("totalOrders").textContent = totalOrders;
    document.getElementById(
      "totalRevenue"
    ).textContent = `₱${totalRevenue.toFixed(2)}`;
    document.getElementById("totalCustomers").textContent = totalCustomers;
    document.getElementById("totalProducts").textContent = totalProducts;
  }

  loadRecentOrders() {
    const recentOrders = this.orders.slice(-5).reverse();
    const tbody = document.getElementById("recentOrdersBody");

    if (recentOrders.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="no-data">No recent orders</td></tr>';
      return;
    }

    tbody.innerHTML = recentOrders
      .map(
        (order) => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer.name}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>₱${order.total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${
          order.status
        }</span></td>
            </tr>
        `
      )
      .join("");
  }

  // Products Management
  loadProductsData() {
    const grid = document.getElementById("productsGrid");

    if (this.usingSupabase()) {
      grid.innerHTML =
        '<div class="no-data" style="grid-column: 1/-1;">Loading products...</div>';
      this.fetchProductsFromDB().finally(() => {
        this.renderProducts();
        this.updateStats();
      });
      return;
    }

    this.renderProducts();
  }

  renderProducts() {
    const grid = document.getElementById("productsGrid");

    if (!this.products || this.products.length === 0) {
      grid.innerHTML =
        '<div class="no-data" style="grid-column: 1/-1;">No products found</div>';
      return;
    }

    grid.innerHTML = this.products
      .map(
        (product) => `
            <div class="product-card">
                <div class="product-card-image">
                    <img src="${product.image}" alt="${
          product.name
        }" onerror="this.src='https://placeholder-image-service.onrender.com/image/300x200?prompt=Product placeholder image for ${
          product.name
        }&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d'">
                </div>
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">₱${Number(product.price).toFixed(
                      2
                    )}</div>
                    <div class="product-stock">Stock: ${
                      product.stock || 0
                    }</div>
                    <div class="product-actions">
                        <button class="edit-btn" onclick="adminDashboard.editProduct(${
                          product.id
                        })">Edit</button>
                        <button class="delete-btn" onclick="adminDashboard.deleteProduct(${
                          product.id
                        })">Delete</button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  showAddProductModal() {
    document.getElementById("productModalTitle").textContent = "Add Product";
    document.getElementById("productForm").reset();
    document.getElementById("productForm").dataset.editId = "";
    this.showModal("productModal");
  }

  editProduct(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    document.getElementById("productModalTitle").textContent = "Edit Product";
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("productForm").dataset.editId = productId;

    this.showModal("productModal");
  }

  async handleProductSubmit(e) {
    e.preventDefault();

    const editId = e.target.dataset.editId;

    const placeholderImg =
      "https://placeholder-image-service.onrender.com/image/300x200?prompt=Product placeholder image&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d";

    const name = document.getElementById("productName").value;
    const price = Number.parseFloat(
      document.getElementById("productPrice").value
    );
    const description = document.getElementById("productDescription").value;
    const category = document.getElementById("productCategory").value;
    const stock =
      Number.parseInt(document.getElementById("productStock").value) || 0;
    const fileInput = document.getElementById("productImage");
    const selectedFile = fileInput.files && fileInput.files[0];

    let existingImage = placeholderImg;
    if (editId) {
      const existing = this.products.find((p) => p.id == editId);
      if (existing && existing.image) existingImage = existing.image;
    }
    const image = selectedFile
      ? URL.createObjectURL(selectedFile)
      : existingImage;

    const productData = { name, price, description, category, stock, image };

    if (this.usingSupabase()) {
      try {
        if (editId) {
          await window.sb
            .from("products")
            .update(productData)
            .eq("id", Number(editId));
          this.showNotification("Product updated successfully!", "success");
        } else {
          await window.sb.from("products").insert(productData);
          this.showNotification("Product added successfully!", "success");
        }
        this.closeModal("productModal");
        await this.fetchProductsFromDB();
        this.renderProducts();
        this.updateStats();
      } catch (err) {
        console.error("[Supabase] upsert product error", err);
        this.showNotification("Database error while saving product", "error");
      }
      return;
    }

    // Local fallback
    if (editId) {
      const index = this.products.findIndex((p) => p.id == editId);
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...productData };
        this.showNotification("Product updated successfully!", "success");
      }
    } else {
      const newProduct = { id: Date.now(), ...productData };
      this.products.push(newProduct);
      this.showNotification("Product added successfully!", "success");
    }

    this.saveProducts();
    this.closeModal("productModal");
    this.loadProductsData();
    this.updateStats();
  }

  async deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
      if (this.usingSupabase()) {
        try {
          await window.sb.from("products").delete().eq("id", Number(productId));
          await this.fetchProductsFromDB();
          this.renderProducts();
          this.updateStats();
          this.showNotification("Product deleted successfully!", "success");
        } catch (err) {
          console.error("[Supabase] delete product error", err);
          this.showNotification(
            "Database error while deleting product",
            "error"
          );
        }
        return;
      }

      this.products = this.products.filter((p) => p.id !== productId);
      this.saveProducts();
      this.loadProductsData();
      this.updateStats();
      this.showNotification("Product deleted successfully!", "success");
    }
  }

  // Customer Management - Enhanced
  loadCustomersData() {
    if (this.usingSupabase()) {
      // Load both customers and orders in parallel for proper syncing
      Promise.all([this.fetchCustomersFromDB(), this.fetchOrdersFromDB()])
        .then(() => {
          this.displayCustomers(this.customers);
        })
        .catch((error) => {
          console.error("[DB Sync] Error loading customer data:", error);
          this.displayCustomers(this.customers);
        });
      return;
    }
    this.displayCustomers(this.customers);
  }

  searchCustomers() {
    const searchTerm = document
      .getElementById("customerSearch")
      .value.toLowerCase();
    const filteredCustomers = this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm) ||
        customer.barangay.toLowerCase().includes(searchTerm)
    );
    this.displayCustomers(filteredCustomers);
  }

  displayCustomers(customers) {
    const tbody = document.getElementById("customersTableBody");

    if (customers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="12" class="no-data">No customers found</td></tr>';
      return;
    }

    tbody.innerHTML = customers
      .map((customer) => {
        const customerOrders = this.orders.filter((order) => {
          // Match by customer email if available
          if (order.customer && order.customer.email) {
            return order.customer.email === customer.email;
          }
          // Fallback: match by customer ID if email is not available
          if (order.customer_id === customer.id) {
            return true;
          }
          return false;
        });

        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );
        const verificationStatus = this.getCustomerVerificationStatus(customer);

        return `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.address.substring(0, 30)}...</td>
                    <td>${customer.barangay || "N/A"}</td>
                    <td>${customer.age || "N/A"}</td>
                    <td>${customer.gender || "N/A"}</td>
                    <td>${customerOrders.length}</td>
                    <td>₱${totalSpent.toFixed(2)}</td>
                    <td>
                        <div class="verification-status">
                            <div class="verification-indicator ${
                              verificationStatus.class
                            }"></div>
                            <span class="status-badge ${
                              verificationStatus.class
                            }">${verificationStatus.text}</span>
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn view" onclick="adminDashboard.viewCustomer('${
                              customer.id
                            }')">View</button>
                            <button class="table-btn verify" onclick="adminDashboard.viewCustomerVerification('${
                              customer.id
                            }')">Verify</button>
                            <button class="table-btn edit" onclick="adminDashboard.editCustomer('${
                              customer.id
                            }')">Edit</button>
                            <button class="table-btn delete" onclick="adminDashboard.deleteCustomer('${
                              customer.id
                            }')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  getCustomerVerificationStatus(customer) {
    if (!customer.govId || !customer.selfieVerification) {
      return { class: "missing", text: "Missing" };
    }
    if (customer.verificationStatus === "verified") {
      return { class: "verified", text: "Verified" };
    }
    return { class: "unverified", text: "Unverified" };
  }

  viewCustomerVerification(customerId) {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return;

    const content = document.getElementById("verificationContent");
    content.innerHTML = `
            <div class="verification-images">
                <div class="verification-image-container">
                    <h4>Government ID</h4>
                    ${
                      customer.govId
                        ? `<img src="${customer.govId}" alt="Government ID verification document showing official identification" class="verification-image">`
                        : `<div class="verification-image missing">No ID uploaded</div>`
                    }
                </div>
                <div class="verification-image-container">
                    <h4>Selfie Verification</h4>
                    ${
                      customer.selfieVerification
                        ? `<img src="${customer.selfieVerification}" alt="Selfie verification photo showing clear face for identity confirmation" class="verification-image">`
                        : `<div class="verification-image missing">No selfie uploaded</div>`
                    }
                </div>
            </div>
            <div class="verification-info" style="margin-top: 20px;">
                <div class="info-group">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${customer.name}</p>
                    <p><strong>Age:</strong> ${customer.age || "N/A"}</p>
                    <p><strong>Gender:</strong> ${customer.gender || "N/A"}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${
                      customer.verificationStatus || "unverified"
                    }">${customer.verificationStatus || "Unverified"}</span></p>
                </div>
            </div>
        `;

    this.showModal("verificationModal");
  }

  showAddCustomerModal() {
    document.getElementById("customerModalTitle").textContent = "Add Customer";
    document.getElementById("customerForm").reset();
    document.getElementById("customerId").value = `CUST_${Date.now()}`;
    document.getElementById("customerForm").dataset.editId = "";
    this.showModal("customerModal");
  }

  editCustomer(customerId) {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return;

    document.getElementById("customerModalTitle").textContent = "Edit Customer";
    document.getElementById("customerId").value = customer.id;
    document.getElementById("customerName").value = customer.name;
    document.getElementById("customerEmail").value = customer.email;
    document.getElementById("customerPhone").value = customer.phone;
    document.getElementById("customerAddress").value = customer.address;
    document.getElementById("customerBarangay").value = customer.barangay || "";
    document.getElementById("customerGender").value = customer.gender || "";
    document.getElementById("customerAge").value = customer.age || "";
    document.getElementById("customerForm").dataset.editId = customerId;

    this.showModal("customerModal");
  }

  async handleCustomerSubmit(e) {
    e.preventDefault();

    const editId = e.target.dataset.editId;
    const govIdFile = document.getElementById("customerGovId").files[0];
    const selfieFile = document.getElementById("customerSelfie").files[0];

    const customerData = {
      id: document.getElementById("customerId").value,
      name: document.getElementById("customerName").value,
      email: document.getElementById("customerEmail").value,
      phone: document.getElementById("customerPhone").value,
      address: document.getElementById("customerAddress").value,
      barangay: document.getElementById("customerBarangay").value,
      gender: document.getElementById("customerGender").value,
      age: Number.parseInt(document.getElementById("customerAge").value),
      govId: govIdFile ? URL.createObjectURL(govIdFile) : undefined,
      selfieVerification: selfieFile
        ? URL.createObjectURL(selfieFile)
        : undefined,
      verificationStatus: "unverified",
    };

    if (this.usingSupabase()) {
      try {
        if (editId) {
          const payload = { ...customerData };
          delete payload.id; // use existing DB id
          await window.sb
            .from("customers")
            .update({
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              address: payload.address,
              barangay: payload.barangay,
              gender: payload.gender,
              age: payload.age,
              gov_id_url: payload.govId || null,
              selfie_url: payload.selfieVerification || null,
              verification_status: payload.verificationStatus,
            })
            .eq("id", editId);
          this.showNotification("Customer updated successfully!", "success");
        } else {
          const { data, error } = await window.sb
            .from("customers")
            .insert({
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              address: customerData.address,
              barangay: customerData.barangay,
              gender: customerData.gender,
              age: customerData.age,
              gov_id_url: customerData.govId || null,
              selfie_url: customerData.selfieVerification || null,
              verification_status: customerData.verificationStatus,
            })
            .select("id");
          if (error) throw error;
        }
        this.closeModal("customerModal");
        await this.fetchCustomersFromDB();
        this.displayCustomers(this.customers);
        this.updateStats();
      } catch (err) {
        console.error("[Supabase] upsert customer error", err);
        this.showNotification("Database error while saving customer", "error");
      }
      return;
    }

    if (editId) {
      // Update existing customer
      const index = this.customers.findIndex((c) => c.id === editId);
      if (index !== -1) {
        const existingCustomer = this.customers[index];
        this.customers[index] = {
          ...existingCustomer,
          ...customerData,
          govId: customerData.govId || existingCustomer.govId,
          selfieVerification:
            customerData.selfieVerification ||
            existingCustomer.selfieVerification,
        };
        this.showNotification("Customer updated successfully!", "success");
      }
    } else {
      // Add new customer
      this.customers.push(customerData);
      this.showNotification("Customer added successfully!", "success");
    }

    this.saveCustomers();
    this.closeModal("customerModal");
    this.loadCustomersData();
    this.updateStats();
  }

  viewCustomer(customerId) {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return;

    const customerOrders = this.orders.filter(
      (o) => o.customer.email === customer.email
    );
    const totalSpent = customerOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const content = document.getElementById("customerDetailsContent");
    content.innerHTML = `
            <div class="customer-info">
                <div class="info-group">
                    <h4>Personal Information</h4>
                    <p><strong>ID:</strong> ${customer.id}</p>
                    <p><strong>Name:</strong> ${customer.name}</p>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Gender:</strong> ${customer.gender || "N/A"}</p>
                    <p><strong>Age:</strong> ${customer.age || "N/A"}</p>
                </div>
                
                <div class="info-group">
                    <h4>Address Information</h4>
                    <p><strong>Complete Address:</strong> ${
                      customer.address
                    }</p>
                    <p><strong>Barangay:</strong> ${
                      customer.barangay || "N/A"
                    }</p>
                </div>
                
                <div class="info-group">
                    <h4>Verification Status</h4>
                    <p><strong>Status:</strong> <span class="status-badge ${
                      customer.verificationStatus || "unverified"
                    }">${customer.verificationStatus || "Unverified"}</span></p>
                    <p><strong>Government ID:</strong> ${
                      customer.govId ? "Uploaded" : "Not uploaded"
                    }</p>
                    <p><strong>Selfie Verification:</strong> ${
                      customer.selfieVerification ? "Uploaded" : "Not uploaded"
                    }</p>
                </div>
                
                <div class="info-group">
                    <h4>Order Statistics</h4>
                    <p><strong>Total Orders:</strong> ${
                      customerOrders.length
                    }</p>
                    <p><strong>Total Spent:</strong> ₱${totalSpent.toFixed(
                      2
                    )}</p>
                    <p><strong>Average Order:</strong> ₱${
                      customerOrders.length
                        ? (totalSpent / customerOrders.length).toFixed(2)
                        : "0.00"
                    }</p>
                    <p><strong>First Order:</strong> ${
                      customerOrders.length
                        ? new Date(customerOrders[0].date).toLocaleDateString()
                        : "N/A"
                    }</p>
                </div>
            </div>
            
            <div class="customer-orders">
                <h4>Recent Orders</h4>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              customerOrders.length
                                ? customerOrders
                                    .slice(-5)
                                    .map(
                                      (order) => `
                                <tr>
                                    <td>${order.id}</td>
                                    <td>${new Date(
                                      order.date
                                    ).toLocaleDateString()}</td>
                                    <td>${order.items.length} items</td>
                                    <td>₱${order.total.toFixed(2)}</td>
                                    <td><span class="status-badge ${
                                      order.status
                                    }">${order.status}</span></td>
                                </tr>
                            `
                                    )
                                    .join("")
                                : '<tr><td colspan="5" class="no-data">No orders found</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    // Set up edit button
    document.getElementById("editCustomerBtn").onclick = () => {
      this.closeModal("customerDetailsModal");
      this.editCustomer(customerId);
    };

    this.showModal("customerDetailsModal");
  }

  async deleteCustomer(customerId) {
    if (confirm("Are you sure you want to delete this customer?")) {
      if (this.usingSupabase()) {
        try {
          await window.sb.from("customers").delete().eq("id", customerId);
          await this.fetchCustomersFromDB();
          this.displayCustomers(this.customers);
          this.updateStats();
          this.showNotification("Customer deleted successfully!", "success");
        } catch (err) {
          console.error("[Supabase] delete customer error", err);
          this.showNotification(
            "Database error while deleting customer",
            "error"
          );
        }
        return;
      }
      this.customers = this.customers.filter((c) => c.id !== customerId);
      this.saveCustomers();
      this.loadCustomersData();
      this.updateStats();
      this.showNotification("Customer deleted successfully!", "success");
    }
  }

  // Orders Management - Enhanced
  loadOrdersData() {
    if (this.usingSupabase()) {
      this.fetchOrdersFromDB().finally(() => {
        console.log("[v0] Orders loaded from DB:", this.orders.length);
        this.filterOrders();
      });
      return;
    }
    this.filterOrders();
  }

  filterOrders() {
    const filter = document.getElementById("orderStatusFilter").value;
    let filteredOrders = this.orders;

    if (filter !== "all") {
      filteredOrders = this.orders.filter((order) => order.status === filter);
    }

    const tbody = document.getElementById("ordersTableBody");

    if (filteredOrders.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="no-data">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = filteredOrders
      .map((order) => {
        const verificationStatus = this.getCustomerVerificationStatus(
          order.customer
        );
        return `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer.name}</td>
                    <td>${order.customer.address.substring(0, 20)}...</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.items.length} items</td>
                    <td>₱${order.total.toFixed(2)}</td>
                    <td><span class="status-badge ${order.status}">${
          order.status
        }</span></td>
                    <td>
                        <div class="verification-status">
                            <div class="verification-indicator ${
                              verificationStatus.class
                            }"></div>
                            <span>${verificationStatus.text}</span>
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn view" onclick="adminDashboard.viewOrder('${
                              order.id
                            }')">View</button>
                            <button class="table-btn verify" onclick="adminDashboard.viewCustomerVerification('${
                              order.customer.email
                            }')">Verify</button>
                            <button class="table-btn edit" onclick="adminDashboard.updateOrderStatus('${
                              order.id
                            }')">Update</button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  viewOrder(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const content = document.getElementById("orderDetailsContent");
    content.innerHTML = `
            <div class="order-info">
                <div class="info-group">
                    <h4>Order Information</h4>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Date:</strong> ${new Date(
                      order.date
                    ).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${
                      order.status
                    }">${order.status}</span></p>
                    <p><strong>Total:</strong> ₱${order.total.toFixed(2)}</p>
                </div>
                
                <div class="info-group">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customer.name}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Complete Address:</strong> ${
                      order.customer.address
                    }</p>
                    <p><strong>Barangay:</strong> ${
                      order.customer.barangay || "N/A"
                    }</p>
                    <p><strong>Age:</strong> ${order.customer.age || "N/A"}</p>
                    <p><strong>Gender:</strong> ${
                      order.customer.gender || "N/A"
                    }</p>
                </div>
                
                <div class="info-group">
                    <h4>Delivery Information</h4>
                    <p><strong>Method:</strong> ${order.delivery.method}</p>
                    <p><strong>Fee:</strong> ₱${order.delivery.fee.toFixed(
                      2
                    )}</p>
                    <p><strong>Estimated Date:</strong> ${
                      order.delivery.estimatedDate
                    }</p>
                </div>
                
                <div class="info-group">
                    <h4>Payment Information</h4>
                    <p><strong>Method:</strong> ${order.payment.method}</p>
                    <p><strong>Type:</strong> ${
                      order.payment.paymentType || "N/A"
                    }</p>
                </div>

                <div class="info-group">
                    <h4>Customer Verification</h4>
                    <p><strong>Government ID:</strong> ${
                      order.customer.govId ? "Available" : "Not uploaded"
                    }</p>
                    <p><strong>Selfie Verification:</strong> ${
                      order.customer.selfieVerification
                        ? "Available"
                        : "Not uploaded"
                    }</p>
                    <p><strong>Status:</strong> <span class="status-badge ${
                      order.customer.verificationStatus || "unverified"
                    }">${
      order.customer.verificationStatus || "Unverified"
    }</span></p>
                    ${
                      order.customer.govId && order.customer.selfieVerification
                        ? `<button class="secondary-btn" onclick="adminDashboard.viewCustomerVerification('${order.customer.email}')" style="margin-top: 10px;">View Documents</button>`
                        : ""
                    }
                </div>

                <div class="info-group">
                    <h4>Invoice Status</h4>
                    <p><strong>Pre-Invoice:</strong> ${
                      order.hasPreInvoice ? "Generated" : "Not generated"
                    }</p>
                    <p><strong>Real Invoice:</strong> ${
                      order.hasRealInvoice ? "Generated" : "Not generated"
                    }</p>
                </div>
            </div>
            
            ${
              order.pickup || order.dropoff
                ? `
                <div class="pickup-dropoff-details">
                    ${
                      order.pickup
                        ? `
                        <div class="pickup-details">
                            <h4>Pickup Information</h4>
                            <p><strong>Name:</strong> ${order.pickup.firstName}</p>
                            <p><strong>Phone:</strong> ${order.pickup.phone}</p>
                            <p><strong>Address:</strong> ${order.pickup.address}</p>
                            <p><strong>Barangay:</strong> ${order.pickup.barangay}</p>
                            <p><strong>Gender:</strong> ${order.pickup.gender}</p>
                            <p><strong>Age:</strong> ${order.pickup.age}</p>
                            <p><strong>Gov ID:</strong> ${order.pickup.govId}</p>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      order.dropoff
                        ? `
                        <div class="dropoff-details">
                            <h4>Drop-off Information</h4>
                            <p><strong>Name:</strong> ${order.dropoff.firstName}</p>
                            <p><strong>Phone:</strong> ${order.dropoff.phone}</p>
                            <p><strong>Address:</strong> ${order.dropoff.address}</p>
                            <p><strong>Barangay:</strong> ${order.dropoff.barangay}</p>
                            <p><strong>Gender:</strong> ${order.dropoff.gender}</p>
                            <p><strong>Age:</strong> ${order.dropoff.age}</p>
                            <p><strong>Gov ID:</strong> ${order.dropoff.govId}</p>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }
            
            <div class="order-items">
                <h4>Order Items</h4>
                <div class="item-list">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="item-row">
                            <div class="item-image">
                                <img src="${
                                  item.image
                                }" alt="Product image for ${
                          item.name
                        } in size ${
                          item.size
                        }" onerror="this.src='https://placeholder-image-service.onrender.com/image/50x50?prompt=Product image&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d'">
                            </div>
                            <div class="item-info">
                                <h5>${item.name}</h5>
                                <p>Size: ${item.size} | Quantity: ${
                          item.quantity
                        }</p>
                            </div>
                            <div class="item-price">₱${(
                              item.price * item.quantity
                            ).toFixed(2)}</div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;

    // Show/hide invoice generation buttons based on order status and method
    const generatePreInvoiceBtn = document.getElementById(
      "generatePreInvoiceBtn"
    );
    const generateRealInvoiceBtn = document.getElementById(
      "generateRealInvoiceBtn"
    );

    if (order.delivery.method === "pickup" && !order.hasPreInvoice) {
      generatePreInvoiceBtn.style.display = "block";
      generatePreInvoiceBtn.onclick = () => this.generatePreInvoice(orderId);
    } else {
      generatePreInvoiceBtn.style.display = "none";
    }

    if (order.status === "completed" && !order.hasRealInvoice) {
      generateRealInvoiceBtn.style.display = "block";
      generateRealInvoiceBtn.onclick = () => this.generateRealInvoice(orderId);
    } else {
      generateRealInvoiceBtn.style.display = "none";
    }

    this.showModal("orderModal");
  }

  async updateOrderStatus(orderId) {
    const newStatus = prompt(
      "Enter new status (pending, processing, completed, cancelled):"
    );
    const validStatuses = ["pending", "processing", "completed", "cancelled"];

    if (newStatus && validStatuses.includes(newStatus.toLowerCase())) {
      const order = this.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = newStatus.toLowerCase();
        if (this.usingSupabase()) {
          try {
            await window.sb
              .from("orders")
              .update({ status: order.status })
              .eq("id", orderId);
          } catch (err) {
            console.error("[Supabase] update order status error", err);
          }
        } else {
          this.saveOrders();
        }
        this.loadOrdersData();
        this.showNotification("Order status updated successfully!", "success");

        // Notify admin if reseller updated order
        if (this.currentUser.role === "reseller") {
          this.addNotification(
            "Order Status Updated",
            `Reseller ${this.currentUser.username} updated order ${orderId} to ${newStatus}`,
            "head_admin"
          );
        }
      }
    } else if (newStatus) {
      this.showNotification(
        "Invalid status. Use: pending, processing, completed, or cancelled",
        "error"
      );
    }
  }

  // Invoice Management System
  loadInvoicesData() {
    if (this.usingSupabase()) {
      this.fetchInvoicesFromDB().finally(() => this.filterInvoices());
      return;
    }
    this.filterInvoices();
  }

  filterInvoices() {
    const filter = document.getElementById("invoiceTypeFilter").value;
    let filteredInvoices = this.invoices;

    if (filter !== "all") {
      filteredInvoices = this.invoices.filter(
        (invoice) => invoice.type === filter
      );
    }

    const tbody = document.getElementById("invoicesTableBody");

    if (filteredInvoices.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="no-data">No invoices found</td></tr>';
      return;
    }

    tbody.innerHTML = filteredInvoices
      .map(
        (invoice) => `
            <tr>
                <td>${invoice.id}</td>
                <td>${invoice.orderId}</td>
                <td><span class="status-badge ${invoice.type}">${
          invoice.type === "pre" ? "Pre-Invoice" : "Real Invoice"
        }</span></td>
                <td>${invoice.customerName}</td>
                <td>₱${invoice.amount.toFixed(2)}</td>
                <td><span class="status-badge ${invoice.status}">${
          invoice.status
        }</span></td>
                <td>${new Date(invoice.dateCreated).toLocaleDateString()}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view" onclick="adminDashboard.viewInvoice('${
                          invoice.id
                        }')">View</button>
                        <button class="table-btn print" onclick="adminDashboard.printInvoice('${
                          invoice.id
                        }')">Print</button>
                        ${
                          invoice.type === "pre"
                            ? `<button class="table-btn verify" onclick="adminDashboard.verifyWithPreInvoice('${invoice.id}')">Verify</button>`
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  async generatePreInvoice(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const preInvoice = {
      id: `PRE_${Date.now()}`,
      orderId: orderId,
      type: "pre",
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerAddress: order.customer.address,
      items: order.items,
      amount: order.total,
      status: "generated",
      dateCreated: new Date().toISOString(),
      createdBy: this.currentUser.username,
    };

    if (this.usingSupabase()) {
      try {
        await window.sb.from("invoices").insert({
          order_id: orderId,
          type: "pre",
          amount: order.total,
          status: "generated",
          customer_name: order.customer.name,
          customer_email: order.customer.email,
          customer_phone: order.customer.phone,
          customer_address: order.customer.address,
          items: order.items,
        });
        await window.sb
          .from("orders")
          .update({ has_pre_invoice: true })
          .eq("id", orderId);
      } catch (err) {
        console.error("[Supabase] generate pre-invoice error", err);
        this.showNotification(
          "Database error while generating pre-invoice",
          "error"
        );
        return;
      }
    } else {
      this.invoices.push(preInvoice);
      // Update order
      order.hasPreInvoice = true;
      order.preInvoiceId = preInvoice.id;
      this.saveInvoices();
      this.saveOrders();
    }

    this.showNotification("Pre-invoice generated successfully!", "success");
    this.closeModal("orderModal");
  }

  async generateRealInvoice(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const realInvoice = {
      id: `REAL_${Date.now()}`,
      orderId: orderId,
      type: "real",
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerAddress: order.customer.address,
      items: order.items,
      amount: order.total,
      status: "generated",
      dateCreated: new Date().toISOString(),
      createdBy: this.currentUser.username,
    };

    if (this.usingSupabase()) {
      try {
        await window.sb.from("invoices").insert({
          order_id: orderId,
          type: "real",
          amount: order.total,
          status: "generated",
          customer_name: order.customer.name,
          customer_email: order.customer.email,
          customer_phone: order.customer.phone,
          customer_address: order.customer.address,
          items: order.items,
        });
        await window.sb
          .from("orders")
          .update({ has_real_invoice: true })
          .eq("id", orderId);
      } catch (err) {
        console.error("[Supabase] generate real invoice error", err);
        this.showNotification(
          "Database error while generating invoice",
          "error"
        );
        return;
      }
    } else {
      this.invoices.push(realInvoice);
      // Update order
      order.hasRealInvoice = true;
      order.realInvoiceId = realInvoice.id;
      this.saveInvoices();
      this.saveOrders();
    }

    this.showNotification("Real invoice generated successfully!", "success");
    this.closeModal("orderModal");
  }

  viewInvoice(invoiceId) {
    const invoice = this.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      this.showNotification("Invoice not found", "error");
      return;
    }

    const content = document.getElementById("invoiceDetailsContent");
    content.innerHTML = `
    <div class="invoice-info">
      <div class="info-group">
        <h4>Invoice Information</h4>
        <p><strong>Invoice ID:</strong> ${invoice.id}</p>
        <p><strong>Order ID:</strong> ${invoice.orderId}</p>
        <p><strong>Type:</strong> ${
          invoice.type === "pre" ? "Pre-Invoice" : "Real Invoice"
        }</p>
        <p><strong>Status:</strong> <span class="status-badge ${
          invoice.status
        }">${invoice.status}</span></p>
        <p><strong>Date Created:</strong> ${new Date(
          invoice.dateCreated
        ).toLocaleDateString()}</p>
      </div>
      
      <div class="info-group">
        <h4>Customer Information</h4>
        <p><strong>Name:</strong> ${invoice.customerName}</p>
        <p><strong>Email:</strong> ${invoice.customerEmail}</p>
        <p><strong>Phone:</strong> ${invoice.customerPhone}</p>
        <p><strong>Address:</strong> ${invoice.customerAddress}</p>
      </div>
      
      <div class="info-group">
        <h4>Invoice Items</h4>
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || [])
              .map(
                (item) => `
              <tr>
                <td>${item.name || "N/A"}</td>
                <td>${item.quantity || 1}</td>
                <td>₱${(item.price || 0).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="info-group">
        <h4>Amount</h4>
        <p><strong>Total:</strong> ₱${invoice.amount.toFixed(2)}</p>
      </div>
    </div>
  `;

    this.showModal("invoiceModal");
  }

  printInvoice(invoiceId) {
    const invoice = this.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      this.showNotification("Invoice not found", "error");
      return;
    }

    const printWindow = window.open("", "_blank");
    const itemsHTML = (invoice.items || [])
      .map(
        (item) => `
    <tr>
      <td>${item.name || "N/A"}</td>
      <td>${item.quantity || 1}</td>
      <td>₱${(item.price || 0).toFixed(2)}</td>
    </tr>
  `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .invoice-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .invoice-info { margin-bottom: 20px; }
          .info-group { margin-bottom: 20px; }
          .info-group h4 { color: #333; margin-bottom: 10px; font-size: 16px; }
          .info-group p { margin-bottom: 5px; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: bold; color: #333; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h2 class="invoice-title">${
            invoice.type === "pre" ? "PRE-INVOICE" : "INVOICE"
          }</h2>
        </div>
        
        <div class="invoice-info">
          <div class="info-group">
            <h4>Invoice Details</h4>
            <p><strong>Invoice ID:</strong> ${invoice.id}</p>
            <p><strong>Order ID:</strong> ${invoice.orderId}</p>
            <p><strong>Date:</strong> ${new Date(
              invoice.dateCreated
            ).toLocaleDateString()}</p>
          </div>
          
          <div class="info-group">
            <h4>Customer</h4>
            <p><strong>Name:</strong> ${invoice.customerName}</p>
            <p><strong>Email:</strong> ${invoice.customerEmail}</p>
            <p><strong>Phone:</strong> ${invoice.customerPhone}</p>
          </div>
          
          <div class="info-group">
            <h4>Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>
          
          <div class="total">
            Total: ₱${invoice.amount.toFixed(2)}
          </div>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  showInvoiceVerification(preInvoiceId) {
    const preInvoice = this.invoices.find((i) => i.id === preInvoiceId);
    if (!preInvoice) return;

    const order = this.orders.find((o) => o.id === preInvoice.orderId);
    const realInvoice = this.invoices.find(
      (i) => i.orderId === preInvoice.orderId && i.type === "real"
    );

    const content = document.getElementById("invoiceVerificationContent");
    content.innerHTML = `
            <div class="invoice-comparison">
                <div class="comparison-section">
                    <h4>Pre-Invoice (Customer Reference)</h4>
                    <div class="comparison-item">
                        <span>Invoice ID:</span>
                        <span>${preInvoice.id}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                    <div class="comparison-item">
                        <span>Order ID:</span>
                        <span>${preInvoice.orderId}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                    <div class="comparison-item">
                        <span>Customer:</span>
                        <span>${preInvoice.customerName}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                    <div class="comparison-item">
                        <span>Total Amount:</span>
                        <span>₱${preInvoice.amount.toFixed(2)}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                    <div class="comparison-item">
                        <span>Items Count:</span>
                        <span>${preInvoice.items.length}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                </div>
                
                <div class="comparison-section">
                    <h4>System Record</h4>
                    <div class="comparison-item">
                        <span>Order Status:</span>
                        <span>${order ? order.status : "Not found"}</span>
                        <span class="comparison-${
                          order ? "match" : "mismatch"
                        }">${order ? "✓" : "✗"}</span>
                    </div>
                    <div class="comparison-item">
                        <span>Customer Email:</span>
                        <span>${order ? order.customer.email : "N/A"}</span>
                        <span class="comparison-match">✓</span>
                    </div>
                    <div class="comparison-item">
                        <span>Real Invoice:</span>
                        <span>${
                          realInvoice ? "Generated" : "Not generated"
                        }</span>
                        <span class="comparison-${
                          realInvoice ? "match" : "mismatch"
                        }">${realInvoice ? "✓" : "✗"}</span>
                    </div>
                    <div class="comparison-item">
                        <span>Verification:</span>
                        <span>${
                          preInvoice.verified ? "Verified" : "Pending"
                        }</span>
                        <span class="comparison-${
                          preInvoice.verified ? "match" : "mismatch"
                        }">${preInvoice.verified ? "✓" : "✗"}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border: 1px solid #4caf50; border-radius: 5px;">
                <h4>Verification Instructions:</h4>
                <p>1. Verify the customer presents the exact pre-invoice shown above</p>
                <p>2. Check customer ID matches the invoice details</p>
                <p>3. Confirm order items match the pre-invoice</p>
                <p>4. Mark as verified once all details are confirmed</p>
            </div>
        `;

    this.closeModal("invoiceModal");
    this.showModal("invoiceVerificationModal");
  }

  markInvoiceVerified() {
    // This would be implemented to mark the pre-invoice as verified
    this.showNotification("Invoice marked as verified!", "success");
    this.closeModal("invoiceVerificationModal");
  }

  verifyWithPreInvoice(preInvoiceId) {
    this.showInvoiceVerification(preInvoiceId);
  }

  // Continue with existing methods (Members, Inventory, Requests, Reports, etc.)
  // [The rest of the code continues with all existing methods...]

  // Members Management
  loadMembersData() {
    if (this.usingSupabase()) {
      this.fetchMembersFromDB().finally(() => {
        this.updateMemberStats();
        this.displayMembers();
      });
      return;
    }
    this.updateMemberStats();
    this.displayMembers();
  }

  updateMemberStats() {
    const headAdmins = this.members.filter((m) => m.role === "head_admin");
    const resellers = this.members.filter((m) => m.role === "reseller");

    document.getElementById("headAdminCount").textContent = headAdmins.length;
    document.getElementById("resellerCount").textContent = resellers.length;
  }

  displayMembers() {
    const tbody = document.getElementById("membersTableBody");

    tbody.innerHTML = this.members
      .map(
        (member) => `
            <tr>
                <td>${member.id}</td>
                <td>${member.username}</td>
                <td><span class="status-badge ${
                  member.role === "head_admin" ? "completed" : "pending"
                }">${
          member.role === "head_admin" ? "Head Admin" : "Reseller"
        }</span></td>
                <td><span class="status-badge ${member.status}">${
          member.status
        }</span></td>
                <td>${new Date(member.createdDate).toLocaleDateString()}</td>
                <td>${
                  member.lastLogin
                    ? new Date(member.lastLogin).toLocaleDateString()
                    : "Never"
                }</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit" onclick="adminDashboard.editMember('${
                          member.id
                        }')">Edit</button>
                        <button class="table-btn delete" onclick="adminDashboard.deleteMember('${
                          member.id
                        }')">Delete</button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  showAddMemberModal() {
    document.getElementById("memberModalTitle").textContent = "Add Member";
    document.getElementById("memberForm").reset();
    document.getElementById("memberForm").dataset.editId = "";
    document.getElementById("headAdminWarning").style.display = "none";
    this.showModal("memberModal");
  }

  editMember(memberId) {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) return;

    document.getElementById("memberModalTitle").textContent = "Edit Member";
    document.getElementById("memberUsername").value = member.username;
    document.getElementById("memberPassword").value = member.password;
    document.getElementById("memberRole").value = member.role;
    document.getElementById("memberForm").dataset.editId = memberId;

    this.showModal("memberModal");
  }

  checkHeadAdminLimit() {
    const role = document.getElementById("memberRole").value;
    const editId = document.getElementById("memberForm").dataset.editId;
    const warning = document.getElementById("headAdminWarning");

    if (role === "head_admin") {
      const currentHeadAdmins = this.members.filter(
        (m) => m.role === "head_admin"
      );
      const isEditing =
        editId &&
        this.members.find((m) => m.id === editId && m.role === "head_admin");

      if (currentHeadAdmins.length >= 2 && !isEditing) {
        warning.style.display = "block";
      } else {
        warning.style.display = "none";
      }
    } else {
      warning.style.display = "none";
    }
  }

  async handleMemberSubmit(e) {
    e.preventDefault();

    const username = document.getElementById("memberUsername").value;
    const password = document.getElementById("memberPassword").value;
    const role = document.getElementById("memberRole").value;
    const editId = e.target.dataset.editId;

    // Validate head admin limit
    if (role === "head_admin") {
      const currentHeadAdmins = this.members.filter(
        (m) => m.role === "head_admin"
      );
      const isEditing =
        editId &&
        this.members.find((m) => m.id === editId && m.role === "head_admin");

      if (currentHeadAdmins.length >= 2 && !isEditing) {
        this.showNotification("Maximum 2 Head Admins allowed!", "error");
        return;
      }
    }

    // Check for duplicate username
    const existingMember = this.members.find(
      (m) => m.username === username && m.id !== editId
    );
    if (existingMember) {
      this.showNotification("Username already exists!", "error");
      return;
    }

    if (this.usingSupabase()) {
      try {
        if (editId) {
          await window.sb
            .from("members")
            .update({ username, password, role })
            .eq("id", editId);
          this.showNotification("Member updated successfully!", "success");
        } else {
          await window.sb
            .from("members")
            .insert({ username, password, role, status: "active" });
          this.showNotification("Member added successfully!", "success");
        }
        this.closeModal("memberModal");
        await this.fetchMembersFromDB();
        this.updateMemberStats();
        this.displayMembers();
      } catch (err) {
        console.error("[Supabase] upsert member error", err);
        this.showNotification("Database error while saving member", "error");
      }
      return;
    }

    if (editId) {
      // Update existing member
      const index = this.members.findIndex((m) => m.id === editId);
      if (index !== -1) {
        this.members[index] = {
          ...this.members[index],
          username,
          password,
          role,
        };
        this.showNotification("Member updated successfully!", "success");
      }
    } else {
      // Add new member
      const newMember = {
        id: `${role}_${Date.now()}`,
        username,
        password,
        role,
        status: "active",
        createdDate: new Date().toISOString(),
        lastLogin: null,
      };
      this.members.push(newMember);
      this.showNotification("Member added successfully!", "success");
    }

    this.saveMembers();
    this.closeModal("memberModal");
    this.loadMembersData();
  }

  async deleteMember(memberId) {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) return;

    // Prevent deleting current user
    if (member.id === this.currentUser.id) {
      this.showNotification("Cannot delete current user!", "error");
      return;
    }

    if (
      confirm(`Are you sure you want to delete member "${member.username}"?`)
    ) {
      if (this.usingSupabase()) {
        try {
          await window.sb.from("members").delete().eq("id", memberId);
          await this.fetchMembersFromDB();
          this.updateMemberStats();
          this.displayMembers();
          this.showNotification("Member deleted successfully!", "success");
        } catch (err) {
          console.error("[Supabase] delete member error", err);
          this.showNotification(
            "Database error while deleting member",
            "error"
          );
        }
        return;
      }
      this.members = this.members.filter((m) => m.id !== memberId);
      this.saveMembers();
      this.loadMembersData();
      this.showNotification("Member deleted successfully!", "success");
    }
  }

  // Inventory Management
  loadInventoryData() {
    const grid = document.getElementById("inventoryGrid");

    grid.innerHTML = this.products
      .map((product) => {
        const stock = product.stock || 0;
        let stockStatus = "in-stock";
        let stockLabel = "In Stock";

        if (stock === 0) {
          stockStatus = "out-of-stock";
          stockLabel = "Out of Stock";
        } else if (stock <= 10) {
          stockStatus = "low-stock";
          stockLabel = "Low Stock";
        }

        return `
                <div class="inventory-card ${stockStatus}">
                    <div class="inventory-header">
                        <div class="inventory-info">
                            <h3>${product.name}</h3>
                            <p>₱${product.price.toFixed(2)}</p>
                        </div>
                        <span class="stock-badge ${stockStatus}">${stockLabel}</span>
                    </div>
                    
                    <div class="stock-details">
                        <div class="stock-item">
                            <span>Current Stock</span>
                            <strong>${stock}</strong>
                        </div>
                        <div class="stock-item">
                            <span>Sold This Month</span>
                            <strong>${Math.floor(Math.random() * 20)}</strong>
                        </div>
                        <div class="stock-item">
                            <span>Category</span>
                            <strong>${product.category}</strong>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  showStockModal() {
    const select = document.getElementById("stockProductId");
    select.innerHTML =
      '<option value="">Select Product</option>' +
      this.products
        .map(
          (product) => `<option value="${product.id}">${product.name}</option>`
        )
        .join("");

    this.showModal("stockModal");
  }

  updateCurrentStock() {
    const productId = document.getElementById("stockProductId").value;
    const currentStockInput = document.getElementById("currentStock");
    const newStockInput = document.getElementById("newStock");

    if (productId) {
      const product = this.products.find((p) => p.id == productId);
      if (product) {
        currentStockInput.value = product.stock || 0;
        newStockInput.value = product.stock || 0;
      }
    } else {
      currentStockInput.value = "";
      newStockInput.value = "";
    }
  }

  async handleStockSubmit(e) {
    e.preventDefault();

    const productIdStr = document.getElementById("stockProductId").value;
    const newStock = Number.parseInt(document.getElementById("newStock").value);

    if (this.usingSupabase()) {
      try {
        await window.sb
          .from("products")
          .update({ stock: newStock })
          .eq("id", Number(productIdStr));
        this.closeModal("stockModal");
        await this.fetchProductsFromDB();
        this.loadInventoryData();
        this.showNotification("Stock updated successfully!", "success");
      } catch (err) {
        console.error("[Supabase] update stock error", err);
        this.showNotification("Database error while updating stock", "error");
      }
      return;
    }

    const product = this.products.find((p) => p.id == productIdStr);
    if (product) {
      product.stock = newStock;
      this.saveProducts();
      this.closeModal("stockModal");
      this.loadInventoryData();
      this.showNotification("Stock updated successfully!", "success");
    }
  }

  // Requests Management
  loadRequestsData() {
    const isHeadAdmin = this.currentUser.role === "head_admin";

    if (this.usingSupabase()) {
      Promise.all([
        this.fetchStockRequestsFromDB(),
        this.fetchReportRequestsFromDB(),
      ]).finally(() => {
        this._renderRequestsViews(isHeadAdmin);
      });
      return;
    }

    this._renderRequestsViews(isHeadAdmin);
  }

  _renderRequestsViews(isHeadAdmin) {
    if (isHeadAdmin) {
      this.loadAdminRequestsView();
    } else {
      this.loadResellerRequestsView();
    }

    // Update UI based on role
    document.getElementById("requestsTitle").textContent = isHeadAdmin
      ? "All Requests"
      : "My Requests"; // FIX 3: RESELLER REPORTING - Changed to "My Requests" for resellers

    // FIX 3: RESELLER REPORTING - Show stock request button for reseller, report request button for head admin
    document.getElementById("newRequestBtn").style.display = isHeadAdmin
      ? "none"
      : "block";
    document.getElementById("requestReportBtn").style.display = isHeadAdmin
      ? "block"
      : "none";

    // Hide forms initially
    document.getElementById("stockRequestForm").style.display = "none";
    document.getElementById("reportRequestForm").style.display = "none";

    if (isHeadAdmin) {
      this.loadAdminRequestsView();
    } else {
      this.loadResellerRequestsView();
    }
  }

  loadAdminRequestsView() {
    // Load all requests for head admin
    const headerRow = document.getElementById("requestsTableHeader");
    const tbody = document.getElementById("requestsTableBody");

    headerRow.innerHTML = `
            <th>Request ID</th>
            <th>Type</th>
            <th>Requested By</th>
            <th>Product/Details</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
        `;

    const allRequests = [
      ...this.stockRequests.map((req) => ({ ...req, type: "stock" })),
      ...this.reportRequests.map((req) => ({ ...req, type: "report" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allRequests.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="no-data">No requests found</td></tr>';
      return;
    }

    tbody.innerHTML = allRequests
      .map(
        (request) => `
            <tr>
                <td>${request.id}</td>
                <td><span class="status-badge ${
                  request.type === "stock" ? "pending" : "processing"
                }">${request.type}</span></td>
                <td>${request.requestedBy}</td>
                <td>${
                  request.type === "stock"
                    ? `${request.productName} (${request.quantity})`
                    : `${request.reportType} Report`
                }</td>
                <td>${new Date(request.date).toLocaleDateString()}</td>
                <td><span class="status-badge ${request.status}">${
          request.status
        }</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view" onclick="adminDashboard.viewRequest('${
                          request.id
                        }', '${request.type}')">View</button>
                        ${
                          request.status === "pending"
                            ? `
                            <button class="table-btn approve" onclick="adminDashboard.approveRequest('${request.id}', '${request.type}')">Approve</button>
                            <button class="table-btn reject" onclick="adminDashboard.rejectRequest('${request.id}', '${request.type}')">Reject</button>
                        `
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  loadResellerRequestsView() {
    // Load reseller's stock requests only
    const headerRow = document.getElementById("requestsTableHeader");
    const tbody = document.getElementById("requestsTableBody");

    headerRow.innerHTML = `
      <th>Request ID</th>
      <th>Product</th>
      <th>Quantity</th>
      <th>Date</th>
      <th>Status</th>
      <th>Actions</th>
    `;

    // FIX 1: RESELLER ORDERS - Filter by requestedBy username to show reseller's own requests
    const myRequests = this.stockRequests.filter(
      (req) => req.requestedBy === this.currentUser.username
    );

    if (myRequests.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="no-data">No stock requests found</td></tr>';
      return;
    }

    tbody.innerHTML = myRequests
      .map(
        (request) => `
      <tr>
        <td>${request.id}</td>
        <td>${request.productName}</td>
        <td>${request.quantity}</td>
        <td>${new Date(request.date).toLocaleDateString()}</td>
        <td><span class="status-badge ${request.status}">${
          request.status
        }</span></td>
        <td>
          <div class="table-actions">
            <button class="table-btn view" onclick="adminDashboard.viewRequest('${
              request.id
            }', 'stock')">View</button>
            ${
              request.status === "pending"
                ? `<button class="table-btn delete" onclick="adminDashboard.cancelRequest('${request.id}')">Cancel</button>`
                : ""
            }
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  showStockRequestForm() {
    // Populate product dropdown
    const select = document.getElementById("requestProductId");
    select.innerHTML =
      '<option value="">Select Product</option>' +
      this.products
        .map(
          (product) =>
            `<option value="${product.id}" data-name="${product.name}">${
              product.name
            } (Stock: ${product.stock || 0})</option>`
        )
        .join("");

    document.getElementById("stockRequestForm").style.display = "block";
    document.getElementById("requestsTable").style.display = "none";
  }

  showReportRequestForm() {
    // Populate reseller dropdown
    const select = document.getElementById("reportResellerId");
    const resellers = this.members.filter(
      (m) => m.role === "reseller" && m.status === "active"
    );

    select.innerHTML =
      '<option value="">Select Reseller</option>' +
      resellers
        .map(
          (reseller) =>
            `<option value="${reseller.id}" data-name="${reseller.username}">${reseller.username}</option>`
        )
        .join("");

    // Set default date range (last 30 days)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);

    document.getElementById("reportDateFrom").value = lastMonth
      .toISOString()
      .split("T")[0];
    document.getElementById("reportDateTo").value = today
      .toISOString()
      .split("T")[0];

    document.getElementById("reportRequestForm").style.display = "block";
    document.getElementById("requestsTable").style.display = "none";
  }

  async handleStockRequestSubmit(e) {
    e.preventDefault();

    const productSelect = document.getElementById("requestProductId");
    const productId = productSelect.value;
    const productName = productSelect.selectedOptions[0]?.dataset.name;
    const quantity = Number.parseInt(
      document.getElementById("requestQuantity").value
    );
    const reason = document.getElementById("requestReason").value;

    if (!productId || !quantity) {
      this.showNotification("Please fill in all required fields", "error");
      return;
    }

    const stockRequest = {
      id: `SR_${Date.now()}`,
      productId: productId,
      productName: productName,
      quantity: quantity,
      reason: reason,
      requestedBy: this.currentUser.username,
      status: "pending",
      date: new Date().toISOString(),
    };

    if (this.usingSupabase()) {
      try {
        await window.sb.from("stock_requests").insert({
          product_id: Number(productId),
          product_name: productName,
          quantity: quantity,
          reason: reason,
          requested_by: this.currentUser.username,
          status: "pending",
        });
      } catch (err) {
        console.error("[Supabase] insert stock request error", err);
        this.showNotification(
          "Database error while submitting request",
          "error"
        );
        return;
      }
    } else {
      // FIX 2: STOCK REQUEST PERSISTENCE - Add to local array and save immediately
      this.stockRequests.push(stockRequest);
      this.saveStockRequests();
    }

    // FIX 3: RESELLER REPORTING - Changed addNotification target role for consistency
    // Add notification for admin
    this.addNotification(
      "Stock Request",
      `${this.currentUser.username} requested ${quantity} units of ${productName}`,
      "head_admin" // Always notify head admin for stock requests
    );

    document.getElementById("stockRequestForm").style.display = "none";
    document.getElementById("requestsTable").style.display = "block";
    document.getElementById("stockRequestFormSubmit").reset();

    this.loadRequestsData();
    this.showNotification("Stock request submitted successfully!", "success");
  }

  async handleReportRequestSubmit(e) {
    e.preventDefault();

    const resellerSelect = document.getElementById("reportResellerId");
    const resellerId = resellerSelect.value;
    const resellerName = resellerSelect.selectedOptions[0]?.dataset.name;
    const reportType = document.getElementById("reportType").value;
    const dateFrom = document.getElementById("reportDateFrom").value;
    const dateTo = document.getElementById("reportDateTo").value;
    const notes = document.getElementById("reportRequestNotes").value;

    if (!resellerId || !reportType || !dateFrom || !dateTo) {
      this.showNotification("Please fill in all required fields", "error");
      return;
    }

    const reportRequest = {
      id: `RR_${Date.now()}`,
      resellerId: resellerId,
      resellerName: resellerName,
      reportType: reportType,
      dateFrom: dateFrom,
      dateTo: dateTo,
      notes: notes,
      requestedBy: this.currentUser.username,
      status: "pending",
      date: new Date().toISOString(),
    };

    if (this.usingSupabase()) {
      try {
        await window.sb.from("report_requests").insert({
          reseller_id: resellerId ? Number(resellerId) : null,
          reseller_name: resellerName,
          report_type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
          notes: notes,
          requested_by: this.currentUser.username,
          status: "pending",
        });
      } catch (err) {
        console.error("[Supabase] insert report request error", err);
        this.showNotification(
          "Database error while sending report request",
          "error"
        );
        return;
      }
    } else {
      this.reportRequests.push(reportRequest);
      this.saveReportRequests();
    }

    // Add notification for reseller
    this.addNotification(
      "Report Request",
      `Head Admin requested a ${reportType} report for ${dateFrom} to ${dateTo}`,
      "reseller",
      resellerId
    );

    document.getElementById("reportRequestForm").style.display = "none";
    document.getElementById("requestsTable").style.display = "block";
    document.getElementById("reportRequestFormSubmit").reset();

    this.loadRequestsData();
    this.showNotification("Report request sent successfully!", "success");
  }

  cancelStockRequest() {
    document.getElementById("stockRequestForm").style.display = "none";
    document.getElementById("requestsTable").style.display = "block";
    document.getElementById("stockRequestFormSubmit").reset();
  }

  cancelReportRequest() {
    document.getElementById("reportRequestForm").style.display = "none";
    document.getElementById("requestsTable").style.display = "block";
    document.getElementById("reportRequestFormSubmit").reset();
  }

  viewRequest(requestId, type) {
    if (type === "stock") {
      const request = this.stockRequests.find((r) => r.id === requestId);
      if (!request) return;

      alert(`Stock Request Details:
            
Request ID: ${request.id}
Product: ${request.productName}
Quantity: ${request.quantity}
Requested by: ${request.requestedBy}
Date: ${new Date(request.date).toLocaleDateString()}
Status: ${request.status}
Reason: ${request.reason || "N/A"}`);
    } else {
      const request = this.reportRequests.find((r) => r.id === requestId);
      if (!request) return;

      alert(`Report Request Details:
            
Request ID: ${request.id}
Report Type: ${request.reportType}
Reseller: ${request.resellerName}
Date Range: ${request.dateFrom} to ${request.dateTo}
Requested by: ${request.requestedBy}
Date: ${new Date(request.date).toLocaleDateString()}
Status: ${request.status}
Notes: ${request.notes || "N/A"}`);
    }
  }

  approveRequest(requestId, type) {
    if (type === "stock") {
      const request = this.stockRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = "approved";
        this.saveStockRequests();

        // Update product stock
        const product = this.products.find((p) => p.id == request.productId);
        if (product) {
          product.stock = (product.stock || 0) + request.quantity;
          this.saveProducts();
        }

        // Notify reseller
        this.addNotification(
          "Stock Request Approved",
          `Your request for ${request.quantity} units of ${request.productName} has been approved`,
          "reseller",
          request.requestedBy
        );
      }
    } else {
      const request = this.reportRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = "approved";
        this.saveReportRequests();

        // Notify reseller
        this.addNotification(
          "Report Request Approved",
          `Please generate the ${request.reportType} report for ${request.dateFrom} to ${request.dateTo}`,
          "reseller",
          request.resellerId
        );
      }
    }

    this.loadRequestsData();
    this.showNotification("Request approved successfully!", "success");
  }

  rejectRequest(requestId, type) {
    const reason = prompt("Enter rejection reason (optional):");

    if (type === "stock") {
      const request = this.stockRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = "rejected";
        request.rejectionReason = reason;
        this.saveStockRequests();

        // Notify reseller
        this.addNotification(
          "Stock Request Rejected",
          `Your request for ${request.productName} has been rejected. ${
            reason ? "Reason: " + reason : ""
          }`,
          "reseller",
          request.requestedBy
        );
      }
    } else {
      const request = this.reportRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = "rejected";
        request.rejectionReason = reason;
        this.saveReportRequests();

        // Notify reseller
        this.addNotification(
          "Report Request Rejected",
          `The ${request.reportType} report request has been rejected. ${
            reason ? "Reason: " + reason : ""
          }`,
          "reseller",
          request.resellerId
        );
      }
    }

    this.loadRequestsData();
    this.showNotification("Request rejected successfully!", "success");
  }

  cancelRequest(requestId) {
    if (confirm("Are you sure you want to cancel this request?")) {
      this.stockRequests = this.stockRequests.filter((r) => r.id !== requestId);
      this.saveStockRequests();
      this.loadRequestsData();
      this.showNotification("Request cancelled successfully!", "success");
    }
  }

  // Reports Management
  loadReportsData() {
    const isReseller = this.currentUser.role === "reseller";

    if (this.usingSupabase()) {
      Promise.all([
        this.fetchReportsFromDB(),
        this.fetchReportRequestsFromDB(),
      ]).finally(() => {
        this._renderReportsViews(isReseller);
      });
      return;
    }

    this._renderReportsViews(isReseller);
  }

  _renderReportsViews(isReseller) {
    if (isReseller) {
      this.loadResellerReportsView();
    } else {
      this.loadAdminReportsView();
    }

    if (isReseller) {
      this.loadResellerReportsView();
    } else {
      this.loadAdminReportsView();
    }

    // Hide forms initially
    document.getElementById("reportGenerationForm").style.display = "none";
  }

  loadResellerReportsView() {
    // Show report requests for reseller
    const reportRequestsList = document.getElementById("reportRequestsList");
    const generateReportBtn = document.getElementById("generateReportBtn");

    reportRequestsList.style.display = "block";
    generateReportBtn.style.display = "none";

    const myReportRequests = this.reportRequests.filter(
      (req) =>
        req.resellerId === this.currentUser.id ||
        req.resellerName === this.currentUser.username
    );

    const tbody = document.getElementById("reportRequestsTableBody");

    if (myReportRequests.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="no-data">No report requests found</td></tr>';
      return;
    }

    tbody.innerHTML = myReportRequests
      .map(
        (request) => `
            <tr>
                <td>${request.id}</td>
                <td>${request.reportType}</td>
                <td>${request.dateFrom} to ${request.dateTo}</td>
                <td>${request.requestedBy}</td>
                <td>${new Date(request.date).toLocaleDateString()}</td>
                <td><span class="status-badge ${request.status}">${
          request.status
        }</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view" onclick="adminDashboard.viewRequest('${
                          request.id
                        }', 'report')">View</button>
                        ${
                          request.status === "approved"
                            ? `
                            <button class="table-btn generate" onclick="adminDashboard.generateReport('${request.id}')">Generate</button>
                        `
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `
      )
      .join("");

    // Load completed reports
    this.loadCompletedReports();
  }

  loadAdminReportsView() {
    // Hide report requests for admin, show completed reports only
    document.getElementById("reportRequestsList").style.display = "none";
    document.getElementById("generateReportBtn").style.display = "none";

    this.loadCompletedReports();
  }

  loadCompletedReports() {
    const tbody = document.getElementById("completedReportsTableBody");

    if (this.reports.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="no-data">No reports found</td></tr>';
      return;
    }

    tbody.innerHTML = this.reports
      .map(
        (report) => `
            <tr>
                <td>${report.id}</td>
                <td>${report.type}</td>
                <td>${report.dateFrom} to ${report.dateTo}</td>
                <td>${report.generatedBy}</td>
                <td>${new Date(report.dateGenerated).toLocaleDateString()}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view" onclick="adminDashboard.viewReport('${
                          report.id
                        }')">View</button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  generateReport(requestId) {
    const request = this.reportRequests.find((r) => r.id === requestId);
    if (!request) return;

    // Show report generation form
    document.getElementById(
      "reportFormTitle"
    ).textContent = `Generate ${request.reportType} Report`;
    document.getElementById("reportRequestId").value = requestId;
    document.getElementById("reportTypeDisplay").value = request.reportType;
    document.getElementById("reportFromDate").value = request.dateFrom;
    document.getElementById("reportToDate").value = request.dateTo;

    // Show relevant fields based on report type
    document.getElementById("pickupDropoffFields").style.display =
      request.reportType === "pickup_dropoff" ? "block" : "none";
    document.getElementById("salesReportFields").style.display =
      request.reportType === "sales" ? "block" : "none";
    document.getElementById("customerReportFields").style.display =
      request.reportType === "customer" ? "block" : "none";

    document.getElementById("reportGenerationForm").style.display = "block";
    document.getElementById("reportRequestsList").style.display = "none";
    document.getElementById("completedReportsList").style.display = "none";
  }

  async handleReportSubmit(e) {
    e.preventDefault();

    const requestId = document.getElementById("reportRequestId").value;
    const request = this.reportRequests.find((r) => r.id === requestId);

    if (!request) return;

    let reportData = {
      id: `RPT_${Date.now()}`,
      requestId: requestId,
      type: request.reportType,
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      generatedBy: this.currentUser.username,
      dateGenerated: new Date().toISOString(),
      notes: document.getElementById("reportNotes").value,
    };

    // Add type-specific data
    if (request.reportType === "pickup_dropoff") {
      reportData = {
        ...reportData,
        totalPickups: Number.parseInt(
          document.getElementById("totalPickups").value
        ),
        totalDropoffs: Number.parseInt(
          document.getElementById("totalDropoffs").value
        ),
        demographicsSummary: document.getElementById("demographicsSummary")
          .value,
        avgDeliveryTime: document.getElementById("avgDeliveryTime").value,
      };
    } else if (request.reportType === "sales") {
      reportData = {
        ...reportData,
        totalSalesAmount: Number.parseFloat(
          document.getElementById("totalSalesAmount").value
        ),
        totalOrdersCount: Number.parseInt(
          document.getElementById("totalOrdersCount").value
        ),
        topSellingProducts: document.getElementById("topSellingProducts").value,
      };
    } else if (request.reportType === "customer") {
      reportData = {
        ...reportData,
        newCustomersCount: Number.parseInt(
          document.getElementById("newCustomersCount").value
        ),
        returningCustomersCount: Number.parseInt(
          document.getElementById("returningCustomersCount").value
        ),
        customerFeedback: document.getElementById("customerFeedback").value,
      };
    }

    if (this.usingSupabase()) {
      try {
        await window.sb.from("reports").insert(reportData);
        await window.sb
          .from("report_requests")
          .update({ status: "completed" })
          .eq("id", requestId);
      } catch (err) {
        console.error("[Supabase] insert report error", err);
        this.showNotification("Database error while saving report", "error");
        return;
      }
    } else {
      // Save report (local)
      this.reports.push(reportData);
      this.saveReports();
      // Update request status (local)
      request.status = "completed";
      this.saveReportRequests();
    }

    // Notify head admin
    this.addNotification(
      "Report Generated",
      `${this.currentUser.username} has generated the ${request.reportType} report`,
      "head_admin"
    );

    document.getElementById("reportGenerationForm").style.display = "none";
    document.getElementById("reportRequestsList").style.display = "block";
    document.getElementById("completedReportsList").style.display = "block";
    document.getElementById("reportForm").reset();

    this.loadReportsData();
    this.showNotification("Report generated successfully!", "success");
  }

  cancelReportGeneration() {
    document.getElementById("reportGenerationForm").style.display = "none";
    document.getElementById("reportRequestsList").style.display = "block";
    document.getElementById("completedReportsList").style.display = "block";
    document.getElementById("reportForm").reset();
  }

  viewReport(reportId) {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return;

    let reportContent = `
            <div class="report-details">
                <div class="info-group">
                    <h4>Report Information</h4>
                    <p><strong>Report ID:</strong> ${report.id}</p>
                    <p><strong>Type:</strong> ${report.type}</p>
                    <p><strong>Date Range:</strong> ${report.dateFrom} to ${
      report.dateTo
    }</p>
                    <p><strong>Generated By:</strong> ${report.generatedBy}</p>
                    <p><strong>Date Generated:</strong> ${new Date(
                      report.dateGenerated
                    ).toLocaleDateString()}</p>
                </div>
        `;

    if (report.type === "pickup_dropoff") {
      reportContent += `
                <div class="info-group">
                    <h4>Pickup & Drop-off Summary</h4>
                    <p><strong>Total Pickups:</strong> ${report.totalPickups}</p>
                    <p><strong>Total Drop-offs:</strong> ${report.totalDropoffs}</p>
                    <p><strong>Average Delivery Time:</strong> ${report.avgDeliveryTime}</p>
                </div>
                <div class="info-group">
                    <h4>Demographics Summary</h4>
                    <p>${report.demographicsSummary}</p>
                </div>
            `;
    } else if (report.type === "sales") {
      reportContent += `
                <div class="info-group">
                    <h4>Sales Summary</h4>
                    <p><strong>Total Sales Amount:</strong> ₱${report.totalSalesAmount.toFixed(
                      2
                    )}</p>
                    <p><strong>Total Orders:</strong> ${
                      report.totalOrdersCount
                    }</p>
                </div>
                <div class="info-group">
                    <h4>Top Selling Products</h4>
                    <p>${report.topSellingProducts}</p>
                </div>
            `;
    } else if (report.type === "customer") {
      reportContent += `
                <div class="info-group">
                    <h4>Customer Summary</h4>
                    <p><strong>New Customers:</strong> ${report.newCustomersCount}</p>
                    <p><strong>Returning Customers:</strong> ${report.returningCustomersCount}</p>
                </div>
                <div class="info-group">
                    <h4>Customer Feedback</h4>
                    <p>${report.customerFeedback}</p>
                </div>
            `;
    }

    if (report.notes) {
      reportContent += `
                <div class="info-group">
                    <h4>Additional Notes</h4>
                    <p>${report.notes}</p>
                </div>
            `;
    }

    reportContent += "</div>";

    document.getElementById("reportDetailsContent").innerHTML = reportContent;
    this.showModal("reportDetailsModal");
  }

  // Analytics
  loadAnalyticsData() {
    if (this.usingSupabase()) {
      // FIX 5: ENSURE SETTINGS ARE LOADED BEFORE ANALYTICS - Ensure settings are loaded first for commission calculation
      Promise.all([
        this.fetchOrdersFromDB(),
        this.fetchSettingsFromDB(),
      ]).finally(() => {
        if (this.currentUser.role === "reseller") {
          this.loadResellerAnalytics();
        } else {
          this.loadAdminAnalytics();
        }
      });
      return;
    }

    // Ensure settings are loaded for local storage
    this.settings = this.loadSettings();

    if (this.currentUser.role === "reseller") {
      this.loadResellerAnalytics();
    } else {
      this.loadAdminAnalytics();
    }
  }

  loadResellerAnalytics() {
    // Show only reseller-specific data
    document.getElementById("resellerProfit").style.display = "block";

    // FIX 4: RESELLER ANALYTICS - Filter orders by reseller username instead of assignedTo
    // This ensures reseller sees their own orders from the user interface
    const resellerOrders = this.orders.filter((order) => {
      // Check if order was created by this reseller or assigned to them
      return (
        order.requestedBy === this.currentUser.username ||
        order.assignedTo === this.currentUser.id ||
        order.assignedTo === this.currentUser.username
      );
    });

    const totalSales = resellerOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    // FIX 4: RESELLER ANALYTICS - Ensure commission calculation uses proper settings value
    const commissionRate = this.settings?.resellerCommission || 15;
    const commission = totalSales * (commissionRate / 100);

    document.getElementById(
      "resellerTotalSales"
    ).textContent = `₱${totalSales.toFixed(2)}`;
    document.getElementById(
      "resellerCommission"
    ).textContent = `₱${commission.toFixed(2)}`;
    document.getElementById("resellerOrders").textContent =
      resellerOrders.length;
  }

  loadAdminAnalytics() {
    // Hide reseller-specific data for admin
    const resellerProfit = document.getElementById("resellerProfit");
    if (resellerProfit) {
      resellerProfit.style.display = "none";
    }

    // Load full analytics for admin
    // Chart implementations would go here
    this.showNotification("Analytics data loaded", "info");
  }

  // Settings
  loadSettingsData() {
    if (this.usingSupabase()) {
      this.fetchSettingsFromDB().finally(() => this._renderSettings());
      return;
    }
    this._renderSettings();
  }

  _renderSettings() {
    document.getElementById("storeName").value = this.settings.storeName || "";
    document.getElementById("storeAddress").value =
      this.settings.storeAddress || "";
    document.getElementById("storePhone").value =
      this.settings.storePhone || "";
    document.getElementById("storeEmail").value =
      this.settings.storeEmail || "";
    document.getElementById("deliveryFee").value =
      this.settings.deliveryFee || 50;
    document.getElementById("resellerCommissionSetting").value =
      this.settings.resellerCommission || 15;
    document.getElementById("autoApproval").value =
      this.settings.autoApproval || "false";
  }

  async handleStoreSettingsSubmit(e) {
    e.preventDefault();

    this.settings.storeName = document.getElementById("storeName").value;
    this.settings.storeAddress = document.getElementById("storeAddress").value;
    this.settings.storePhone = document.getElementById("storePhone").value;
    this.settings.storeEmail = document.getElementById("storeEmail").value;

    if (this.usingSupabase()) {
      try {
        await window.sb.from("settings").upsert({ id: 1, ...this.settings });
      } catch (err) {
        console.error("[Supabase] save settings error", err);
      }
    } else {
      this.saveSettings();
    }
    this.showNotification("Store settings updated successfully!", "success");
  }

  async handleSystemSettingsSubmit(e) {
    e.preventDefault();

    this.settings.deliveryFee = Number.parseFloat(
      document.getElementById("deliveryFee").value
    );
    this.settings.resellerCommission = Number.parseInt(
      document.getElementById("resellerCommissionSetting").value
    );
    this.settings.autoApproval =
      document.getElementById("autoApproval").value === "true";

    if (this.usingSupabase()) {
      try {
        await window.sb.from("settings").upsert({ id: 1, ...this.settings });
      } catch (err) {
        console.error("[Supabase] save settings error", err);
      }
    } else {
      this.saveSettings();
    }
    this.showNotification("System settings updated successfully!", "success");
  }

  handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (currentPassword !== this.currentUser.password) {
      this.showNotification("Current password is incorrect!", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showNotification("New passwords do not match!", "error");
      return;
    }

    if (newPassword.length < 6) {
      this.showNotification(
        "New password must be at least 6 characters!",
        "error"
      );
      return;
    }

    // Update password
    const memberIndex = this.members.findIndex(
      (m) => m.id === this.currentUser.id
    );
    if (memberIndex !== -1) {
      this.members[memberIndex].password = newPassword;
      this.currentUser.password = newPassword;

      this.saveMembers();
      localStorage.setItem(
        "admin_current_user",
        JSON.stringify(this.currentUser)
      );

      document.getElementById("passwordChangeForm").reset();
      this.showNotification("Password changed successfully!", "success");
    }
  }

  // Notifications System
  addNotification(title, message, targetRole, specificUser = null) {
    const notification = {
      id: `NOTIF_${Date.now()}`,
      title: title,
      message: message,
      targetRole: targetRole,
      specificUser: specificUser,
      date: new Date().toISOString(),
      read: false,
    };

    this.notifications.push(notification);
    this.saveNotifications();
    this.updateNotificationCount();
  }

  loadNotifications() {
    const saved = localStorage.getItem("admin_notifications");
    return saved ? JSON.parse(saved) : [];
  }

  saveNotifications() {
    localStorage.setItem(
      "admin_notifications",
      JSON.stringify(this.notifications)
    );
  }

  updateNotificationCount() {
    if (!this.currentUser) return;

    const userNotifications = this.notifications.filter(
      (notif) =>
        !notif.read &&
        (notif.targetRole === this.currentUser.role ||
          notif.specificUser === this.currentUser.id ||
          notif.specificUser === this.currentUser.username)
    );

    const badge = document.getElementById("notificationCount");
    const count = userNotifications.length;

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  toggleNotifications() {
    const dropdown = document.getElementById("notificationDropdown");
    const isVisible = dropdown.style.display === "block";

    if (isVisible) {
      this.hideNotifications();
    } else {
      this.showNotifications();
    }
  }

  showNotifications() {
    const dropdown = document.getElementById("notificationDropdown");
    const list = document.getElementById("notificationList");

    if (!this.currentUser) return;

    const userNotifications = this.notifications
      .filter(
        (notif) =>
          notif.targetRole === this.currentUser.role ||
          notif.specificUser === this.currentUser.id ||
          notif.specificUser === this.currentUser.username
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    if (userNotifications.length === 0) {
      list.innerHTML = '<div class="no-notifications">No notifications</div>';
    } else {
      list.innerHTML = userNotifications
        .map(
          (notif) => `
                <div class="notification-item ${
                  notif.read ? "" : "unread"
                }" onclick="adminDashboard.markNotificationRead('${notif.id}')">
                    <h5>${notif.title}</h5>
                    <p>${notif.message}</p>
                    <div class="notification-time">${this.getTimeAgo(
                      notif.date
                    )}</div>
                </div>
            `
        )
        .join("");
    }

    dropdown.style.display = "block";
  }

  hideNotifications() {
    document.getElementById("notificationDropdown").style.display = "none";
  }

  markNotificationRead(notificationId) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.updateNotificationCount();
      this.showNotifications(); // Refresh the display
    }
  }

  markAllRead() {
    this.notifications.forEach((notif) => {
      if (
        (notif.targetRole === this.currentUser.role ||
          notif.specificUser === this.currentUser.id ||
          notif.specificUser === this.currentUser.username) &&
        !notif.read
      ) {
        notif.read = true;
      }
    });
    this.saveNotifications();
    this.updateNotificationCount();
    this.showNotifications();
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }

  // Utility Methods
  updateCurrentDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.getElementById("currentDate").textContent = now.toLocaleDateString(
      "en-US",
      options
    );
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    document.body.style.overflow = "hidden";
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  showNotification(message, type = "info") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // Supabase helpers
  usingSupabase() {
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

  async fetchProductsFromDB() {
    try {
      const { data, error } = await window.sb
        .from("products")
        .select("id,name,price,description,category,stock,image")
        .order("id", { ascending: true });
      if (error) throw error;
      this.products = Array.isArray(data) ? data : [];
      this.saveProducts();
    } catch (err) {
      console.error("[Supabase] fetch products error", err);
      this.showNotification("Failed to load products from database", "error");
      // Fallback to any locally saved products so UI remains usable
      try {
        const saved = localStorage.getItem("admin_products");
        this.products = saved ? JSON.parse(saved) : this.products;
      } catch (_) {}
    }
  }

  async fetchCustomersFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false }); // Using created_at as a common field for ordering

        if (error) throw error;
        // Map Supabase columns to the expected local object structure
        this.customers = (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          barangay: row.barangay,
          gender: row.gender,
          age: row.age,
          govId: row.gov_id_url || row.govId || null, // Handle potential column name variations
          selfieVerification: row.selfie_url || row.selfieVerification || null, // Handle potential column name variations
          verificationStatus:
            row.verification_status || row.verificationStatus || "unverified", // Handle potential column name variations
        }));
        console.log(
          "[DB Sync] Customers fetched from Supabase:",
          this.customers.length
        );
      } else {
        // Fetch from localStorage
        const userCustomers = JSON.parse(
          localStorage.getItem("admin_customers") || "[]"
        );
        this.customers = userCustomers;
        console.log(
          "[DB Sync] Customers fetched from localStorage:",
          this.customers.length
        );
      }
      this.saveCustomers(); // Ensure consistency
    } catch (error) {
      console.error("[DB Sync] Error fetching customers:", error);
      this.showNotification("Failed to load customers", "error");
    }
  }

  async fetchMembersFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("members")
          .select("*")
          .order("created_at", { ascending: false }); // Using created_at as a common field for ordering

        if (error) throw error;
        // Map Supabase columns to the expected local object structure
        this.members = (data || []).map((row) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          role: row.role,
          status: row.status,
          createdDate: row.created_at || row.createdDate, // Handle potential column name variations
          lastLogin: row.last_login || row.lastLogin, // Handle potential column name variations
        }));
        console.log(
          "[DB Sync] Members fetched from Supabase:",
          this.members.length
        );
      } else {
        // Members are stored in localStorage
        this.members = this.loadMembers();
        console.log(
          "[DB Sync] Members fetched from localStorage:",
          this.members.length
        );
      }
      this.saveMembers(); // Ensure consistency
    } catch (error) {
      console.error("[DB Sync] Error fetching members:", error);
      this.showNotification("Failed to load members", "error");
    }
  }

  async fetchOrdersFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        this.orders = (data || []).map((row) => {
          // Parse items if it's a JSON string
          let items = [];
          try {
            items =
              typeof row.items === "string"
                ? JSON.parse(row.items)
                : row.items || [];
          } catch (e) {
            console.warn("[DB Sync] Failed to parse items:", e);
            items = [];
          }

          return {
            id: row.id,
            orderNumber: row.order_number,
            customer: {
              name: row.customer_name || "",
              email: row.customer_email || "",
              phone: row.customer_phone || "",
              address: row.customer_address || "",
              barangay: row.customer_barangay || "",
              gender: row.customer_gender || "",
              age: row.customer_age || "",
              altContact: row.customer_alt_contact || "",
              notes: row.customer_notes || "None",
            },
            items: items,
            delivery: {
              method: row.delivery_method || "delivery",
              location: row.delivery_location || null,
              fee: Number(row.delivery_fee || 0),
              estimatedDate: row.delivery_estimated_date || "",
            },
            payment: {
              method: row.payment_method || "gcash",
              paymentType: row.payment_type || "",
            },
            total: Number(row.total || 0),
            status: row.status || "pending",
            date: row.created_at || new Date().toISOString(),
            hasPreInvoice: !!row.has_pre_invoice,
            hasRealInvoice: !!row.has_real_invoice,
            preInvoiceId: row.pre_invoice_id || null,
            realInvoiceId: row.real_invoice_id || null,
            pickup: row.pickup || null,
            dropoff: row.dropoff || null,
            assignedTo: row.assigned_to || null,
            requestedBy: row.requested_by || null,
          };
        });
        console.log(
          "[DB Sync] Orders fetched from Supabase:",
          this.orders.length
        );
      } else {
        // Fetch from localStorage
        const userOrders = JSON.parse(
          localStorage.getItem("admin_orders") || "[]"
        );
        this.orders = userOrders;
        console.log(
          "[DB Sync] Orders fetched from localStorage:",
          this.orders.length
        );
      }
      this.saveOrders(); // Ensure consistency
    } catch (error) {
      console.error("[DB Sync] Error fetching orders:", error);
      this.showNotification("Failed to load orders", "error");
    }
  }

  async fetchSettingsFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("settings")
          .select("*")
          .single();

        if (error) throw error;
        this.settings = data || this.loadSettings();
        console.log("[DB Sync] Settings fetched from Supabase");
      } else {
        this.settings = this.loadSettings();
        console.log("[DB Sync] Settings fetched from localStorage");
      }
      this.saveSettings();
    } catch (error) {
      console.error("[DB Sync] Error fetching settings:", error);
      this.settings = this.loadSettings();
    }
  }

  async fetchInvoicesFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false }); // Using created_at as a common field for ordering

        if (error) throw error;
        // Map Supabase columns to the expected local object structure
        this.invoices = (data || []).map((row) => ({
          id: row.id,
          orderId: row.order_id,
          type: row.type,
          amount: Number(row.amount || 0),
          status: row.status || "generated",
          dateCreated: row.created_at || row.dateCreated, // Handle potential column name variations
          customerName: row.customer_name || "",
          customerEmail: row.customer_email || "",
          customerPhone: row.customer_phone || "",
          customerAddress: row.customer_address || "",
          items: row.items || [],
        }));
        console.log(
          "[DB Sync] Invoices fetched from Supabase:",
          this.invoices.length
        );
      } else {
        // Fetch from localStorage
        const userInvoices = JSON.parse(
          localStorage.getItem("admin_invoices") || "[]"
        );
        this.invoices = userInvoices;
        console.log(
          "[DB Sync] Invoices fetched from localStorage:",
          this.invoices.length
        );
      }
      this.saveInvoices(); // Ensure consistency
    } catch (error) {
      console.error("[DB Sync] Error fetching invoices:", error);
      this.showNotification("Failed to load invoices", "error");
    }
  }

  async fetchStockRequestsFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("stock_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        // Map Supabase columns to the expected local object structure
        this.stockRequests = (data || []).map((row) => ({
          id: row.id,
          productId: row.product_id,
          productName: row.product_name,
          quantity: row.quantity,
          reason: row.reason || "",
          requestedBy: row.requested_by,
          status: row.status || "pending",
          date: row.created_at || new Date().toISOString(),
        }));
        console.log(
          "[DB Sync] Stock requests fetched from Supabase:",
          this.stockRequests.length
        );
      } else {
        // Fetch from localStorage
        this.stockRequests = this.loadStockRequests();
        console.log(
          "[DB Sync] Stock requests fetched from localStorage:",
          this.stockRequests.length
        );
      }
      this.saveStockRequests(); // Ensure consistency
    } catch (error) {
      console.error("[DB Sync] Error fetching stock requests:", error);
      this.showNotification("Failed to load stock requests", "error");
    }
  }

  async fetchReportRequestsFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("report_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.reportRequests = (data || []).map((row) => ({
          id: row.id,
          resellerId: row.reseller_id,
          resellerName: row.reseller_name,
          reportType: row.report_type,
          dateFrom: row.date_from,
          dateTo: row.date_to,
          notes: row.notes || "",
          requestedBy: row.requested_by,
          status: row.status || "pending",
          date: row.created_at || new Date().toISOString(),
        }));
        console.log(
          "[DB Sync] Report requests fetched from Supabase:",
          this.reportRequests.length
        );
      } else {
        this.reportRequests = this.loadReportRequests();
        console.log(
          "[DB Sync] Report requests fetched from localStorage:",
          this.reportRequests.length
        );
      }
      this.saveReportRequests();
    } catch (error) {
      console.error("[DB Sync] Error fetching report requests:", error);
      this.showNotification("Failed to load report requests", "error");
    }
  }

  async fetchReportsFromDB() {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.reports = (data || []).map((row) => ({
          id: row.id,
          requestId: row.request_id,
          type: row.report_type,
          dateFrom: row.date_from,
          dateTo: row.date_to,
          generatedBy: row.generated_by,
          dateGenerated: row.created_at || new Date().toISOString(),
          notes: row.notes || "",
          totalPickups: row.total_pickups || 0,
          totalDropoffs: row.total_dropoffs || 0,
          avgDeliveryTime: row.avg_delivery_time || "",
          demographicsSummary: row.demographics_summary || "",
          totalSalesAmount: Number(row.total_sales_amount || 0),
          totalOrdersCount: row.total_orders_count || 0,
          topSellingProducts: row.top_selling_products || "",
          newCustomersCount: row.new_customers_count || 0,
          returningCustomersCount: row.returning_customers_count || 0,
          customerFeedback: row.customer_feedback || "",
        }));
        console.log(
          "[DB Sync] Reports fetched from Supabase:",
          this.reports.length
        );
      } else {
        this.reports = this.loadReports();
        console.log(
          "[DB Sync] Reports fetched from localStorage:",
          this.reports.length
        );
      }
      this.saveReports();
    } catch (error) {
      console.error("[DB Sync] Error fetching reports:", error);
      this.showNotification("Failed to load reports", "error");
    }
  }

  async saveStockRequestToDB(requestData) {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb.from("stock_requests").insert([
          {
            reseller_id: this.currentUser.id, // Assuming this.currentUser.id exists
            reseller_name: this.currentUser.username, // Assuming this.currentUser.username exists
            product_id: requestData.productId,
            product_name: requestData.productName,
            quantity_needed: requestData.quantity, // Match Supabase column name
            reason: requestData.reason,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        console.log("[DB Sync] Stock request saved to Supabase:", data);
        // Return the ID of the newly created request, if available
        return data?.[0]?.id;
      } else {
        // Save to localStorage
        const requests = this.loadStockRequests();
        const newRequest = {
          id: "STOCK_REQ_" + Date.now(), // Generate a unique local ID
          reseller_id: this.currentUser.id,
          reseller_name: this.currentUser.username,
          product_id: requestData.productId,
          product_name: requestData.productName,
          quantity_needed: requestData.quantity, // Consistent naming
          reason: requestData.reason,
          status: "pending",
          created_at: new Date().toISOString(), // Consistent naming
        };
        requests.push(newRequest);
        this.stockRequests = requests; // Update internal state
        this.saveStockRequests(); // Save to localStorage
        console.log(
          "[DB Sync] Stock request saved to localStorage:",
          newRequest
        );
        return newRequest.id; // Return local ID
      }
    } catch (error) {
      console.error("[DB Sync] Error saving stock request:", error);
      this.showNotification("Failed to save stock request", "error");
      throw error; // Re-throw to allow caller to handle
    }
  }

  async saveReportToDB(reportData) {
    try {
      if (this.usingSupabase()) {
        const { data, error } = await window.sb.from("reports").insert([
          {
            // Assuming 'reseller_id' and 'reseller_name' are relevant for reports in Supabase schema
            reseller_id: this.currentUser.id,
            reseller_name: this.currentUser.username,
            report_type: reportData.type,
            report_content: JSON.stringify(reportData.content), // Assuming content is JSON stringifiable
            status: "submitted", // Default status
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        console.log("[DB Sync] Report saved to Supabase:", data);
        return data?.[0]?.id; // Return the ID of the newly created report
      } else {
        // Save to localStorage
        const reports = this.loadReports();
        const newReport = {
          id: "REPORT_" + Date.now(), // Generate a unique local ID
          reseller_id: this.currentUser.id,
          reseller_name: this.currentUser.username,
          report_type: reportData.type,
          report_content: JSON.stringify(reportData.content),
          status: "submitted",
          created_at: new Date().toISOString(),
        };
        reports.push(newReport);
        this.reports = reports; // Update internal state
        this.saveReports(); // Save to localStorage
        console.log("[DB Sync] Report saved to localStorage:", newReport);
        return newReport.id; // Return local ID
      }
    } catch (error) {
      console.error("[DB Sync] Error saving report:", error);
      this.showNotification("Failed to save report", "error");
      throw error; // Re-throw to allow caller to handle
    }
  }

  getResellerOrders() {
    // This method should filter orders relevant to the current reseller.
    // In a real application, this would likely involve querying the database
    // based on an 'assigned_to' or 'reseller_id' field in the order.
    // For this example, we'll assume orders might have a 'requestedBy' field.
    if (!this.currentUser || this.currentUser.role !== "reseller") {
      return [];
    }

    // For resellers, show orders that were created by them or assigned to them.
    return this.orders.filter((order) => {
      return (
        order.requestedBy === this.currentUser.username ||
        order.assignedTo === this.currentUser.id || // if assigned by ID
        order.assignedTo === this.currentUser.username
      ); // if assigned by username
    });
  }

  getResellerProfit() {
    const resellerOrders = this.getResellerOrders();
    const totalSales = resellerOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const commissionRate = this.settings.resellerCommission || 15; // Fallback to default if not set
    const commission = (totalSales * commissionRate) / 100;

    return {
      totalSales,
      commission,
      ordersCount: resellerOrders.length,
      commissionRate,
    };
  }

  // Data Management - Enhanced
  loadProducts() {
    const saved = localStorage.getItem("admin_products");
    if (saved) {
      return JSON.parse(saved);
    }

    // Return default products from main site
    return [
      {
        id: 1,
        name: "Be Clever Enough",
        price: 550,
        description: "Premium quality shirt with clever design",
        image:
          "https://placeholder-image-service.onrender.com/image/300x200?prompt=Modern black t-shirt with clever typography design&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
        category: "shirts",
        stock: 25,
      },
      {
        id: 2,
        name: "Sie/Te T-shirt",
        price: 350,
        description: "Premium quality oversized shirt design",
        image:
          "https://placeholder-image-service.onrender.com/image/300x200?prompt=Oversized t-shirt with contemporary graphics&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
        category: "shirts",
        stock: 30,
      },
      {
        id: 3,
        name: "What IT?",
        price: 350,
        description: "Modern design with bold statement",
        image:
          "https://placeholder-image-service.onrender.com/image/300x200?prompt=T-shirt with bold question mark design&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
        category: "shirts",
        stock: 20,
      },
      {
        id: 4,
        name: "Clever Premium",
        price: 550,
        description: "Premium quality clever design shirt",
        image:
          "https://placeholder-image-service.onrender.com/image/300x200?prompt=Premium t-shirt with sophisticated branding&id=0b4be62a-4821-4662-84b2-6709a973775a&customer_id=cus_T2H2vjvk1p7H6d",
        category: "shirts",
        stock: 15,
      },
    ];
  }

  saveProducts() {
    localStorage.setItem("admin_products", JSON.stringify(this.products));
  }

  loadOrders() {
    const saved = localStorage.getItem("admin_orders");
    return saved ? JSON.parse(saved) : [];
  }

  saveOrders() {
    localStorage.setItem("admin_orders", JSON.stringify(this.orders));
  }

  loadCustomers() {
    const saved = localStorage.getItem("admin_customers");
    return saved ? JSON.parse(saved) : [];
  }

  saveCustomers() {
    localStorage.setItem("admin_customers", JSON.stringify(this.customers));
  }

  loadMembers() {
    const saved = localStorage.getItem("admin_members");
    return saved ? JSON.parse(saved) : [];
  }

  saveMembers() {
    localStorage.setItem("admin_members", JSON.stringify(this.members));
  }

  loadSettings() {
    const saved = localStorage.getItem("admin_settings");
    return saved ? JSON.parse(saved) : {};
  }

  saveSettings() {
    localStorage.setItem("admin_settings", JSON.stringify(this.settings));
  }

  // FIX 6: SAVE STOCK REQUESTS TO LOCAL STORAGE - Added saveStockRequests method
  saveStockRequests() {
    localStorage.setItem(
      "admin_stock_requests",
      JSON.stringify(this.stockRequests)
    );
  }

  // FIX 6: SAVE STOCK REQUESTS TO LOCAL STORAGE - Added loadStockRequests method
  loadStockRequests() {
    const data = localStorage.getItem("admin_stock_requests");
    return data ? JSON.parse(data) : [];
  }

  loadReportRequests() {
    const saved = localStorage.getItem("admin_report_requests");
    return saved ? JSON.parse(saved) : [];
  }

  saveReportRequests() {
    localStorage.setItem(
      "admin_report_requests",
      JSON.stringify(this.reportRequests)
    );
  }

  loadReports() {
    const saved = localStorage.getItem("admin_reports");
    return saved ? JSON.parse(saved) : [];
  }

  saveReports() {
    localStorage.setItem("admin_reports", JSON.stringify(this.reports));
  }

  loadInvoices() {
    const saved = localStorage.getItem("admin_invoices");
    return saved ? JSON.parse(saved) : [];
  }

  saveInvoices() {
    localStorage.setItem("admin_invoices", JSON.stringify(this.invoices));
  }
}

// Global functions for onclick handlers
window.adminDashboard = null;

// Password toggle function
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("passwordToggleIcon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

// Generic password field toggle
function togglePasswordField(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const toggleBtn = passwordInput.nextElementSibling;
  const toggleIcon = toggleBtn.querySelector("i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.adminDashboard = new AdminDashboard();
});

// Make functions globally available
window.showSection = (section) => {
  if (window.adminDashboard) {
    window.adminDashboard.showSection(section);
  }
};

window.closeModal = (modalId) => {
  if (window.adminDashboard) {
    window.adminDashboard.closeModal(modalId);
  }
};
(modalId) => {
  if (window.adminDashboard) {
    window.adminDashboard.closeModal(modalId);
  }
};
