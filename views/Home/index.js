/**
 * Peternity Webshop - Backend Logic
 * Ez a fájl tartalmazza a Peternity webshop működéséhez szükséges backend logikát.
 * A kód JavaScript nyelven íródott, és a lehető legolvashatóbb formában van strukturálva.
 */

// ==================== ADATBÁZIS MODELLEK ====================

/**
 * User modell - a felhasználói adatok tárolására
 */
class User {
  constructor(id, name, email, passwordHash, createdAt, isActive) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.isActive = isActive;
    this.watchlist = []; // Figyelt termékek azonosítói
    this.cart = []; // Kosárba helyezett termékek (termékId, mennyiség)
    this.address = null; // Szállítási cím
    this.billingInfo = null; // Számlázási adatok
  }
}

/**
 * Product modell - a termékek adatainak tárolására
 */
class Product {
  constructor(id, title, description, price, category, sellerId, createdAt) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.category = category;
    this.sellerId = sellerId;
    this.createdAt = createdAt;
    this.images = []; // Termék képeinek URL-jei
    this.tags = []; // Termék címkéi
    this.isNegotiable = false; // Alkuképes-e a termék
    this.condition = 'new'; // Termék állapota: new, like_new, good, used
    this.status = 'active'; // Termék státusza: active, sold, inactive
    this.viewCount = 0; // Megtekintések száma
    this.wishlistCount = 0; // Hányan tették kedvencek közé
  }
}

/**
 * Offer modell - az ajánlatok tárolására
 */
class Offer {
  constructor(id, productId, buyerId, sellerId, amount, message, status, createdAt) {
    this.id = id;
    this.productId = productId;
    this.buyerId = buyerId;
    this.sellerId = sellerId;
    this.amount = amount; // Ajánlott összeg
    this.message = message; // Ajánlathoz fűzött üzenet
    this.status = status; // Ajánlat státusza: pending, accepted, rejected, countered
    this.createdAt = createdAt;
    this.counterOffer = null; // Viszontajánlat összege (ha van)
    this.responseMessage = null; // Válasz üzenet az eladótól
  }
}

/**
 * Order modell - a rendelések tárolására
 */
class Order {
  constructor(id, userId, items, totalAmount, status, createdAt) {
    this.id = id;
    this.userId = userId;
    this.items = items; // Rendelt termékek listája (termékId, mennyiség, egységár)
    this.totalAmount = totalAmount; // Teljes rendelési összeg
    this.status = status; // Rendelés státusza: pending, paid, shipped, delivered, canceled
    this.createdAt = createdAt;
    this.paymentMethod = null; // Fizetési mód
    this.paymentStatus = null; // Fizetés státusza
    this.shippingAddress = null; // Szállítási cím
    this.trackingNumber = null; // Csomagkövetési szám
  }
}

// ==================== ADATBÁZIS SZIMULÁLÁSA ====================

// In-memory adatbázis a demó céljából
const db = {
  users: [],
  products: [],
  offers: [],
  orders: [],
  categories: [
    { id: 'electronics', name: 'Elektronika' },
    { id: 'fashion', name: 'Ruházat' },
    { id: 'home', name: 'Otthon és kert' },
    { id: 'toys', name: 'Játékok és hobbi' },
    { id: 'beauty', name: 'Szépségápolás' },
    { id: 'sports', name: 'Sport és szabadidő' },
    { id: 'books', name: 'Könyvek és média' },
    { id: 'other', name: 'Egyéb' }
  ],
  paymentMethods: [
    { id: 'card', name: 'Bankkártya' },
    { id: 'transfer', name: 'Banki átutalás' },
    { id: 'cash', name: 'Utánvét' }
  ]
};

