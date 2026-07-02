import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';
import { signJWT, getAuthUser } from './lib/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const DEFAULT_USER_ID = "user_31dQbH27HVtovbs13X2cmqefddM";
const DEFAULT_STORE_ID = "cmemkqnzm000htat8u7n8cpte";

// Authentication middleware (optional/helper)
const requireAuth = async (req, res, next) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// 1. POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const userId = `usr_${randomSuffix}`;

    const defaultAvatars = ["profile_pic1", "profile_pic2", "profile_pic3"];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        password: passwordHash,
        image: randomAvatar,
        cart: JSON.stringify({})
      }
    });

    const token = await signJWT({ userId: user.id });

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/'
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        cart: {}
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// 2. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        store: true,
        Address: true
      }
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = await signJWT({ userId: user.id });

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        cart: JSON.parse(user.cart),
        Address: user.Address,
        store: user.store
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// 3. POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  try {
    res.cookie('session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
});

// 4. GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        cart: JSON.parse(user.cart),
        Address: user.Address,
        store: user.store
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Failed to authenticate session' });
  }
});

// 5. GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const category = req.query.category;
    const search = req.query.search;

    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    if (search) {
      whereClause.name = {
        contains: search
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        store: true,
        rating: {
          include: {
            user: true
          }
        }
      }
    });

    const formattedProducts = products.map(product => ({
      ...product,
      images: JSON.parse(product.images)
    }));

    return res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 6. POST /api/products
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, mrp, price, images, category, storeId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp: parseFloat(mrp),
        price: parseFloat(price),
        images: JSON.stringify(images),
        category,
        storeId
      }
    });

    return res.json({
      ...product,
      images: JSON.parse(product.images)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// 7. PATCH /api/products
app.patch('/api/products', async (req, res) => {
  try {
    const { productId, inStock } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: { inStock }
    });

    return res.json({
      success: true,
      product: {
        ...product,
        images: JSON.parse(product.images)
      }
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({ error: 'Failed to update product stock' });
  }
});

// 8. GET /api/user
app.get('/api/user', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      include: {
        Address: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      ...user,
      cart: JSON.parse(user.cart)
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 9. GET /api/coupon
app.get('/api/coupon', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Code parameter is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    return res.json(coupon);
  } catch (error) {
    console.error('Error checking coupon:', error);
    return res.status(500).json({ error: 'Failed to verify coupon' });
  }
});

// 10. GET /api/dashboard/admin
app.get('/api/dashboard/admin', async (req, res) => {
  try {
    const productsCount = await prisma.product.count();
    const storesCount = await prisma.store.count();
    const orders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const ordersCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return res.json({
      products: productsCount,
      revenue: Math.round(totalRevenue * 100) / 100,
      orders: ordersCount,
      stores: storesCount,
      allOrders: orders
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 11. GET /api/dashboard/store
app.get('/api/dashboard/store', async (req, res) => {
  try {
    const totalProducts = await prisma.product.count({
      where: { storeId: DEFAULT_STORE_ID }
    });

    const orders = await prisma.order.findMany({
      where: { storeId: DEFAULT_STORE_ID }
    });
    const totalOrders = orders.length;
    const totalEarnings = orders.reduce((sum, order) => sum + order.total, 0);

    const ratings = await prisma.rating.findMany({
      where: {
        product: { storeId: DEFAULT_STORE_ID }
      },
      include: {
        user: true,
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      totalProducts,
      totalOrders,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      ratings: ratings.map(r => {
        let parsedImages = [];
        try {
          parsedImages = typeof r.product.images === 'string' ? JSON.parse(r.product.images) : r.product.images;
        } catch (e) {
          parsedImages = r.product.images;
        }
        return {
          ...r,
          product: {
            ...r.product,
            images: parsedImages
          }
        };
      })
    });
  } catch (error) {
    console.error('Error fetching store dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 12. POST /api/address
app.post('/api/address', requireAuth, async (req, res) => {
  try {
    const { name, email, street, city, state, zip, country, phone } = req.body;

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        name,
        email,
        street,
        city,
        state,
        zip: String(zip),
        country,
        phone
      }
    });

    return res.json({ success: true, address });
  } catch (error) {
    console.error('Error creating address:', error);
    return res.status(500).json({ error: 'Failed to create address' });
  }
});

// 13. POST /api/cart
app.post('/api/cart', requireAuth, async (req, res) => {
  try {
    const { cartItems } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        cart: JSON.stringify(cartItems)
      }
    });

    return res.json({ success: true, cart: JSON.parse(updatedUser.cart) });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
});

// 14. GET /api/orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOrders = orders.map(order => {
      let parsedCoupon = {};
      try {
        parsedCoupon = typeof order.coupon === 'string' ? JSON.parse(order.coupon) : order.coupon;
      } catch (e) {
        parsedCoupon = order.coupon;
      }

      return {
        ...order,
        coupon: parsedCoupon,
        orderItems: order.orderItems.map(item => {
          let parsedImages = [];
          try {
            parsedImages = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
          } catch (e) {
            parsedImages = item.product.images;
          }
          return {
            ...item,
            product: {
              ...item.product,
              images: parsedImages
            }
          };
        })
      };
    });

    return res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 15. POST /api/orders
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { addressId, paymentMethod, isCouponUsed, coupon, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const itemsWithStore = items.map(item => {
      const prod = dbProducts.find(p => p.id === item.productId);
      return {
        ...item,
        storeId: prod ? prod.storeId : null
      };
    }).filter(item => item.storeId !== null);

    const storeGroups = {};
    itemsWithStore.forEach(item => {
      if (!storeGroups[item.storeId]) {
        storeGroups[item.storeId] = [];
      }
      storeGroups[item.storeId].push(item);
    });

    const createdOrders = [];

    for (const [storeId, groupItems] of Object.entries(storeGroups)) {
      let groupTotal = groupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      let appliedCoupon = coupon || {};
      if (isCouponUsed && coupon && coupon.discount) {
        groupTotal = Math.max(0, groupTotal - (groupTotal * (coupon.discount / 100)));
      }

      const order = await prisma.order.create({
        data: {
          total: groupTotal,
          userId: req.user.id,
          storeId,
          addressId,
          paymentMethod,
          isCouponUsed: !!isCouponUsed,
          coupon: JSON.stringify(appliedCoupon),
          orderItems: {
            create: groupItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: true
        }
      });
      createdOrders.push(order);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        cart: JSON.stringify({})
      }
    });

    return res.json({ success: true, orders: createdOrders });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// 16. GET /api/orders/store
app.get('/api/orders/store', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { storeId: DEFAULT_STORE_ID },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOrders = orders.map(order => {
      let parsedCoupon = {};
      try {
        parsedCoupon = typeof order.coupon === 'string' ? JSON.parse(order.coupon) : order.coupon;
      } catch (e) {
        parsedCoupon = order.coupon;
      }

      return {
        ...order,
        coupon: parsedCoupon,
        orderItems: order.orderItems.map(item => {
          let parsedImages = [];
          try {
            parsedImages = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
          } catch (e) {
            parsedImages = item.product.images;
          }
          return {
            ...item,
            product: {
              ...item.product,
              images: parsedImages
            }
          };
        })
      };
    });

    return res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching store orders:', error);
    return res.status(500).json({ error: 'Failed to fetch store orders' });
  }
});

// 17. PATCH /api/orders/store
app.patch('/api/orders/store', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 18. POST /api/ratings
app.post('/api/ratings', async (req, res) => {
  try {
    const { rating, review, productId, orderId } = req.body;

    const ratingRecord = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        review,
        userId: DEFAULT_USER_ID,
        productId,
        orderId
      }
    });

    return res.json({ success: true, rating: ratingRecord });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ error: 'Failed to create rating' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
