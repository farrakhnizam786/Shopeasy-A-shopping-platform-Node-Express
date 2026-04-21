require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // Electronics (20)
  { name: 'Sony WH-1000XM5 Headphones', price: 24999, category: 'Electronics', description: 'Industry-leading noise canceling wireless headphones with 30-hour battery life.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { name: 'Apple AirPods Pro 2nd Gen', price: 19999, category: 'Electronics', description: 'Active noise cancellation, transparency mode, adaptive audio for all-day comfort.', image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80' },
  { name: 'Samsung 65" 4K QLED TV', price: 89999, category: 'Electronics', description: 'Quantum HDR, 120Hz refresh rate, and Dolby Atmos for cinematic experience.', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80' },
  { name: 'MacBook Air M3 13"', price: 114900, category: 'Electronics', description: '18-hour battery, silent fanless design, stunning Liquid Retina display.', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80' },
  { name: 'iPad Pro 12.9" M4', price: 99900, category: 'Electronics', description: 'Ultra Retina XDR display with ProMotion technology and Apple Pencil Pro support.', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80' },
  { name: 'Canon EOS R6 Mark II', price: 229990, category: 'Electronics', description: '40fps continuous shooting, 6K oversampled video, IBIS 8-stop stabilization.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80' },
  { name: 'OnePlus 12 5G', price: 64999, category: 'Electronics', description: 'Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W SUPERVOOC charging.', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80' },
  { name: 'Bose SoundLink Max Speaker', price: 32999, category: 'Electronics', description: 'Deep bass, 20-hour playtime, IP67 waterproof, strap for portability.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
  { name: 'Dell XPS 15 Laptop', price: 159990, category: 'Electronics', description: 'OLED display, Intel Core i9, RTX 4070, 32GB RAM for pro workflows.', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80' },
  { name: 'Gaming Mouse Logitech G Pro X', price: 8499, category: 'Electronics', description: 'HERO 25K sensor, 100-25,600 DPI, ultra-lightweight 61g design.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80' },
  { name: 'Samsung Galaxy S24 Ultra', price: 129999, category: 'Electronics', description: 'Titanium frame, S Pen, 200MP camera, 12GB RAM, 5000mAh battery.', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80' },
  { name: 'JBL Flip 6 Bluetooth Speaker', price: 12999, category: 'Electronics', description: 'Powerful sound, IP67 dustproof and waterproof, 12 hours playtime.', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80' },
  { name: 'Mechanical Keyboard HyperX', price: 7499, category: 'Electronics', description: 'Red linear switches, per-key RGB, aircraft-grade aluminum frame.', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80' },
  { name: 'Smart Watch Apple Watch Series 9', price: 41900, category: 'Electronics', description: 'Health monitoring, crash detection, sleep tracking, always-on retina display.', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80' },
  { name: 'Philips Hue Smart Bulbs 4-Pack', price: 5999, category: 'Electronics', description: 'Millions of colors, voice control, schedules via app, 25,000 hours life.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { name: 'Kindle Paperwhite 11th Gen', price: 13999, category: 'Electronics', description: 'Glare-free 6.8" display, adjustable warm light, 10-week battery life.', image: 'https://images.unsplash.com/photo-1491841651911-c44484a37e93?w=400&q=80' },
  { name: 'GoPro Hero 12 Black', price: 39990, category: 'Electronics', description: 'HyperSmooth 6.0, 5.3K60 video, 27MP photos, waterproof to 10m.', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80' },
  { name: 'Nvidia RTX 4090 GPU', price: 199000, category: 'Electronics', description: '24GB GDDR6X, triple fans, for 4K gaming and AI-accelerated workloads.', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80' },
  { name: 'Anker 27W USB-C Charger', price: 1799, category: 'Electronics', description: 'Fast charging Nano Pro, PIQ 3.0, fits in a pocket, works with all devices.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Ring Video Doorbell Pro 2', price: 18999, category: 'Electronics', description: '3D motion detection, head-to-toe HD video, two-way talk, night vision.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },

  // Fashion (20)
  { name: 'Nike Air Max 270', price: 12995, category: 'Fashion', description: 'Max Air heel unit, breathable mesh upper, foam midsole for all-day comfort.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { name: 'Levi\'s 511 Slim Jeans', price: 3999, category: 'Fashion', description: 'Slim fit from hip to ankle, stretch denim, classic 5-pocket styling.', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { name: 'Gucci Leather Wallet', price: 24500, category: 'Fashion', description: 'Italian leather, GG logo, 8 card slots, zip coin pocket.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80' },
  { name: 'Ray-Ban Aviator Classic', price: 9500, category: 'Fashion', description: 'Metal frame, crystal lenses, 58mm, UV protection, iconic aviator profile.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80' },
  { name: 'Allen Solly Formal Shirt', price: 1499, category: 'Fashion', description: 'Wrinkle-free cotton blend, slim fit, spread collar, business casual.', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80' },
  { name: 'Puma Virat Kohli Jersey', price: 2499, category: 'Fashion', description: 'dryCELL moisture wicking, slim cut, recycled polyester, bold logo.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
  { name: 'Adidas Ultraboost 23', price: 16999, category: 'Fashion', description: 'BOOST midsole, Primeknit+ upper, Continental rubber outsole.', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80' },
  { name: 'Louis Philippe Blazer', price: 8999, category: 'Fashion', description: 'Single-breasted, notch lapel, half canvas, premium wool blend fabric.', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80' },
  { name: 'H&M Basic T-Shirt 3-Pack', price: 999, category: 'Fashion', description: 'Jersey cotton, crew neck, relaxed fit, machine washable, 3 colors.', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80' },
  { name: 'Woodland Trekking Shoes', price: 4699, category: 'Fashion', description: 'Genuine leather upper, rubber lug sole, ankle support for rugged terrain.', image: 'https://images.unsplash.com/photo-1518894781321-630e638d0742?w=400&q=80' },
  { name: 'Michael Kors Tote Bag', price: 18999, category: 'Fashion', description: 'Saffiano leather, gold-tone hardware, top zip closure, 3 compartments.', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
  { name: 'Calvin Klein Perfume 100ml', price: 5499, category: 'Fashion', description: 'CK One Eau de Toilette, fresh floral scent, unisex, long-lasting formula.', image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80' },
  { name: 'Casio G-Shock Watch', price: 7999, category: 'Fashion', description: 'Shock resistant, 200m water resistant, solar powered, world time.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { name: 'Zara Floral Maxi Dress', price: 3999, category: 'Fashion', description: 'Flowy chiffon fabric, V-neckline, adjustable straps, summer ready.', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80' },
  { name: 'Fossil Leather Belt', price: 2299, category: 'Fashion', description: 'Full-grain leather, antique brass buckle, 35mm width, sizes 28-44.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { name: 'Wrangler Cargo Shorts', price: 1799, category: 'Fashion', description: 'Relaxed fit, 6-pocket cargo design, twill fabric, multi-use utility.', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80' },
  { name: 'Skechers Go Walk Sandals', price: 2599, category: 'Fashion', description: 'Machine washable, ultra-lightweight, contoured cushion footbed.', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80' },
  { name: 'Tommy Hilfiger Cap', price: 1799, category: 'Fashion', description: 'Embroidered logo, adjustable strap, cotton twill, structured crown.', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80' },
  { name: 'US Polo Polo T-Shirt', price: 1299, category: 'Fashion', description: 'Piqué cotton, ribbed collar and cuffs, embroidered horse logo, 5 colors.', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80' },
  { name: 'Hanes Women\'s Hoodie', price: 1599, category: 'Fashion', description: 'Fleece lining, kangaroo pocket, drawstring hood, oversized fit.', image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80' },

  // Home & Living (15)
  { name: 'Dyson V15 Detect Vacuum', price: 64900, category: 'Home & Living', description: 'Laser detects hidden dirt, HEPA filtration, 60-min runtime, LCD screen.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Philips Air Fryer XXL', price: 12999, category: 'Home & Living', description: '7.3L capacity, Digital touchscreen, 13-in-1 cooking programs, rapid hot air.', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
  { name: 'IKEA KALLAX Shelf Unit', price: 7499, category: 'Home & Living', description: '4x4 cube grid, particleboard, can be used as room divider, TV stand, bookshelf.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { name: 'Morphy Richards Coffee Maker', price: 5999, category: 'Home & Living', description: '1.8L glass carafe, built-in grinder, keep warm plate, brew strength selector.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
  { name: 'Prestige Induction Cooktop', price: 3599, category: 'Home & Living', description: '2000W power, 7 power levels, touch controls, auto-off safety, feather touch.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
  { name: 'Sleep Soft Memory Foam Pillow', price: 1499, category: 'Home & Living', description: 'Bamboo cover, cooling gel foam, adjustable fill, hypoallergenic fabric.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80' },
  { name: 'Doctor Dreams Mattress Queen', price: 22999, category: 'Home & Living', description: 'Foam core, orthopedic support, breathable, 7-zone pressure relief, 10yr warranty.', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80' },
  { name: 'Usha Table Fan 400mm', price: 2699, category: 'Home & Living', description: '3-blade design, 3-speed settings, oscillation, safety guard, 12-month warranty.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Kitchen Knife Set 7-Piece', price: 3999, category: 'Home & Living', description: 'German stainless steel, full tang, ergonomic handles, honing rod included.', image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80' },
  { name: 'Pigeon Non-Stick Cookware Set', price: 2499, category: 'Home & Living', description: '5-piece set, aluminium body, PFOA-free coating, induction compatible, glass lids.', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80' },
  { name: 'Natraj Wall Clock 30cm', price: 799, category: 'Home & Living', description: 'Silent sweep movement, wooden frame, Roman numerals, antique finish design.', image: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=400&q=80' },
  { name: 'Borosil Glass Dinner Set 18pcs', price: 4499, category: 'Home & Living', description: 'Borosilicate glass, microwave safe, scratch resistant, dishwasher safe.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&q=80' },
  { name: 'Havells Room Heater 2000W', price: 3299, category: 'Home & Living', description: 'Fan forced, 2-heat settings, overheat protection, cool-touch body.', image: 'https://images.unsplash.com/photo-1622218036836-2e0c5bb6d1aa?w=400&q=80' },
  { name: 'Urban Ladder Sofa 3-Seater', price: 34999, category: 'Home & Living', description: 'Solid wood frame, high resilience foam, velvet upholstery, 5yr warranty.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { name: 'Mi Smart Speaker 40W', price: 3999, category: 'Home & Living', description: 'Alexa built-in, 360° sound, bass radiator, fabric design, WiFi + Bluetooth.', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&q=80' },

  // Sports (12)
  { name: 'Yonex Badminton Racket', price: 4999, category: 'Sports', description: 'Isometric head shape, graphite shaft, 3UG5 weight, extra-slim shaft design.', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80' },
  { name: 'Nivia Football Pro', price: 1499, category: 'Sports', description: 'Synthetic PU cover, 32-panel construction, FIFA quality, size 5.', image: 'https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=400&q=80' },
  { name: 'Cosco Cricket Bat Kashmir Willow', price: 2799, category: 'Sports', description: 'Full size, short handle, rounded edges, original Kashmir willow wood.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80' },
  { name: 'Fitbit Charge 6', price: 14999, category: 'Sports', description: 'Built-in GPS, heart rate, SpO2, sleep tracking, 7-day battery, swim-proof.', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80' },
  { name: 'Decathlon Yoga Mat 6mm', price: 1299, category: 'Sports', description: 'Non-slip surface, eco-friendly TPE foam, 185x61cm, carrying strap included.', image: 'https://images.unsplash.com/photo-1601925228876-b30eadc8c27a?w=400&q=80' },
  { name: 'Vector X Gym Gloves', price: 599, category: 'Sports', description: 'Lycra back, leather palm, wrist wrap support, anti-slip grip dots.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { name: 'Boldfit Protein Shaker 700ml', price: 499, category: 'Sports', description: 'BPA-free, leak-proof, mesh mixer, measurement markings, wide mouth.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { name: 'Reebok Running Shoes Floatride', price: 8999, category: 'Sports', description: 'Floatride Energy foam, engineered mesh upper, heel clip for stability.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { name: 'Speedo Swim Goggles', price: 1299, category: 'Sports', description: 'UV protection, anti-fog lenses, wide view, silicone strap, tri-color.', image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&q=80' },
  { name: 'SG Cricket Batting Gloves', price: 2199, category: 'Sports', description: 'Full leather palm, foam back, bamboo spandex fingers, right hand.', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80' },
  { name: 'TRX Suspension Trainer Pro', price: 12999, category: 'Sports', description: 'Commercial grade, door anchor, extension strap, 30+ exercises, 500lb capacity.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
  { name: 'Spalding NBA Basketball Size 7', price: 3299, category: 'Sports', description: 'Official NBA size, deep pebbling, Zip channel design, rubber construction.', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80' },

  // Beauty (12)
  { name: 'Lakme 9-to-5 Foundation', price: 699, category: 'Beauty', description: 'SPF 20, oil-free, 24hr coverage, natural matte finish, 12 shades.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80' },
  { name: 'Maybelline Sky High Mascara', price: 599, category: 'Beauty', description: 'Bamboo brush, volumizing, lengthening formula, holds curl, smudge-proof.', image: 'https://images.unsplash.com/photo-1559304422-8d1f0e0c14b4?w=400&q=80' },
  { name: 'Neutrogena Hydro Boost Gel Cream', price: 1399, category: 'Beauty', description: 'Hyaluronic acid gel, instantly quenches skin, non-greasy, fragrance-free.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80' },
  { name: 'The Ordinary Niacinamide 10%', price: 799, category: 'Beauty', description: 'Reduces pore appearance, brightens, controls sebum, zinc 1% added.', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80' },
  { name: 'Park Avenue Deo Spray 150ml', price: 299, category: 'Beauty', description: 'Long-lasting fragrance, antiperspirant formula, 48-hour protection.', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80' },
  { name: 'Biotique Bio Sunscreen SPF 50', price: 449, category: 'Beauty', description: 'Broad spectrum UVA/UVB, non-greasy daily use, botanical ingredients.', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80' },
  { name: 'L\'Oréal Elvive Shampoo 400ml', price: 549, category: 'Beauty', description: 'Extraordinary oil, damaged hair repair, shine boost, paraben-free formula.', image: 'https://images.unsplash.com/photo-1527799820374-87036dcd7484?w=400&q=80' },
  { name: 'SUGAR Matte Attack Lipstick', price: 499, category: 'Beauty', description: 'Long-wear formula, feels light, intense color in one swipe, 30+ shades.', image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2919?w=400&q=80' },
  { name: 'Himalaya Face Wash Purifying Neem', price: 180, category: 'Beauty', description: 'Deep cleansing, removes excess oil, neem and turmeric extracts, 150ml.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80' },
  { name: 'Revlon ColorStay Eyeliner', price: 549, category: 'Beauty', description: 'Smudge-proof, water-resistant, 16-hour wear, built-in smudger tip.', image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&q=80' },
  { name: 'Mamaearth Vitamin C Face Serum', price: 749, category: 'Beauty', description: '1% retinol + 10% Vitamin C, brightens, anti-aging, gentle daily formula.', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=400&q=80' },
  { name: 'Matrix Biolage Conditioner 400g', price: 899, category: 'Beauty', description: 'Pro-keratin complex, smoothing formula, for damaged hair, salon-grade.', image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=400&q=80' },

  // Books (10)
  { name: 'Atomic Habits by James Clear', price: 399, category: 'Books', description: 'Proven framework for improving 1% every day, building good habits and breaking bad ones.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80' },
  { name: 'The Psychology of Money', price: 349, category: 'Books', description: 'Morgan Housel on timeless lessons about wealth, greed, and happiness.', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80' },
  { name: 'Rich Dad Poor Dad', price: 299, category: 'Books', description: 'Robert Kiyosaki\'s financial literacy classic — what the rich teach their kids.', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' },
  { name: 'Harry Potter Complete Box Set', price: 3499, category: 'Books', description: 'All 7 books in a premium hardcover box set with illustrated covers.', image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&q=80' },
  { name: 'NCERT Class 12 Physics', price: 249, category: 'Books', description: 'Updated 2024 edition, full syllabus with solved examples and exercises.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80' },
  { name: 'Zero to One by Peter Thiel', price: 319, category: 'Books', description: 'Notes on startups, innovation and building the future — a must-read for founders.', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80' },
  { name: 'The Alchemist by Paulo Coelho', price: 275, category: 'Books', description: 'Inspiring tale of Santiago\'s journey to find personal legend and treasure.', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80' },
  { name: 'Clean Code by Robert Martin', price: 1299, category: 'Books', description: 'Handbook of agile software craftsmanship — essential for every programmer.', image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&q=80' },
  { name: 'Sapiens by Yuval Noah Harari', price: 399, category: 'Books', description: 'Brief history of humankind — how Homo sapiens conquered the world.', image: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400&q=80' },
  { name: 'The Lean Startup by Eric Ries', price: 349, category: 'Books', description: 'Build-measure-learn loop for entrepreneurs to create sustainable businesses.', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80' },

  // Food & Drinks (7)
  { name: 'Nescafé Gold Blend 200g', price: 699, category: 'Food & Drinks', description: 'Premium roasted coffee, smooth and rich taste, airtight jar, 100% Arabica.', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { name: 'Organic India Tulsi Green Tea', price: 349, category: 'Food & Drinks', description: '25 eco-friendly tea bags, antioxidant-rich, certified organic, immunity booster.', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80' },
  { name: 'Yoga Bar Dark Chocolate 100g', price: 199, category: 'Food & Drinks', description: '70% cocoa, no refined sugar, gluten-free, 20g protein per 100g serving.', image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400&q=80' },
  { name: 'Tata Salt Lite 1kg', price: 55, category: 'Food & Drinks', description: '15% lower sodium, iodized, free-flowing crystal salt, vacuum evaporated.', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80' },
  { name: 'Farmley Premium Dry Fruits Mix', price: 649, category: 'Food & Drinks', description: 'Cashews, almonds, raisins, figs — 500g premium roasted and raw mix.', image: 'https://images.unsplash.com/photo-1536396123481-991b5b636cbb?w=400&q=80' },
  { name: 'Epigamia Greek Yogurt 400g', price: 149, category: 'Food & Drinks', description: 'Real fruit, high protein, no artificial flavors, live active cultures.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { name: 'Cadbury Celebrations Gift Pack', price: 499, category: 'Food & Drinks', description: 'Assorted dairy milk chocolates — Silk, Crunchie, Gems in premium gift box.', image: 'https://images.unsplash.com/photo-1548741487-18d363dc4469?w=400&q=80' },

  // Toys (7)
  { name: 'LEGO Technic Bugatti Chiron', price: 14999, category: 'Toys', description: '3599 pieces, working steering, transmission, engine pistons — collector model.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Hasbro Monopoly Classic Edition', price: 1299, category: 'Toys', description: 'Original property trading game, 8 classic tokens, color-coded properties.', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&q=80' },
  { name: 'Funskool Scrabble Deluxe', price: 799, category: 'Toys', description: 'Turntable board, 100 tiles, 4 tile racks — classic word building game.', image: 'https://images.unsplash.com/photo-1606503153255-59d5e417b812?w=400&q=80' },
  { name: 'Hot Wheels 20-Car Gift Pack', price: 1299, category: 'Toys', description: '20 exclusive die-cast vehicles, 1:64 scale, collectors edition, assorted styles.', image: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=80' },
  { name: 'Play-Doh Ultimate Color Collection', price: 1899, category: 'Toys', description: '65 cans, bright and neon colors, non-toxic formula, modeling compound set.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'RC Monster Truck Off-Road', price: 2499, category: 'Toys', description: '1:14 scale, 4WD, 30 km/h, 2.4GHz controller, rechargeable battery, 45min runtime.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Barbie Dreamhouse 2024', price: 8999, category: 'Toys', description: '75+ pieces, 3 floors, slide, pool, elevator, lights and sounds, 8 rooms.', image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&q=80' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    const existing = await Product.countDocuments();
    if (existing < 10) {
      await Product.insertMany(products);
      console.log(`✅ Seeded ${products.length} products!`);
    } else {
      console.log(`ℹ️  ${existing} products already in DB. Skipping seed. Delete all products first if you want to re-seed.`);
    }

    await mongoose.disconnect();
    console.log('👋 Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