// Minta adatok generálása az adatbázisba
function seedDatabase() {
  // Felhasználók létrehozása
  db.users.push(new User(
    'usr_001',
    'Kovács János',
    'kovacs.janos@example.com',
    'hashed_password_here',
    new Date('2024-02-15'),
    true
  ));

  db.users.push(new User(
    'usr_002',
    'Nagy Eszter',
    'nagy.eszter@example.com',
    'hashed_password_here',
    new Date('2024-02-20'),
    true
  ));

  // Termékek létrehozása
  const product1 = new Product(
    'prod_001',
    'IKEA Stílus Íróasztal Fehér',
    'Minimál stílusú, fehér íróasztal fiókokkal, kifogástalan állapotban. Szélesség: 120cm, Mélység: 60cm, Magasság: 75cm. Eredetileg 39.990 Ft-ért vásároltam.',
    34990,
    'home',
    'usr_001',
    new Date('2024-03-01')
  );
  product1.images.push('/api/placeholder/250/200');
  product1.isNegotiable = true;
  product1.tags = ['íróasztal', 'bútor', 'fehér', 'IKEA'];
  db.products.push(product1);

  const product2 = new Product(
    'prod_002',
    'Samsung Galaxy S20 FE - Használt',
    'Samsung Galaxy S20 FE, 128GB, kék színben. 1 évet használtam, tökéletesen működik, apró karcolások a hátsó borításon. Eredeti dobozával, töltővel.',
    75000,
    'electronics',
    'usr_002',
    new Date('2024-03-02')
  );
  product2.images.push('/api/placeholder/250/200');
  product2.isNegotiable = true;
  product2.condition = 'used';
  product2.tags = ['samsung', 'telefon', 'mobiltelefon', 'galaxy', 'használt'];
  db.products.push(product2);

  // További termékek hozzáadása
  const product3 = new Product(
    'prod_003',
    'Vintage bőr táska - kézműves',
    'Kézzel készített, valódi bőr vintage táska. Barna színben, állítható pánttal, belső zipzáros zsebekkel. Egyedi darab!',
    22500,
    'fashion',
    'usr_001',
    new Date('2024-03-03')
  );
  product3.images.push('/api/placeholder/250/200');
  product3.tags = ['táska', 'bőr', 'kézműves', 'vintage'];
  db.products.push(product3);

  const product4 = new Product(
    'prod_004',
    'PlayStation 5 kontroller - fekete',
    'Teljesen új, bontatlan PlayStation 5 kontroller fekete színben. Garanciális, számlával.',
    28900,
    'electronics',
    'usr_002',
    new Date('2024-03-04')
  );
  product4.images.push('/api/placeholder/250/200');
  product4.tags = ['playstation', 'ps5', 'kontroller', 'játék'];
  db.products.push(product4);
}

// Adatbázis inicializálása
seedDatabase();

// ==================== SEGÉDFÜGGVÉNYEK ====================

