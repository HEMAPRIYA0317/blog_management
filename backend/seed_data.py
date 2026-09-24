"""
Seed script to populate the database with sample data.
Run: python manage.py shell < seed_data.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_project.settings')
django.setup()

from django.contrib.auth.models import User
from blogs.models import Blog, Category, Comment

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
    print(f"  {status}: Category '{cat.name}'")

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
    print(f"  {status}: User '{user.username}' (password: SecurePass123!)")

# Create sample blog posts
blogs_data = [
    {
        'title': 'Getting Started with Next.js and Django',
        'content': """Building a full-stack application with Next.js on the frontend and Django on the backend is a powerful combination that leverages the best of both worlds.

Next.js provides server-side rendering, static site generation, and an excellent developer experience with React. Django, on the other hand, offers a robust ORM, built-in admin panel, and a mature ecosystem for building REST APIs.

## Setting Up the Backend

First, create a new Django project and install Django REST Framework:

```bash
pip install django djangorestframework djangorestframework-simplejwt
```

Configure your settings to include DRF and JWT authentication. This gives you a solid foundation for building secure APIs.

## Frontend Architecture

On the Next.js side, we use the App Router for modern React patterns. The key is setting up proper API service layers that communicate with your Django backend through JWT-authenticated requests.

## Key Benefits

1. **Type Safety**: TypeScript on the frontend catches errors early
2. **SEO Friendly**: Next.js SSR ensures your blog content is indexable
3. **Scalable Backend**: Django's ORM and middleware stack handle complex business logic
4. **JWT Authentication**: Stateless auth that works seamlessly across both stacks

This combination is ideal for content-heavy applications like blogs, e-commerce sites, and dashboards.""",
        'excerpt': 'Learn how to build a modern full-stack application combining Next.js for the frontend and Django REST Framework for the backend.',
        'author': users['alice'],
        'category': categories['technology'],
        'tags': 'nextjs, django, fullstack, tutorial',
        'status': 'published',
    },
    {
        'title': 'The Art of Modern Web Design in 2026',
        'content': """Web design has evolved dramatically. Gone are the days of flat, uninspired interfaces. Today's web experiences are immersive, interactive, and deeply personal.

## Glassmorphism & Beyond

The glassmorphism trend has matured into something more refined. Modern interfaces use subtle transparency and blur effects to create depth without sacrificing readability. Combined with carefully crafted color palettes, these effects create interfaces that feel premium.

## Micro-Interactions Matter

Every button hover, page transition, and loading state is an opportunity to delight users. Framer Motion and CSS animations have made it easier than ever to add polish:

- Smooth page transitions that maintain context
- Responsive hover states that provide feedback
- Skeleton loading states that reduce perceived wait times
- Gesture-based interactions on mobile devices

## Color Theory in Practice

Choosing the right color palette is crucial. Tools like Coolors and Adobe Color help, but understanding color psychology is what separates good design from great design. Warm gradients convey energy and creativity, while cool tones suggest professionalism and trust.

## Typography as a Design Element

With Google Fonts offering thousands of options, typography has become a primary design tool. Pairing a modern sans-serif like Inter with a serif accent font creates visual hierarchy and personality.

The future of web design is about creating experiences that feel alive and responsive to user behavior.""",
        'excerpt': 'Exploring the latest trends in web design including glassmorphism, micro-interactions, and modern typography.',
        'author': users['bob'],
        'category': categories['design'],
        'tags': 'design, ui, ux, web-design, trends',
        'status': 'published',
    },
    {
        'title': 'Exploring the Mountains of Nepal',
        'content': """Nepal is a trekker's paradise, offering some of the most breathtaking mountain scenery on Earth. From the iconic Everest Base Camp trek to the serene Annapurna Circuit, every trail tells a story.

## Best Time to Visit

The ideal trekking seasons are spring (March-May) and autumn (September-November). During these months, you'll enjoy clear skies, comfortable temperatures, and the best views of the Himalayan peaks.

## Popular Treks

### Everest Base Camp
The classic trek takes 12-14 days and offers views of the world's highest peak. The journey through Sherpa villages and Buddhist monasteries is as enriching as the mountain views.

### Annapurna Circuit
A diverse 2-3 week trek that takes you through subtropical forests, high-altitude deserts, and over the Thorong La pass at 5,416 meters.

### Langtang Valley
Often called the "valley of glaciers," this less-crowded alternative offers stunning scenery just north of Kathmandu.

## Practical Tips

1. Acclimatize properly — altitude sickness is real and dangerous
2. Hire a local guide to support the community and ensure safety
3. Pack layers — temperatures can vary dramatically in a single day
4. Bring a good water purification system
5. Respect local customs and the environment

