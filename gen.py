import json, html
STYLE = ("cute anime style, kawaii chibi proportions (big head, small body), big sparkly eyes with star highlights, "
         "soft pastel palette (peach, mint, lavender, baby blue, butter yellow), clean soft lineart, gentle cel shading, "
         "storybook fairytale illustration, warm soft lighting")
CHAR_SUFFIX = "full body, centered, plain transparent/white background, no text, no watermark"
BG_SUFFIX = "storybook fairytale landscape background, wide 16:9, no characters, no text, no watermark, soft painterly pastel"
pets = [
 ("pet_bunny","Puffbun","a fluffy cream bunny with floppy ears tied with a pink ribbon","#FFD6E0"),
 ("pet_fox","Mochi Fox","a tiny peach-orange fox kit with a cloud-puff tail and a star-shaped forehead mark","#FFDCC2"),
 ("pet_dragon","Minty","a baby mint-green dragon with tiny wings and a round belly","#C8F2DC"),
 ("pet_owl","Hoot","a round lavender owlet wearing little round reading glasses holding a tiny book","#E2D6FF"),
]
avatars = [
 ("avatar_girl","Lily","a chibi girl adventurer with a short pastel-pink bob, flower hairclip, cape and satchel of books","#FFE3EC"),
 ("avatar_boy","Kai","a chibi boy adventurer with fluffy baby-blue hair, explorer cap, scarf and a quill pen","#D9ECFF"),
 ("avatar_mage","Nova","a chibi apprentice mage with long lavender twin-tails, starry wizard hat and a wand","#EDE0FF"),
]
realms = [
 ("bg_a1","A1","Meadow of First Words","a sunny flower meadow with a little cottage, rainbow and floating letter-shaped clouds","#FFF4C2"),
 ("bg_a2","A2","Candy Village","a cozy candy-roofed village with cobble paths, lanterns and a bakery","#FFE0EC"),
 ("bg_b1","B1","Whispering Forest","an enchanted pastel forest with glowing mushrooms, fairy lights and a winding path","#D6F5E3"),
 ("bg_b2","B2","Crystal Lake","a shimmering crystal lake with a wooden bridge, swans and distant castle towers","#D6EEFF"),
 ("bg_c1","C1","Cloud Castle","a floating castle on fluffy clouds at sunset with hot-air balloons","#E6DDFF"),
 ("bg_c2","C2","Starlight Library","a grand celestial library tower among stars and moons, books floating in the night sky","#D9D3F5"),
]
items=[]
def svg_char(name, color, emoji, w=512,h=512):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 512 512">
<defs><radialGradient id="g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="{color}"/></radialGradient></defs>
<rect x="16" y="16" width="480" height="480" rx="96" fill="url(#g)" stroke="#fff" stroke-width="10"/>
<circle cx="256" cy="220" r="120" fill="#fff" opacity=".7"/>
<text x="256" y="265" font-size="140" text-anchor="middle">{emoji}</text>
<text x="420" y="110" font-size="40" text-anchor="middle">✨</text><text x="96" y="140" font-size="30" text-anchor="middle">💖</text>
<text x="256" y="420" font-family="'Baloo 2','Nunito','Comic Sans MS',sans-serif" font-weight="800" font-size="46" fill="#7a5c8f" text-anchor="middle">{html.escape(name)}</text>
<text x="256" y="462" font-family="Nunito,sans-serif" font-size="22" fill="#a68bb8" text-anchor="middle">placeholder art</text></svg>'''
def svg_bg(level, name, color):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{color}"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#s)"/>
<g fill="#fff" opacity=".85"><ellipse cx="300" cy="180" rx="140" ry="50"/><ellipse cx="380" cy="160" rx="90" ry="45"/><ellipse cx="1250" cy="230" rx="160" ry="55"/><ellipse cx="1150" cy="210" rx="90" ry="45"/></g>
<path d="M0 700 Q400 560 800 680 T1600 640 V900 H0Z" fill="#cdeedd"/><path d="M0 780 Q500 680 1000 790 T1600 760 V900 H0Z" fill="#b6e3c9"/>
<text x="800" y="420" font-family="'Baloo 2','Nunito',sans-serif" font-weight="800" font-size="120" fill="#8a6fa8" text-anchor="middle">{level}</text>
<text x="800" y="510" font-family="'Baloo 2','Nunito',sans-serif" font-weight="700" font-size="60" fill="#a68bb8" text-anchor="middle">{html.escape(name)}</text>
<text x="800" y="570" font-family="Nunito,sans-serif" font-size="30" fill="#b9a3c8" text-anchor="middle">placeholder background</text></svg>'''
emo={"pet_bunny":"🐰","pet_fox":"🦊","pet_dragon":"🐉","pet_owl":"🦉","avatar_girl":"👧","avatar_boy":"👦","avatar_mage":"🧙"}
for id,name,desc,col in pets:
    p=f"assets/pets/{id}.svg"; open(p,"w").write(svg_char(name,col,emo[id]))
    items.append(dict(id=id,type="pet",name=name,priority=1,path=f"assets/pets/{id}.png",placeholder=p,aspect_ratio="1:1",size=[512,512],transparent=True,
      prompt=f"{desc}, starter pet companion, {STYLE}, {CHAR_SUFFIX}"))
for id,name,desc,col in avatars:
    p=f"assets/avatars/{id}.svg"; open(p,"w").write(svg_char(name,col,emo[id]))
    items.append(dict(id=id,type="avatar",name=name,priority=1,path=f"assets/avatars/{id}.png",placeholder=p,aspect_ratio="1:1",size=[512,512],transparent=True,
      prompt=f"{desc}, player avatar, {STYLE}, {CHAR_SUFFIX}"))
for id,lvl,name,desc,col in realms:
    p=f"assets/backgrounds/{id}.svg"; open(p,"w").write(svg_bg(lvl,name,col))
    items.append(dict(id=id,type="background",realm=lvl,name=name,priority=1,path=f"assets/backgrounds/{id}.png",placeholder=p,aspect_ratio="16:9",size=[1600,900],transparent=False,
      prompt=f"{desc}, CEFR {lvl} realm '{name}', {BG_SUFFIX}, {STYLE}"))
man=dict(version=1,style_guide=dict(characters=STYLE+", "+CHAR_SUFFIX,backgrounds=BG_SUFFIX+", "+STYLE,
  palette={"peach":"#FFDCC2","pink":"#FFD6E0","mint":"#C8F2DC","lavender":"#E2D6FF","baby_blue":"#D6EEFF","butter":"#FFF4C2","ink":"#7A5C8F"},
  notes="Generate all characters with the same style string and seed family for consistency. Real art goes to `path`; the game falls back to `placeholder` until the PNG exists."),
  assets=items)
json.dump(man,open("assets/manifest.json","w"),indent=2,ensure_ascii=False)
print(len(items))
