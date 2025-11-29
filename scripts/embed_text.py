import os
from PIL import Image, ImageDraw, ImageFont

# Directory containing the images
IMAGE_DIR = "public/images/menu-headers"

# Font settings (try to find a system font or use default)
try:
    # Try to load a nice font (Arial or similar)
    FONT_PATH = "arial.ttf" 
    FONT_SIZE = 60
    font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
except IOError:
    # Fallback to default font if arial is not found
    print("Arial font not found, using default.")
    font = ImageFont.load_default()

def process_image(filename):
    if not filename.endswith(('.png', '.jpg', '.jpeg')):
        return

    filepath = os.path.join(IMAGE_DIR, filename)
    
    try:
        with Image.open(filepath) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            draw = ImageDraw.Draw(img)
            
            # Get text from filename (remove extension, replace hyphens/underscores with spaces, title case)
            text = os.path.splitext(filename)[0].replace('-', ' ').replace('_', ' ').upper()
            
            # Handle special Turkish characters if needed (simple mapping for now)
            text = text.replace('i', 'İ').replace('ı', 'I') # Basic fix, might need more robust handling
            
            # Calculate text position (center)
            # bbox = draw.textbbox((0, 0), text, font=font) # For newer Pillow
            # text_width = bbox[2] - bbox[0]
            # text_height = bbox[3] - bbox[1]
            
            # Older Pillow compatibility
            text_width, text_height = draw.textsize(text, font=font)
            
            width, height = img.size
            x = (width - text_width) / 2
            y = (height - text_height) / 2
            
            # Draw text with shadow/outline for better visibility
            shadow_color = "black"
            text_color = "white"
            
            # Draw shadow
            draw.text((x+2, y+2), text, font=font, fill=shadow_color)
            
            # Draw text
            draw.text((x, y), text, font=font, fill=text_color)
            
            # Save the image
            img.save(filepath)
            print(f"Processed: {filename} -> {text}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    if not os.path.exists(IMAGE_DIR):
        print(f"Directory not found: {IMAGE_DIR}")
        return

    print(f"Processing images in {IMAGE_DIR}...")
    for filename in os.listdir(IMAGE_DIR):
        process_image(filename)
    print("Done.")

if __name__ == "__main__":
    main()
