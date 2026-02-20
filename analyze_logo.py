from PIL import Image

def analyze_image(path):
    try:
        img = Image.open(path)
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
        
        # Check bounding box (trim whitespace)
        bbox = img.getbbox()
        if bbox:
            print(f"Content Bounding Box: {bbox}")
            width = bbox[2] - bbox[0]
            height = bbox[3] - bbox[1]
            print(f"Actual Content Size: {width}x{height}")
            
            total_area = img.size[0] * img.size[1]
            content_area = width * height
            details = f"Whitespace used: {(1 - content_area/total_area)*100:.1f}%"
            print(details)
        else:
            print("Image appears empty or fully transparent")
            
    except Exception as e:
        print(f"Error: {e}")

analyze_image("logo_sinergia.png")
