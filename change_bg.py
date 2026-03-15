from PIL import Image

def change_bg(input_path, output_path, target_color):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # If it's pure black, change it to the target color
        if item[0] == 0 and item[1] == 0 and item[2] == 0:
            new_data.append((target_color[0], target_color[1], target_color[2], 255))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    change_bg("icon/title.png", "icon/title.png", (10, 11, 13))
