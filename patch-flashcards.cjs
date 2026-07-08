const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/flashcards.controller.ts', 'utf8');
code = code.replace(
  "const decks = await FlashcardDeck.find({ user: req.user?._id }).sort('-createdAt');",
  `const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (page - 1) * limit;
    const decks = await FlashcardDeck.find({ user: req.user?._id }).sort('-createdAt').skip(skip).limit(limit);
    const total = await FlashcardDeck.countDocuments({ user: req.user?._id });`
);
code = code.replace(
  "count: decks.length,",
  "total, page, pages: Math.ceil(total / limit),"
);
fs.writeFileSync('src/server/controllers/flashcards.controller.ts', code);
