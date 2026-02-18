import type { Translations } from './tr';

export const ar: Translations = {
    // Common
    menu: 'القائمة',
    order: 'طلب',
    orders: 'طلباتي',
    cart: 'السلة',
    logout: 'خروج',
    back: 'رجوع',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    yes: 'نعم',
    no: 'لا',
    search: 'بحث...',
    noResults: 'لا توجد نتائج',

    // Login
    welcome: 'مرحباً',
    continueToLogin: 'يرجى تسجيل الدخول للمتابعة',
    roleSelection: 'اختيار الدور',
    continueBtn: 'متابعة',
    loginBtn: 'تسجيل الدخول',
    backBtn: '← رجوع',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    usernamePlaceholder: 'أدخل اسم المستخدم',
    passwordPlaceholder: 'أدخل كلمة المرور',
    loginError: 'اسم المستخدم أو كلمة المرور غير صحيحة!',
    adminLogin: 'دخول المدير',
    waiterLogin: 'دخول النادل',
    kitchenLogin: 'دخول المطبخ',
    enterCredentials: 'أدخل بياناتك للمتابعة',

    // Roles
    roleCustomer: 'زبون',
    roleAdmin: 'مدير المطعم',
    roleWaiter: 'نادل',
    roleKitchen: 'المطبخ',
    roleCustomerDesc: 'لتقديم الطلبات',
    roleAdminDesc: 'صلاحيات الإدارة الكاملة',
    roleWaiterDesc: 'إدارة الطلبات',
    roleKitchenDesc: 'تحضير الطلبات',

    // Products / Menu
    allCategories: 'جميع الأصناف',
    addToCart: 'أضف للسلة',
    searchProducts: 'ابحث عن منتج...',
    noProductsFound: 'لم يتم العثور على منتجات',
    categories: 'الأصناف',
    products: 'المنتجات',
    itemCount: 'عناصر',

    // ProductsPage
    ourMenu: 'قائمتنا',
    selectCategoryToOrder: 'اختر صنفاً لتقديم طلبك',
    selectSubcategory: 'اختر صنفاً فرعياً',
    subCategories: 'أصناف فرعية',
    noProductsInCategory: 'لا توجد منتجات بعد',
    noProductsInCategoryMsg: 'لا توجد منتجات في هذا الصنف حتى الآن.',
    backToCategories: '← العودة للأصناف',
    menuLoading: 'جاري تحميل القائمة...',
    menuLoadFailed: 'تعذر تحميل القائمة',
    tryAgain: 'حاول مرة أخرى',
    goBackShort: '← رجوع',

    // Cart
    tableOrder: 'طلب الطاولة',
    emptyCart: 'السلة فارغة',
    emptyCartMsg: 'لم تضف أي منتجات إلى سلتك بعد.',
    goToMenu: 'العودة للقائمة',
    createOrder: 'إنشاء الطلب',
    subtotal: 'المجموع الفرعي',
    total: 'الإجمالي',
    decrease: 'تقليل',
    increase: 'زيادة',
    remove: 'حذف',

    // Checkout
    orderConfirmation: 'تأكيد الطلب',
    tableInfo: 'معلومات الطاولة',
    tableNumber: 'رقم الطاولة',
    tableNumberRequired: 'رقم الطاولة *',
    noteOptional: 'ملاحظة (اختياري)',
    notePlaceholder: 'طلب خاص أو ملاحظة...',
    processing: 'جاري المعالجة...',
    tablesLoading: 'جاري تحميل الطاولات...',
    noTablesAvailable: 'لا توجد طاولات متاحة. يرجى الاتصال بالمدير.',
    table: 'طاولة',
    orderSuccess: '✅ تم استلام طلبك وهو قيد التحضير!',
    orderError: '❌ تعذر إنشاء الطلب. يرجى المحاولة مرة أخرى.',

    // Orders
    myOrders: 'طلباتي',
    noOrdersYet: 'لا توجد طلبات بعد',
    noOrdersMsg: 'لم تقم بأي طلب حتى الآن.',
    startShopping: 'ابدأ التسوق',
    orderNotFound: 'الطلب غير موجود',
    backToOrders: '← العودة للطلبات',
    orderDetails: 'تفاصيل الطلب',
    paymentSummary: 'ملخص الدفع',
    tableNumberLabel: 'رقم الطاولة:',
    waiterLabel: 'النادل:',
    noteLabel: 'ملاحظة:',

    // Status
    statusPreparing: '👨‍🍳 قيد التحضير',
    statusReady: '✅ جاهز',
    statusDelivered: '🚀 تم التسليم',
    statusCourierDelivered: '🏍️ تم تسليم الكوريير',
    statusPaid: '✓ مدفوع',
    statusCancelled: '✕ ملغي',

    // Kitchen
    kitchenOrders: '👨‍🍳 طلبات المطبخ',
    orderCount: 'طلب',
    allOrdersReady: 'جميع الطلبات جاهزة!',
    readyBtn: '✓ جاهز',
    waiter: 'النادل',
    courierDelivery: '🛵 توصيل بالكوريير',
    justNow: 'الآن',
    minutes: 'دقيقة',
    hours: 'ساعة',

    // Waiter
    waiterOrders: '🧑‍🍳 طلبات النادل',
    readyOrders: 'الطلبات الجاهزة',
    activeOrders: 'الطلبات النشطة',
    deliveredOrders: 'الطلبات المسلمة',
    noReadyOrders: 'لا توجد طلبات جاهزة.',
    noActiveOrders: 'لا توجد طلبات نشطة.',
    noDeliveredOrders: 'لا توجد طلبات مسلمة.',
    markDelivered: '✓ تم التسليم',
    markCourierDelivered: '🛵 كوريير',
    markPaid: '💰 مدفوع',
    restaurant: 'المطعم',

    // Order ready notification
    orderReady: '🎉 طلبك جاهز!',

    // Admin tabs
    adminOrders: '📋 الطلبات',
    adminMenu: '🍽️ القائمة',
    adminTables: '🪑 الطاولات',
    adminWaiters: '👨‍🍳 النوادل',
    adminReports: '📊 التقارير',
    adminCashier: '💰 الكاشير',
    adminThirdParty: '📱 طلبات خارجية',
};

// Category name translations (Turkish → Arabic)
export const arCategoryNames: Record<string, string> = {
    'İçecekler': 'المشروبات',
    'Kahvaltı': 'الإفطار',
    'Ana Yemek': 'الطبق الرئيسي',
    'Tatlılar': 'الحلويات',
    'Kahveler': 'القهوة',
    'Sıcak Kahveler': 'القهوة الساخنة',
    'Soğuk Kahveler': 'القهوة المثلجة',
    'Burgerler': 'البرجر',
    'Pizzalar': 'البيتزا',
    'Salatalar': 'السلطات',
    'Çorbalar': 'الشوربات',
    'Başlangıçlar': 'المقبلات',
    'Izgara': 'المشويات',
    'Makarnalar': 'المعكرونة',
    'Sandviçler': 'السندويشات',
    'Aperatifler': 'المقبلات الخفيفة',
    'Diğer': 'أخرى',
};
