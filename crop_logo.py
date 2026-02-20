from PIL import Image

def crop_image(input_path, output_path):
    try:
        img = Image.open(input_path)
        bbox = img.getbbox()
        if bbox:
            cropped_img = img.crop(bbox)
            cropped_img.save(output_path)
            print(f"Successfully cropped {input_path} to {output_path}")
            print(f"New size: {cropped_img.size}")
        else:
            print("Image appears empty!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    crop_image("logo_sinergia.png", "logo_sinergia_optimized.png")
