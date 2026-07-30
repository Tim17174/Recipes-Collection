from PIL import Image, ImageDraw, ImageFont

def make_icon(size, path):
    img = Image.new("RGB", (size, size), "#0f172a")
    draw = ImageDraw.Draw(img)
    # simple diagonal accent
    draw.rectangle([0, size * 0.62, size, size], fill="#38bdf8")
    text = "Hi"
    font_size = int(size * 0.42)
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1] - size * 0.05), text, fill="white", font=font)
    img.save(path)

make_icon(180, "icon-180.png")
make_icon(512, "icon-512.png")
print("icons written")
