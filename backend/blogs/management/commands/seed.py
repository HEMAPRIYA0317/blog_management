from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blogs.models import Blog, Category, Comment


class Command(BaseCommand):
    help = 'Seed the database with categories, sample users, blogs, and comments'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')

        # Create categories
        categories_data = [
            {'name': 'Technology', 'slug': 'technology', 'description': 'Latest in tech, programming, and innovation'},
            {'name': 'Travel', 'slug': 'travel', 'description': 'Travel guides, tips, and adventures'},
            {'name': 'Lifestyle', 'slug': 'lifestyle', 'description': 'Health, wellness, and daily living'},
            {'name': 'Science', 'slug': 'science', 'description': 'Scientific discoveries and research'},
            {'name': 'Design', 'slug': 'design', 'description': 'UI/UX, graphic design, and creative arts'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat.slug] = cat
            status = "Created" if created else "Exists"
            self.stdout.write(f"  {status}: Category '{cat.name}'")

        # Create sample users
        users_data = [
            {'username': 'alice', 'email': 'alice@example.com', 'password': 'SecurePass123!', 'first_name': 'Alice', 'last_name': 'Johnson'},
            {'username': 'bob', 'email': 'bob@example.com', 'password': 'SecurePass123!', 'first_name': 'Bob', 'last_name': 'Smith'},
        ]

        users = {}
        for user_data in users_data:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
            users[user.username] = user
            status = "Created" if created else "Exists"
            self.stdout.write(f"  {status}: User '{user.username}'")

        # Create sample blog posts
        blogs_data = [
            {
                'title': 'Getting Started with Next.js and Django',
                'content': """Building a full-stack application with Next.js on the frontend and Django on the backend is a powerful combination.\n\nNext.js provides server-side rendering and an excellent developer experience with React. Django offers a robust ORM and mature ecosystem for building REST APIs.\n\n## Key Benefits\n\n1. **Type Safety**: TypeScript on the frontend catches errors early\n2. **SEO Friendly**: Next.js SSR ensures your blog content is indexable\n3. **Scalable Backend**: Django's ORM handles complex business logic\n4. **JWT Authentication**: Stateless auth that works across both stacks""",
                'excerpt': 'Learn how to build a modern full-stack application combining Next.js and Django REST Framework.',
                'author': users['alice'],
                'category': categories['technology'],
                'tags': 'nextjs, django, fullstack, tutorial',
                'status': 'published',
            },
            {
                'title': 'The Art of Modern Web Design in 2026',
                'content': """Web design has evolved dramatically. Today's web experiences are immersive, interactive, and deeply personal.\n\n## Glassmorphism & Beyond\n\nModern interfaces use subtle transparency and blur effects to create depth without sacrificing readability.\n\n## Micro-Interactions Matter\n\nEvery button hover, page transition, and loading state is an opportunity to delight users.\n\n## Typography as a Design Element\n\nWith Google Fonts offering thousands of options, typography has become a primary design tool.""",
                'excerpt': 'Exploring the latest trends in web design including glassmorphism, micro-interactions, and modern typography.',
                'author': users['bob'],
                'category': categories['design'],
                'tags': 'design, ui, ux, web-design, trends',
                'status': 'published',
            },
            {
                'title': 'Exploring the Mountains of Nepal',
                'content': """Nepal is a trekker's paradise, offering some of the most breathtaking mountain scenery on Earth.\n\n## Popular Treks\n\n### Everest Base Camp\nThe classic trek takes 12-14 days and offers views of the world's highest peak.\n\n### Annapurna Circuit\nA diverse 2-3 week trek through subtropical forests and high-altitude deserts.\n\n## Practical Tips\n\n1. Acclimatize properly\n2. Hire a local guide\n3. Pack layers\n4. Bring water purification\n5. Respect local customs""",
                'excerpt': 'A comprehensive guide to trekking in Nepal — from Everest Base Camp to the Annapurna Circuit.',
                'author': users['alice'],
                'category': categories['travel'],
                'tags': 'travel, nepal, trekking, mountains, adventure',
                'status': 'published',
            },
            {
                'title': 'Understanding Quantum Computing Basics',
                'content': """Quantum computing represents a fundamental shift in how we process information.\n\n## What Makes Quantum Different?\n\n### Superposition\nA qubit can be both 0 and 1 at the same time.\n\n### Entanglement\nWhen qubits become entangled, the state of one instantly influences the other.\n\n## Real-World Applications\n\n1. **Drug Discovery**: Simulating molecular interactions\n2. **Cryptography**: Quantum-safe alternatives\n3. **Financial Modeling**: Optimizing portfolios\n4. **Climate Modeling**: More accurate simulations""",
                'excerpt': 'A beginner-friendly introduction to quantum computing, covering qubits, superposition, and entanglement.',
                'author': users['bob'],
                'category': categories['science'],
                'tags': 'quantum, computing, science, technology, physics',
                'status': 'published',
            },
            {
                'title': 'Building Healthy Habits That Stick',
                'content': """Creating lasting habits is one of the most powerful things you can do for personal growth.\n\n## The Science of Habit Formation\n\n1. **Cue**: The trigger that initiates the behavior\n2. **Craving**: The motivation behind the habit\n3. **Response**: The actual habit you perform\n4. **Reward**: The benefit you gain\n\n## Strategies That Work\n\n- Start incredibly small\n- Stack your habits\n- Design your environment\n- Track your progress""",
                'excerpt': 'Science-backed strategies for building lasting habits, from starting small to designing your environment.',
                'author': users['alice'],
                'category': categories['lifestyle'],
                'tags': 'habits, productivity, self-improvement, health',
                'status': 'published',
            },
        ]

        for blog_data in blogs_data:
            blog, created = Blog.objects.get_or_create(
                title=blog_data['title'],
                defaults=blog_data
            )
            status = "Created" if created else "Exists"
            self.stdout.write(f"  {status}: Blog '{blog.title[:50]}'")

        # Create sample comments
        comments_data = [
            {'blog_title': 'Getting Started with Next.js and Django', 'author': users['bob'], 'content': 'Great tutorial! The JWT setup was especially helpful.'},
            {'blog_title': 'The Art of Modern Web Design in 2026', 'author': users['alice'], 'content': 'The section on micro-interactions really resonated with me.'},
            {'blog_title': 'Exploring the Mountains of Nepal', 'author': users['bob'], 'content': 'Amazing! I did the Annapurna Circuit last year and it was life-changing.'},
            {'blog_title': 'Understanding Quantum Computing Basics', 'author': users['alice'], 'content': 'Finally an explanation that makes sense!'},
        ]

        for comment_data in comments_data:
            try:
                blog = Blog.objects.get(title=comment_data['blog_title'])
                comment, created = Comment.objects.get_or_create(
                    blog=blog,
                    author=comment_data['author'],
                    content=comment_data['content']
                )
                status = "Created" if created else "Exists"
                self.stdout.write(f"  {status}: Comment on '{blog.title[:40]}'")
            except Blog.DoesNotExist:
                self.stdout.write(f"  Skipped: Blog '{comment_data['blog_title']}' not found")

        self.stdout.write(self.style.SUCCESS('\nSeed data complete!'))
