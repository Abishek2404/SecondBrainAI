with open('src/components/Chat.tsx', 'r') as f:
    content = f.read()

content = content.replace("replace(/\\\\n$/, '')}", "replace(/\\n$/, '')}")

with open('src/components/Chat.tsx', 'w') as f:
    f.write(content)