The mountains of Nepal remind us of our place in the natural world. Every step on these ancient trails connects you to centuries of human endeavor and natural beauty.""",
        'excerpt': 'A comprehensive guide to trekking in Nepal — from Everest Base Camp to the Annapurna Circuit.',
        'author': users['alice'],
        'category': categories['travel'],
        'tags': 'travel, nepal, trekking, mountains, adventure',
        'status': 'published',
    },
    {
        'title': 'Understanding Quantum Computing Basics',
        'content': """Quantum computing represents a fundamental shift in how we process information. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously.

## What Makes Quantum Different?

### Superposition
A qubit can be both 0 and 1 at the same time, thanks to the quantum mechanical principle of superposition. This allows quantum computers to process multiple possibilities simultaneously.

### Entanglement
When qubits become entangled, the state of one instantly influences the other, regardless of distance. This property enables quantum computers to solve certain problems exponentially faster than classical computers.

### Quantum Gates
Just as classical computers use logic gates, quantum computers use quantum gates to manipulate qubits. These gates perform operations that have no classical equivalent.

## Real-World Applications

1. **Drug Discovery**: Simulating molecular interactions to discover new medicines
2. **Cryptography**: Breaking current encryption and creating quantum-safe alternatives
3. **Financial Modeling**: Optimizing portfolios and pricing complex derivatives
4. **Climate Modeling**: Running more accurate climate simulations
5. **AI/ML**: Training models on datasets that are intractable for classical computers

## Current Limitations

Quantum computers are still in their early stages. Maintaining qubit coherence (preventing decoherence) remains the biggest technical challenge. Current quantum computers operate at temperatures near absolute zero and are highly sensitive to environmental noise.

Despite these challenges, companies like IBM, Google, and startups are making rapid progress. The quantum advantage — solving problems impossible for classical computers — is within reach for specific applications.""",
        'excerpt': 'A beginner-friendly introduction to quantum computing, covering qubits, superposition, entanglement, and real-world applications.',
        'author': users['bob'],
        'category': categories['science'],
        'tags': 'quantum, computing, science, technology, physics',
        'status': 'published',
    },
    {
        'title': 'Building Healthy Habits That Stick',
        'content': """Creating lasting habits is one of the most powerful things you can do for your personal growth. Research shows that nearly 40% of our daily actions are habitual, making habit formation a key lever for life improvement.

## The Science of Habit Formation

James Clear's "Atomic Habits" framework breaks habits into four components:

1. **Cue**: The trigger that initiates the behavior
2. **Craving**: The motivation behind the habit
3. **Response**: The actual habit you perform
4. **Reward**: The benefit you gain from the habit

## Strategies That Work

### Start Incredibly Small
Instead of "exercise for an hour," start with "put on your workout shoes." The key is reducing friction until the habit becomes automatic.

### Stack Your Habits
Attach new habits to existing ones. "After I pour my morning coffee, I will write in my journal for 5 minutes."

### Design Your Environment
Make good habits easy and bad habits hard. Put your running shoes by the door. Remove junk food from your kitchen. Your environment shapes your behavior more than willpower.

### Track Your Progress
Use a habit tracker to maintain a visual streak. The satisfaction of not breaking the chain is a powerful motivator.

## Common Pitfalls

- **All-or-nothing thinking**: Missing one day doesn't ruin your progress
- **Too many habits at once**: Focus on one habit at a time
- **Relying on motivation**: Systems beat motivation every time
- **No accountability**: Share your goals with someone who will check in

Remember: you don't rise to the level of your goals; you fall to the level of your systems. Build the systems, and the results will follow.""",
        'excerpt': 'Science-backed strategies for building lasting habits, from starting small to designing your environment for success.',
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
    print(f"  {status}: Blog '{blog.title[:50]}...'")

# Create sample comments
comments_data = [
    {'blog_title': 'Getting Started with Next.js and Django', 'author': users['bob'], 'content': 'Great tutorial! I\'ve been looking for a guide on combining these two frameworks. The JWT setup was especially helpful.'},
    {'blog_title': 'Getting Started with Next.js and Django', 'author': users['alice'], 'content': 'Thanks Bob! Let me know if you have questions about the deployment setup.'},
    {'blog_title': 'The Art of Modern Web Design in 2026', 'author': users['alice'], 'content': 'The section on micro-interactions really resonated with me. Small details make such a big difference in user experience.'},
    {'blog_title': 'Exploring the Mountains of Nepal', 'author': users['bob'], 'content': 'Amazing photos! I did the Annapurna Circuit last year and it was life-changing. Your tip about acclimatization is spot on.'},
    {'blog_title': 'Understanding Quantum Computing Basics', 'author': users['alice'], 'content': 'Finally an explanation of quantum computing that makes sense! The analogies really helped me understand superposition.'},
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
        print(f"  {status}: Comment on '{blog.title[:40]}...'")
    except Blog.DoesNotExist:
        print(f"  Skipped: Blog '{comment_data['blog_title']}' not found")

print("\nSeed data complete!")
