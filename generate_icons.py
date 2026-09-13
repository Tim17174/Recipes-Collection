from PIL import Image, ImageDraw

GOLD = "#B67F3B"

def scale(pts, s):
    return [(x * s, y * s) for x, y in pts]

def draw_round_line(draw, p1, p2, width, fill):
    draw.line([p1, p2], fill=fill, width=round(width))
    r = width / 2
    draw.ellipse([p1[0] - r, p1[1] - r, p1[0] + r, p1[1] + r], fill=fill)
    draw.ellipse([p2[0] - r, p2[1] - r, p2[0] + r, p2[1] + r], fill=fill)

def draw_bracket(draw, pts, s, width, fill):
    p = scale(pts, s)
    draw_round_line(draw, p[0], p[1], width * s, fill)
    draw_round_line(draw, p[1], p[2], width * s, fill)

def make_icon(size, path):
    s = size / 100
    img = Image.new("RGB", (size, size), GOLD)
    draw = ImageDraw.Draw(img)

    bw = 3.5
    draw_bracket(draw, [(14, 26), (14, 14), (26, 14)], s, bw, "white")
    draw_bracket(draw, [(74, 14), (86, 14), (86, 26)], s, bw, "white")
    draw_bracket(draw, [(14, 74), (14, 86), (26, 86)], s, bw, "white")
    draw_bracket(draw, [(86, 74), (86, 86), (74, 86)], s, bw, "white")

    card = [29 * s, 23 * s, 71 * s, 77 * s]
    draw.rounded_rectangle(card, radius=4 * s, fill="white")

    draw.polygon(scale([(61, 23), (71, 23), (71, 33)], s), fill=GOLD)

    lw = 2.6 * s
    for (x1, y1, x2, y2) in [(36, 42, 60, 42), (36, 52, 64, 52), (36, 62, 56, 62), (36, 70, 64, 70)]:
        draw_round_line(draw, (x1 * s, y1 * s), (x2 * s, y2 * s), lw, GOLD)

    img.save(path)

make_icon(180, "icon-180.png")
make_icon(512, "icon-512.png")
print("icons written")
