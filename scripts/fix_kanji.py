import os

filepath = r'e:\Users\tai_r\Documents\AI\mhwilds-site\js\data\decorations.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace('飞燕', '飛燕')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced 飞燕 with 飛燕")
