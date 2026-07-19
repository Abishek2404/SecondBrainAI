const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

const effectCode = `
  useEffect(() => {
    if (previewDoc) {
      setLoadingPreviewInfo(true);
      setPreviewDocInfo(null);
      apiFetch(\`/api/documents/\${previewDoc._id}/info\`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPreviewDocInfo(data.data);
          }
        })
        .finally(() => {
          setLoadingPreviewInfo(false);
        });
    } else {
      setPreviewDocInfo(null);
    }
  }, [previewDoc]);
`;

code = code.replace(/const handleCreateFolder = async \(\) => {/, effectCode + '\n  const handleCreateFolder = async () => {');
fs.writeFileSync('src/components/Documents.tsx', code);
