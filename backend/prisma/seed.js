const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.orderItem.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.store.deleteMany()
  await prisma.address.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()

  // 1. Seed User
  const user = await prisma.user.create({
    data: {
      id: "user_31dQbH27HVtovbs13X2cmqefddM",
      name: "GreatStack",
      email: "greatstack@example.com",
      image: "gs_logo",
      cart: JSON.stringify({})
    }
  })
  console.log('Seeded User')

  // 2. Seed Store
  const store = await prisma.store.create({
    data: {
      id: "cmemkqnzm000htat8u7n8cpte",
      userId: user.id,
      name: "Happy Shop",
      description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
      username: "happyshop",
      address: "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
      status: "approved",
      isActive: true,
      logo: "happy_store",
      email: "happyshop@example.com",
      contact: "+0 123456789"
    }
  })
  console.log('Seeded Store')

  // 3. Seed Products
  const productsData = [
    {
      id: "prod_1",
      name: "Modern table lamp",
      description: "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty. Enhance your audio experience with this earbuds. Indulge yourself in a world of pure sound with 50 hours of uninterrupted playtime. Equipped with the cutting-edge Zen Mode Tech ENC and BoomX Tech, prepare to be enthralled by a symphony of crystal-clear melodies.",
      mrp: 40,
      price: 29,
      images: JSON.stringify(["product_img1", "product_img2", "product_img3", "product_img4"]),
      category: "Decoration",
      storeId: store.id
    },
    {
      id: "prod_2",
      name: "Smart speaker gray",
      description: "Smart speaker with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 50,
      price: 29,
      images: JSON.stringify(["product_img2"]),
      category: "Speakers",
      storeId: store.id
    },
    {
      id: "prod_3",
      name: "Smart watch white",
      description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 60,
      price: 29,
      images: JSON.stringify(["product_img3"]),
      category: "Watch",
      storeId: store.id
    },
    {
      id: "prod_4",
      name: "Wireless headphones",
      description: "Wireless headphones with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 70,
      price: 29,
      images: JSON.stringify(["product_img4"]),
      category: "Headphones",
      storeId: store.id
    },
    {
      id: "prod_5",
      name: "Smart watch black",
      description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 49,
      price: 29,
      images: JSON.stringify(["product_img5"]),
      category: "Watch",
      storeId: store.id
    },
    {
      id: "prod_6",
      name: "Security Camera",
      description: "Security Camera with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 59,
      price: 29,
      images: JSON.stringify(["product_img6"]),
      category: "Camera",
      storeId: store.id
    },
    {
      id: "prod_7",
      name: "Smart Pen for iPad",
      description: "Smart Pen for iPad with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 89,
      price: 29,
      images: JSON.stringify(["product_img7"]),
      category: "Pen",
      storeId: store.id
    },
    {
      id: "prod_8",
      name: "Home Theater",
      description: "Home Theater with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 99,
      price: 29,
      images: JSON.stringify(["product_img8"]),
      category: "Theater",
      storeId: store.id
    },
    {
      id: "prod_9",
      name: "Apple Wireless Earbuds",
      description: "Apple Wireless Earbuds with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 89,
      price: 29,
      images: JSON.stringify(["product_img9"]),
      category: "Earbuds",
      storeId: store.id
    },
    {
      id: "prod_10",
      name: "Apple Smart Watch",
      description: "Apple Smart Watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 179,
      price: 29,
      images: JSON.stringify(["product_img10"]),
      category: "Watch",
      storeId: store.id
    },
    {
      id: "prod_11",
      name: "RGB Gaming Mouse",
      description: "RGB Gaming Mouse with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 39,
      price: 29,
      images: JSON.stringify(["product_img11"]),
      category: "Mouse",
      storeId: store.id
    },
    {
      id: "prod_12",
      name: "Smart Home Cleaner",
      description: "Smart Home Cleaner with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 199,
      price: 29,
      images: JSON.stringify(["product_img12"]),
      category: "Cleaner",
      storeId: store.id
    }
  ]

  for (const product of productsData) {
    await prisma.product.create({ data: product })
  }
  console.log('Seeded Products')

  // 4. Seed Address
  const address = await prisma.address.create({
    data: {
      id: "addr_1",
      userId: user.id,
      name: "John Doe",
      email: "johndoe@example.com",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
      phone: "1234567890"
    }
  })
  console.log('Seeded Address')

  // 5. Seed Coupons
  const couponsData = [
    { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: new Date("2026-12-31T00:00:00.000Z") },
    { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: new Date("2026-12-31T00:00:00.000Z") },
    { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: new Date("2026-12-31T00:00:00.000Z") },
    { code: "OFF10", description: "10% Off for All Users", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: new Date("2026-12-31T00:00:00.000Z") },
    { code: "PLUS10", description: "20% Off for Members", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: new Date("2027-03-06T00:00:00.000Z") }
  ]

  for (const coupon of couponsData) {
    await prisma.coupon.create({ data: coupon })
  }
  console.log('Seeded Coupons')

  // 6. Seed Orders
  const order1 = await prisma.order.create({
    data: {
      id: "cmemm75h5001jtat89016h1p3",
      total: 214.2,
      status: "DELIVERED",
      userId: user.id,
      storeId: store.id,
      addressId: address.id,
      isPaid: false,
      paymentMethod: "COD",
      isCouponUsed: true,
      coupon: JSON.stringify({ code: "PLUS10", discount: 10 })
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: "prod_1",
      quantity: 1,
      price: 89
    }
  })
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: "prod_2",
      quantity: 1,
      price: 149
    }
  })

  const order2 = await prisma.order.create({
    data: {
      id: "cmemm6jv7001htat8vmm3gxaf",
      total: 421.6,
      status: "DELIVERED",
      userId: user.id,
      storeId: store.id,
      addressId: address.id,
      isPaid: false,
      paymentMethod: "COD",
      isCouponUsed: true,
      coupon: JSON.stringify({ code: "NEW20", discount: 20 })
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: "prod_3",
      quantity: 1,
      price: 229
    }
  })
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: "prod_4",
      quantity: 1,
      price: 99
    }
  })
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: "prod_5",
      quantity: 1,
      price: 199
    }
  })
  console.log('Seeded Orders')

  console.log('Database seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
