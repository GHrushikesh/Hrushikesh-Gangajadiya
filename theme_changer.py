import os

def replace_colors(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replacements
    content = content.replace('#eb5939', '#E60012')  # Spidey Red
    content = content.replace('#0d0d0d', '#050505')  # Deep Black
    content = content.replace('#b7ab98', '#FFFFFF')  # White (was beige)
    content = content.replace('#B7AB98', '#FFFFFF')  # White (uppercase)
    
    with open(file_path, 'w') as f:
        f.write(content)

replace_colors('app.css')
replace_colors('index.html')
print("Theme changed to Miles Morales successfully!")
