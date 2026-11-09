import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.settings import RestaurantSetting
from app.models.table import RestaurantTable
from app.models.menu import MenuCategory, MenuItem
from app.core.security import get_password_hash

logger = logging.getLogger("seed")

def seed_initial_data(db: Session):
    """Seed initial development data if the database is empty."""
    # 1. Seed Admin User
    admin = db.query(User).filter(User.email == "admin@layalidubai.ae").first()
    if not admin:
        logger.info("Creating default admin account...")
        admin = User(
            email="admin@layalidubai.ae",
            hashed_password=get_password_hash("Admin@Dubai2026"),
            full_name="Chef Tariq Al-Mansoor",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        logger.info("Admin created: admin@layalidubai.ae / Admin@Dubai2026")

    # 2. Seed Restaurant Settings
    settings = db.query(RestaurantSetting).first()
    if not settings:
        logger.info("Creating default restaurant settings...")
        settings = RestaurantSetting(
            restaurant_name="Layali Dubai — Royal Lounge & Dining",
            tagline="Haute Emirati & Mediterranean Culinary Symphony",
            description="Perched in the prestigious Downtown Dubai with panoramic vistas of Burj Khalifa and the Dubai Fountain, Layali Dubai curates an unforgettable gastronomic journey blending ancient Arabian spice routes with contemporary Michelin-level artistry.",
            phone="+971 4 888 3456",
            email="reservations@layalidubai.ae",
            address="Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, United Arab Emirates",
            google_maps_url="https://maps.google.com/?q=Downtown+Dubai",
            opening_time="12:00",
            closing_time="01:00",
            slot_duration_minutes=120,
            max_guests_per_booking=12,
            booking_policy="Smart elegant dress code is required. Cancellations and modifications are complimentary up to 2 hours prior to reservation time.",
            is_accepting_reservations=True,
            announcement_banner="Now open for reservations. Experience our Dubai Sunset Dining on the Burj View Terrace."
        )
        db.add(settings)
        db.commit()

    # 3. Seed Restaurant Tables
    if db.query(RestaurantTable).count() == 0:
        logger.info("Seeding restaurant tables...")
        tables_data = [
            # Burj View Terrace (Outdoor Luxury)
            {"table_number": "TERRACE-01", "name": "Burj Fountain Front Row 1", "capacity": 2, "minimum_guests": 1, "location": "Burj View Terrace"},
            {"table_number": "TERRACE-02", "name": "Burj Fountain Front Row 2", "capacity": 2, "minimum_guests": 1, "location": "Burj View Terrace"},
            {"table_number": "TERRACE-03", "name": "Sunset Terrace Veranda 3", "capacity": 4, "minimum_guests": 2, "location": "Burj View Terrace"},
            {"table_number": "TERRACE-04", "name": "Sunset Terrace Veranda 4", "capacity": 4, "minimum_guests": 2, "location": "Burj View Terrace"},
            {"table_number": "TERRACE-05", "name": "Skyline Grand Table", "capacity": 6, "minimum_guests": 4, "location": "Burj View Terrace"},

            # Royal Majlis VIP (Private Suites)
            {"table_number": "MAJLIS-01", "name": "Al-Diwan Royal Majlis Suite", "capacity": 8, "minimum_guests": 4, "location": "Royal Majlis VIP"},
            {"table_number": "MAJLIS-02", "name": "Qasr Al-Sharq VIP Alcove", "capacity": 10, "minimum_guests": 6, "location": "Royal Majlis VIP"},
            {"table_number": "CHEF-TABLE", "name": "Chef's Private Omakase Salon", "capacity": 6, "minimum_guests": 2, "location": "Royal Majlis VIP"},

            # Main Dining Hall (Opulent Indoor Salon)
            {"table_number": "MAIN-01", "name": "Grand Salon Table 1", "capacity": 2, "minimum_guests": 1, "location": "Main Dining Hall"},
            {"table_number": "MAIN-02", "name": "Grand Salon Table 2", "capacity": 2, "minimum_guests": 1, "location": "Main Dining Hall"},
            {"table_number": "MAIN-03", "name": "Central Chandelier Booth 3", "capacity": 4, "minimum_guests": 2, "location": "Main Dining Hall"},
            {"table_number": "MAIN-04", "name": "Central Chandelier Booth 4", "capacity": 4, "minimum_guests": 2, "location": "Main Dining Hall"},
            {"table_number": "MAIN-05", "name": "Lounge Banquette 5", "capacity": 6, "minimum_guests": 3, "location": "Main Dining Hall"},
        ]
        for t_data in tables_data:
            tbl = RestaurantTable(**t_data, is_active=True)
            db.add(tbl)
        db.commit()

    # 4. Seed Menu Categories & Items
    if db.query(MenuCategory).count() == 0:
        logger.info("Seeding menu categories and luxury dishes...")
        categories_data = [
            {
                "name": "Starters & Cold Mezze",
                "slug": "starters-cold-mezze",
                "description": "Artisanal appetizers, refined mezze, and delicate cold bites crafted with Mediterranean and Levantine spices.",
                "display_order": 1,
                "items": [
                    {
                        "name": "Black Truffle Hummus Bil Lahmeh",
                        "description": "Velvety chickpea purée infused with black Perigord winter truffle, topped with spiced tender Wagyu tenderloin morsels, toasted pine nuts, and warm sourdough za'atar crisps.",
                        "price": 85.0,
                        "image_url": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": True,
                        "preparation_time_minutes": 15,
                        "allergens": "Nuts, Sesame",
                        "calories": 420
                    },
                    {
                        "name": "Smoked Burrata & Heirloom Dates",
                        "description": "Creamy artisanal burrata gently smoked over citrus wood, Medjool date reduction, pomegranate pearls, candied walnuts, and micro-mint.",
                        "price": 95.0,
                        "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": True,
                        "preparation_time_minutes": 12,
                        "allergens": "Dairy, Nuts",
                        "calories": 390
                    },
                    {
                        "name": "Crispy Calamari with Za'atar Aioli",
                        "description": "Tender Arabian Gulf calamari dusted in semolina spice crumb, served with preserved lemon sumac dip and charred lime.",
                        "price": 75.0,
                        "image_url": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": False,
                        "preparation_time_minutes": 15,
                        "allergens": "Molluscs, Gluten",
                        "calories": 360
                    },
                    {
                        "name": "Emirati Fattoush with Halloumi Brûlée",
                        "description": "Crisp romaine, vine-ripened heritage tomatoes, Persian cucumber, caramelized honey-glazed halloumi, and crispy sumac flatbread.",
                        "price": 65.0,
                        "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": False,
                        "preparation_time_minutes": 10,
                        "allergens": "Dairy, Gluten",
                        "calories": 280
                    }
                ]
            },
            {
                "name": "Royal Mains",
                "slug": "royal-mains",
                "description": "Opulent main dishes spotlighting slow-cooked heritage delicacies, fresh Gulf catches, and premium cuts.",
                "display_order": 2,
                "items": [
                    {
                        "name": "Slow-Braised Emirati Lamb Ouzi",
                        "description": "12-hour braised Australian lamb shoulder glazed with Emirati bezel spice, nestled atop fragrant saffron and cardamom jeweled basmati rice, garnished with roasted almonds and golden raisins.",
                        "price": 240.0,
                        "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": True,
                        "preparation_time_minutes": 25,
                        "allergens": "Nuts",
                        "calories": 880
                    },
                    {
                        "name": "Pan-Seared Chilean Sea Bass",
                        "description": "Wild-caught Chilean sea bass crusted with coriander and crushed pink peppercorns, served over creamy saffron lobster bisque risotto and roasted asparagus.",
                        "price": 275.0,
                        "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": True,
                        "preparation_time_minutes": 22,
                        "allergens": "Fish, Crustaceans, Dairy",
                        "calories": 620
                    },
                    {
                        "name": "Royal Saffron & Wild Mushroom Risotto",
                        "description": "Acquerello aged carnaroli rice infused with Iranian supreme saffron, morel mushrooms, 24-month aged Parmigiano Reggiano, and white truffle essence.",
                        "price": 165.0,
                        "image_url": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": False,
                        "preparation_time_minutes": 20,
                        "allergens": "Dairy",
                        "calories": 510
                    },
                    {
                        "name": "Corn-Fed Baby Chicken Makloubeh",
                        "description": "Charred organic baby chicken roasted with cinnamon bark, layered with eggplant, cauliflower, and basmati rice, served inverted with cucumber mint labneh.",
                        "price": 185.0,
                        "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": False,
                        "preparation_time_minutes": 25,
                        "allergens": "Dairy",
                        "calories": 740
                    }
                ]
            },
            {
                "name": "Charcoal Robata & Grills",
                "slug": "charcoal-robata-grills",
                "description": "Seared over aromatic binchotan charcoal with secret heritage marinades and smoked herbs.",
                "display_order": 3,
                "items": [
                    {
                        "name": "24K Gold Leaf Wagyu Ribeye MBS 9+",
                        "description": "Grade 9+ Australian Fullblood Wagyu ribeye (300g) charred to perfection over oak embers, finished with edible 24-karat gold leaf, smoked bone marrow butter, and roasted black garlic puree.",
                        "price": 495.0,
                        "image_url": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": True,
                        "preparation_time_minutes": 25,
                        "allergens": "Dairy",
                        "calories": 920
                    },
                    {
                        "name": "Jumbo Gulf Tiger Prawns Mashwi",
                        "description": "Flame-grilled jumbo Gulf prawns marinated in garlic harissa, crushed coriander seeds, and key lime butter, served with charred lemon and herb salad.",
                        "price": 260.0,
                        "image_url": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": True,
                        "preparation_time_minutes": 20,
                        "allergens": "Crustaceans, Dairy",
                        "calories": 480
                    },
                    {
                        "name": "Royal Shish Tawook & Lamb Kebab Platter",
                        "description": "Tender saffron-marinated corn-fed chicken skewer and spiced minced Awassi lamb kebab served with biwaz salad, garlic toum, and freshly baked flatbread.",
                        "price": 195.0,
                        "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": False,
                        "is_chef_special": False,
                        "preparation_time_minutes": 20,
                        "allergens": "Gluten, Dairy",
                        "calories": 710
                    }
                ]
            },
            {
                "name": "Artisanal Desserts",
                "slug": "artisanal-desserts",
                "description": "Sweet culinary finales balancing oriental rosewater, Turkish pistachio, and luscious chocolate.",
                "display_order": 4,
                "items": [
                    {
                        "name": "Pistachio Baklava San Sebastián Cheesecake",
                        "description": "Silky burnt Basque cheesecake set over a buttery crisp phyllo and crushed Antep pistachio crust, drizzled with blossom honey and served with cardamom clotted cream.",
                        "price": 75.0,
                        "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": True,
                        "preparation_time_minutes": 10,
                        "allergens": "Dairy, Nuts, Gluten",
                        "calories": 520
                    },
                    {
                        "name": "Golden Kunafa Royale",
                        "description": "Crisp golden kataifi pastry filled with warm Nabulsi sweet cheese, infused with Damask rosewater syrup and topped with crushed pistachios and 24K gold flakes.",
                        "price": 85.0,
                        "image_url": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": True,
                        "preparation_time_minutes": 15,
                        "allergens": "Dairy, Nuts, Gluten",
                        "calories": 580
                    },
                    {
                        "name": "Valrhona Dark Chocolate Fondant",
                        "description": "Warm molten 70% Guanaja chocolate cake scented with Arabian cardamom, served with Madagascar vanilla bean and camel milk gelato.",
                        "price": 70.0,
                        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": False,
                        "preparation_time_minutes": 15,
                        "allergens": "Dairy, Eggs, Gluten",
                        "calories": 590
                    }
                ]
            },
            {
                "name": "Signature Beverages & Mocktails",
                "slug": "signature-beverages-mocktails",
                "description": "Artisanal zero-proof elixirs, smoked botanical infusions, and ceremonial teas.",
                "display_order": 5,
                "items": [
                    {
                        "name": "Burj Sunset Gold Elixir",
                        "description": "Fresh passion fruit nectar, yuzu juice, organic saffron cordial, sparkling elderflower water, edible gold shimmer, and crystallized rosemary.",
                        "price": 55.0,
                        "image_url": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": True,
                        "preparation_time_minutes": 8,
                        "allergens": "None",
                        "calories": 140
                    },
                    {
                        "name": "Smoked Oudh & Blackberry Sour",
                        "description": "Crushed wild blackberries, house-made lavender agave, fresh Meyer lemon juice, egg white foam, lightly infused under a cloche with cold oak-smoked oud aroma.",
                        "price": 60.0,
                        "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": True,
                        "preparation_time_minutes": 8,
                        "allergens": "Eggs",
                        "calories": 160
                    },
                    {
                        "name": "Royal Moroccan Mint & Saffron Tea Service",
                        "description": "Ceremonial gunpowder green tea brewed tableside with fresh spearmint leaves, Iranian saffron threads, and served in gilded crystal glasses with Emirati date truffles.",
                        "price": 45.0,
                        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
                        "is_vegetarian": True,
                        "is_chef_special": False,
                        "preparation_time_minutes": 10,
                        "allergens": "Nuts (in date truffles)",
                        "calories": 90
                    }
                ]
            }
        ]

        for cat_data in categories_data:
            items_data = cat_data.pop("items")
            category = MenuCategory(**cat_data, is_active=True)
            db.add(category)
            db.commit()
            db.refresh(category)

            for item_data in items_data:
                item = MenuItem(**item_data, category_id=category.id, is_available=True)
                db.add(item)
            db.commit()

        logger.info("Menu successfully seeded.")
