import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from api.models import Item

class Command(BaseCommand):
    help = 'Seed the database with 100 random items'

    def handle(self, *args, **kwargs):
        categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Toys']
        product_names = ['Widget', 'Gadget', 'Thingamajig', 'Doodad', 'Contraption']
        
        # Optionally clear existing items
        Item.objects.all().delete()
        self.stdout.write("Cleared existing items.")

        for i in range(1, 101):
            name = f"{random.choice(product_names)} {i}"
            sku = f"SKU{i:03d}"  # e.g., SKU001, SKU002
            quantity = random.randint(1, 100)
            price = Decimal(f"{random.uniform(10.0, 500.0):.2f}")
            category = random.choice(categories)
            
            item = Item.objects.create(
                product_name=name,
                sku=sku,
                quantity=quantity,
                price=price,
                category=category,
                image_url = "https://picsum.photos/seed/${item.id}/400/200"
            )
            self.stdout.write(self.style.SUCCESS(f"Created item: {item}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded 100 items."))