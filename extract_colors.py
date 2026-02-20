from PIL import Image
from collections import Counter

def get_dominant_colors(image_path, num_colors=3):
    try:
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))
        pixels = list(image.getdata())
        counts = Counter(pixels)
        sorted_pixels = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        
        print("Dominant Colors:")
        for i, (color, count) in enumerate(sorted_pixels[:num_colors]):
            hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
            print(f"{i+1}: {hex_color} (RGB: {color})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_dominant_colors("logo SinergIA Lab.png")
