const fs = require('fs');
let code = fs.readFileSync('src/components/ui/confirm-dialog.tsx', 'utf8');

code = code.replace(
    '<AlertDialogCancel>{cancelText}</AlertDialogCancel>',
    '<AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>'
);

// wait, the error said it expects size as well. Let's provide size="default"
code = code.replace(
    '<AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>',
    '<AlertDialogCancel variant="outline" size="default">{cancelText}</AlertDialogCancel>'
);

fs.writeFileSync('src/components/ui/confirm-dialog.tsx', code);