/**
 * Egyedi azonosító generálása
 * @param {string} prefix - Az azonosító előtagja
 * @returns {string} - A generált egyedi azonosító
 */
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomStr}`;
}

/**
 * Jelszó hashelése (demonstrációs célból)
 * Megjegyzés: Valós implementációban bcrypt vagy hasonló könyvtár használata javasolt!
 * @param {string} password - A hashelendő jelszó
 * @returns {string} - A hashelt jelszó
 */
function hashPassword(password) {
  // Ez csak egy példa, NE használjuk produkcióban!
  return `hashed_${password}_${Date.now()}`;
}

/**
 * Hibaüzenet objektum létrehozása
 * @param {string} message - A hibaüzenet szövege
 * @param {number} statusCode - HTTP státuszkód
 * @returns {Object} - A hibaüzenet objektum
 */
function createError(message, statusCode = 400) {
  return {
    error: true,
    message,
    statusCode
  };
}

/**
 * Szabálytalan tartalom ellenőrzése
 * @param {string} text - Ellenőrizendő szöveg
 * @returns {boolean} - Tartalmaz-e tiltott tartalmat
 */
function containsProhibitedContent(text) {
  const prohibitedKeywords = [
    'illegális', 'pornográf', 'fegyver', 'kábítószer', 'drog', 'hamis', 'hamisított'
  ];

  if (!text) return false;

  const lowerText = text.toLowerCase();
  return prohibitedKeywords.some(keyword => lowerText.includes(keyword));
}

// ==================== AUTENTIKÁCIÓS SZOLGÁLTATÁS ====================

const AuthService = {
  /**
   * Felhasználó regisztrálása
   * @param {string} name - A felhasználó neve
   * @param {string} email - A felhasználó email címe
   * @param {string} password - A felhasználó jelszava
   * @returns {Object} - A létrehozott felhasználó objektum vagy hibaüzenet
   */
  registerUser: function(name, email, password) {
    // Ellenőrzések
    if (!name || !email || !password) {
      return createError('Minden mező kitöltése kötelező!');
    }

    // Email formátum ellenőrzése
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createError('Érvénytelen email cím formátum!');
    }

    // Jelszó erősségének ellenőrzése
    if (password.length < 8) {
      return createError('A jelszónak legalább 8 karakterből kell állnia!');
    }

    // Email cím egyediségének ellenőrzése
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
      return createError('Ez az email cím már regisztrálva van!');
    }

    // Felhasználó létrehozása
    const newUser = new User(
      generateId('usr'),
      name,
      email,
      hashPassword(password),
      new Date(),
      true
    );

    // Mentés az adatbázisba
    db.users.push(newUser);

    // Visszatérés a felhasználói adatokkal (jelszó nélkül)
    const { passwordHash, ...userWithoutPassword } = newUser;
    return {
      success: true,
      message: 'Sikeres regisztráció!',
      user: userWithoutPassword
    };
  },

  /**
   * Felhasználó bejelentkeztetése
   * @param {string} email - A felhasználó email címe
   * @param {string} password - A felhasználó jelszava
   * @returns {Object} - Sikeres bejelentkezési adatok vagy hibaüzenet
   */
  loginUser: function(email, password) {
    // Ellenőrzések
    if (!email || !password) {
      return createError('Email cím és jelszó megadása kötelező!');
    }

    // Felhasználó keresése
    const user = db.users.find(user => user.email === email);
    if (!user) {
      return createError('Helytelen email cím vagy jelszó!', 401);
    }

    // Jelszó ellenőrzése (egyszerűsített demonstrációs célból)
    // Valós rendszerben bcrypt.compare() vagy hasonló használata javasolt
    if (!user.passwordHash.includes(password)) {
      return createError('Helytelen email cím vagy jelszó!', 401);
    }

    // Aktív státusz ellenőrzése
    if (!user.isActive) {
      return createError('Ez a felhasználói fiók inaktív vagy letiltott!', 403);
    }

    // JWT token generálás helyett egyszerű tokent adunk vissza demo céljából
    // Valós rendszerben JWT implementálása javasolt
    const authToken = `demo_token_${user.id}_${Date.now()}`;

    // Sikeres bejelentkezés
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      success: true,
      message: 'Sikeres bejelentkezés!',
      user: userWithoutPassword,
      token: authToken
    };
  }
};

// ==================== TERMÉK SZOLGÁLTATÁS ====================

const ProductService = {
  /**
   * Új termék létrehozása
   * @param {Object} productData - A termék adatai
   * @param {string} userId - A feltöltő felhasználó azonosítója
   * @returns {Object} - A létrehozott termék objektum vagy hibaüzenet
   */
  createProduct: function(productData, userId) {
    // Felhasználó ellenőrzése
    const user = db.users.find(user => user.id === userId);
    if (!user) {
      return createError('Felhasználó nem található!', 404);
    }

    // Kötelező mezők ellenőrzése
    const { title, description, price, category } = productData;
    if (!title || !description || !price || !category) {
      return createError('Minden kötelező mező kitöltése szükséges!');
    }

    // Ár ellenőrzése
    if (isNaN(price) || price <= 0) {
      return createError('Az árnak pozitív számnak kell lennie!');
    }

    // Kategória érvényességének ellenőrzése
    const validCategory = db.categories.find(cat => cat.id === category);
    if (!validCategory) {
      return createError('Érvénytelen kategória!');
    }

    // Tiltott tartalom ellenőrzése
    if (
      containsProhibitedContent(title) ||
      containsProhibitedContent(description)
    ) {
      return createError('A termék leírása tiltott tartalmat tartalmaz!', 403);
    }

    // Új termék létrehozása
    const newProduct = new Product(
      generateId('prod'),
      title,
      description,
      parseFloat(price),
      category,
      userId,
      new Date()
    );

    // Opcionális mezők hozzáadása
    if (productData.tags && Array.isArray(productData.tags)) {
      newProduct.tags = productData.tags.slice(0, 10); // Maximum 10 címke
    }

    if (productData.isNegotiable === true) {
      newProduct.isNegotiable = true;
    }

    if (productData.condition && ['new', 'like_new', 'good', 'used'].includes(productData.condition)) {
      newProduct.condition = productData.condition;
    }

    // Képek kezelése (valós rendszerben feltöltés és validálás szükséges)
    if (productData.images && Array.isArray(productData.images)) {
      newProduct.images = productData.images.slice(0, 5); // Maximum 5 kép
    }

    // Mentés az adatbázisba
    db.products.push(newProduct);

    // Visszatérés a sikeres eredménnyel
    return {
      success: true,
      message: 'Termék sikeresen létrehozva!',
      product: newProduct
    };
  },

  /**
   * Termékek listázása (szűrési, rendezési és lapozási lehetőségekkel)
   * @param {Object} filters - Szűrési feltételek
   * @param {Object} sort - Rendezési beállítások
   * @param {Object} pagination - Lapozási beállítások
   * @returns {Object} - A találati lista vagy hibaüzenet
   */
  listProducts: function(filters = {}, sort = {}, pagination = {}) {
    let results = [...db.products];

    // Szűrések alkalmazása
    if (filters.category) {
      results = results.filter(product => product.category === filters.category);
    }

    if (filters.minPrice) {
      results = results.filter(product => product.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      results = results.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    if (filters.condition) {
      results = results.filter(product => product.condition === filters.condition);
    }

    if (filters.sellerId) {
      results = results.filter(product => product.sellerId === filters.sellerId);
    }

    if (filters.isNegotiable === true) {
      results = results.filter(product => product.isNegotiable === true);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Csak aktív termékek megjelenítése (hacsak nem kifejezetten más státuszt kérnek)
    if (!filters.status) {
      results = results.filter(product => product.status === 'active');
    } else {
      results = results.filter(product => product.status === filters.status);
    }

    // Rendezés alkalmazása
    const { field = 'createdAt', order = 'desc' } = sort;

    results.sort((a, b) => {
      if (field === 'price') {
        return order === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (field === 'createdAt') {
        return order === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (field === 'popularity') {
        const aPopularity = a.viewCount + (a.wishlistCount * 3);
        const bPopularity = b.viewCount + (b.wishlistCount * 3);
        return order === 'asc' ? aPopularity - bPopularity : bPopularity - aPopularity;
      }
      return 0;
    });

    // Lapozás alkalmazása
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Lapozási metaadatok
    const paginationInfo = {
      totalItems: results.length,
      totalPages: Math.ceil(results.length / limit),
      currentPage: page,
      pageSize: limit
    };

    // Oldal eredményeinek kiválasztása
    const paginatedResults = results.slice(startIndex, endIndex);

    // Eladók adatainak beillesztése (valós rendszerben JOIN művelet lenne)
    const resultsWithSellerInfo = paginatedResults.map(product => {
      const seller = db.users.find(user => user.id === product.sellerId);
      const sellerInfo = seller ? {
        id: seller.id,
        name: seller.name
      } : { name: 'Ismeretlen' };

      return { ...product, seller: sellerInfo };
    });

    // Visszatérés a találati listával
    return {
      success: true,
      products: resultsWithSellerInfo,
      pagination: paginationInfo
    };
  },

  /**
   * Termék részleteinek lekérése
   * @param {string} productId - A termék azonosítója
   * @param {string} viewerId - A megtekintő felhasználó azonosítója (opcionális)
   * @returns {Object} - A termék részletes adatai vagy hibaüzenet
   */
  getProductDetails: function(productId, viewerId = null) {
    // Termék keresése
    const product = db.products.find(product => product.id === productId);
    if (!product) {
      return createError('A termék nem található!', 404);
    }

    // Megtekintések számának növelése
    product.viewCount += 1;

    // Eladó adatainak lekérése
    const seller = db.users.find(user => user.id === product.sellerId);
    let sellerInfo = { name: 'Ismeretlen' };

    if (seller) {
      sellerInfo = {
        id: seller.id,
        name: seller.name,
        // További publikus adatok...
      };
    }

    // Hasonló termékek lekérése
    const similarProducts = db.products
      .filter(p =>
        p.id !== productId &&
        (p.category === product.category ||
         p.tags.some(tag => product.tags.includes(tag)))
      )
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        images: p.images
      }));

    // Termék státuszának ellenőrzése
    if (product.status !== 'active' && (!viewerId || product.sellerId !== viewerId)) {
      return createError('Ez a termék jelenleg nem elérhető!', 403);
    }

    // Eredmény összeállítása
    const result = {
      ...product,
      seller: sellerInfo,
      similarProducts,
      isInWatchlist: false
    };

    // Ellenőrzés, hogy a megtekintő felhasználó figyeli-e a terméket
    if (viewerId) {
      const viewer = db.users.find(user => user.id === viewerId);
      if (viewer && viewer.watchlist.includes(productId)) {
        result.isInWatchlist = true;
      }
    }

    return {
      success: true,
      product: result
    };
  }
};

// ==================== AJÁNLAT SZOLGÁLTATÁS ====================

const OfferService = {
  /**
   * Új ajánlat létrehozása egy termékre
   * @param {string} productId - A termék azonosítója
   * @param {string} buyerId - A vásárló azonosítója
   * @param {number} amount - Az ajánlott összeg
   * @param {string} message - Opcionális üzenet az ajánlathoz
   * @returns {Object} - A létrehozott ajánlat vagy hibaüzenet
   */
  createOffer: function(productId, buyerId, amount, message = '') {
    // Termék keresése
    const product = db.products.find(product => product.id === productId);
    if (!product) {
      return createError('A termék nem található!', 404);
    }

    // Felhasználó ellenőrzése
    const buyer = db.users.find(user => user.id === buyerId);
    if (!buyer) {
      return createError('Felhasználó nem található!', 404);
    }

    // Ellenőrzés, hogy a termék alkuképes-e
    if (!product.isNegotiable) {
      return createError('Ez a termék nem alkuképes!', 400);
    }

    // Ellenőrzés, hogy a termék aktív-e
    if (product.status !== 'active') {
      return createError('Ez a termék jelenleg nem elérhető!', 400);
    }

    // Ellenőrzés, hogy a vásárló nem saját termékre tesz-e ajánlatot
    if (product.sellerId === buyerId) {
      return createError('Saját termékre nem tehetsz ajánlatot!', 400);
    }

    // Ajánlott összeg ellenőrzése
    if (isNaN(amount) || amount <= 0) {
      return createError('Az ajánlati ár pozitív szám kell legyen!', 400);
    }

    // Minimális ajánlati összeg ellenőrzése (a termék árának 50%-a)
    const minOfferAmount = product.price * 0.5;
    if (amount < minOfferAmount) {
      return createError(`Az ajánlati ár minimum ${minOfferAmount} Ft kell legyen!`, 400);
    }

    // Ellenőrzés, hogy van-e már nyitott ajánlat a vásárlótól
    const existingOffer = db.offers.find(offer =>
      offer.productId === productId &&
      offer.buyerId === buyerId &&
      ['pending', 'countered'].includes(offer.status)
    );

    if (existingOffer) {
      // Meglévő ajánlat frissítése
      existingOffer.amount = amount;
      existingOffer.message = message;
      existingOffer.createdAt = new Date();
      existingOffer.status = 'pending';
      existingOffer.counterOffer = null;
      existingOffer.responseMessage = null;

      return {
        success: true,
        message: 'Ajánlatodat frissítettük!',
        offer: existingOffer
      };
    }

    // Új ajánlat létrehozása
    const newOffer = new Offer(
      generateId('offer'),
      productId,
      buyerId,
      product.sellerId,
      amount,
      message,
      'pending',
      new Date()
    );

    // Mentés az adatbázisba
    db.offers.push(newOffer);

    // Értesítés küldése az eladónak (valós rendszerben)
    // notificationService.sendOfferNotification(product.sellerId, newOffer);

    return {
      success: true,
      message: 'Ajánlatodat sikeresen elküldtük!',
      offer: newOffer
    };
  },

  /**
   * Ajánlat kezelése (elfogadás, elutasítás, viszontajánlat)
   * @param {string} offerId - Az ajánlat azonosítója
   * @param {string} action - A végrehajtandó művelet (accept, reject, counter)
   * @param {Object} data - További adatok a művelethez
   * @param {string} userId - A műveletet végrehajtó felhasználó azonosítója
   * @returns {Object} - Az eredmény vagy hibaüzenet
   */
  handleOffer: function(offerId, action, data, userId) {
    // Ajánlat keresése
    const offer = db.offers.find(offer => offer.id === offerId);
    if (!offer) {
      return createError('Az ajánlat nem található!', 404);
    }

    // Jogosultság ellenőrzése
    if (offer.sellerId !== userId) {
      return createError('Nincs jogosultságod kezelni ezt az ajánlatot!', 403);
    }

    // Ellenőrzés, hogy az ajánlat kezelhető-e még
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return createError('Ez az ajánlat már nem módosítható!', 400);
    }

    // Termék keresése
    const product = db.products.find(product => product.id === offer.productId);
    if (!product || product.status !== 'active') {
      return createError('A termék nem elérhető!', 400);
    }

    // Művelet végrehajtása
    if (action === 'accept') {
      // Ajánlat elfogadása
      offer.status = 'accepted';

      // Opcionális válaszüzenet
      if (data.message) {
        offer.responseMessage = data.message;
      }

      // Egyéb ajánlatok elutasítása ugyanerre a termékre
      db.offers.forEach(otherOffer => {
              if (otherOffer.id !== offerId && otherOffer.productId === offer.productId && ['pending', 'countered'].includes(otherOffer.status)) {
                otherOffer.status = 'rejected';
                otherOffer.responseMessage = 'Egy másik ajánlat elfogadásra került.';
              }
            });

            // Termék státuszának frissítése
            product.status = 'sold';
            product.buyerId = offer.buyerId;
            product.soldAt = new Date();

            // Értesítés küldése a vásárlónak (valós rendszerben)
            // notificationService.sendOfferAcceptedNotification(offer.buyerId, offer);

            return {
              success: true,
              message: 'Ajánlat elfogadva!',
              offer: offer
            };
          } else if (action === 'reject') {
            // Ajánlat elutasítása
            offer.status = 'rejected';

            // Opcionális válaszüzenet
            if (data.message) {
              offer.responseMessage = data.message;
            }

            // Értesítés küldése a vásárlónak (valós rendszerben)
            // notificationService.sendOfferRejectedNotification(offer.buyerId, offer);

            return {
              success: true,
              message: 'Ajánlat elutasítva!',
              offer: offer
            };
          } else if (action === 'counter') {
            // Viszontajánlat ellenőrzése
            if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
              return createError('A viszontajánlati ár pozitív szám kell legyen!', 400);
            }

            // Maximum viszontajánlat ellenőrzése (eredeti ár 120%-a)
            const maxCounterAmount = product.price * 1.2;
            if (data.amount > maxCounterAmount) {
              return createError(`A viszontajánlati ár maximum ${maxCounterAmount} Ft lehet!`, 400);
            }

            // Viszontajánlat rögzítése
            offer.status = 'countered';
            offer.counterOffer = data.amount;

            // Opcionális válaszüzenet
            if (data.message) {
              offer.responseMessage = data.message;
            }

            // Értesítés küldése a vásárlónak (valós rendszerben)
            // notificationService.sendCounterOfferNotification(offer.buyerId, offer);

            return {
              success: true,
              message: 'Viszontajánlat elküldve!',
              offer: offer
            };
          } else {
            return createError('Érvénytelen művelet!', 400);
          }
        },

        /**
         * Ajánlatok lekérdezése egy felhasználóhoz
         * @param {string} userId - A felhasználó azonosítója
       
