const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/chat.controller.ts', 'utf8');

code = code.replace(
  /const { text, conversationId, documentId } = req.body;/g,
  'const { text, conversationId, documentId, imageUrl } = req.body;'
);

code = code.replace(
  /conversation\.messages\.push\({[\s\S]*?role: 'user',[\s\S]*?content: text,[\s\S]*?createdAt: new Date\(\),[\s\S]*?}\);/m,
  `conversation.messages.push({
      role: 'user',
      content: text,
      image: imageUrl,
      createdAt: new Date(),
    });`
);

code = code.replace(
  /const history = conversation\.messages\.slice\(0, -1\)\.map\(\(m: any\) => \(\{[\s\S]*?role: m\.role,[\s\S]*?content: m\.content[\s\S]*?\}\)\);/m,
  `const history = conversation.messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: m.content,
      image: m.image
    }));`
);

code = code.replace(
  /const answer = await generateAnswer\(text, history, contextChunks\);/g,
  'const answer = await generateAnswer(text, history, contextChunks, imageUrl);'
);

fs.writeFileSync('src/server/controllers/chat.controller.ts', code);
