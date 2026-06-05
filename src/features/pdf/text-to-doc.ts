function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build a Word-compatible .doc file from editor pages (opens in Word / LibreOffice). */
export function textToDoc(pages: string[]): Uint8Array {
  const trimmed = [...pages];
  while (trimmed.length > 1 && !trimmed[trimmed.length - 1].trim()) trimmed.pop();
  if (!trimmed.some((p) => p.trim())) throw new Error('Enter some text first.');

  const pageHtml = trimmed
    .map((page, index) => {
      const content = escapeHtml(page).replace(/\n/g, '<br/>');
      const breakStyle = index < trimmed.length - 1 ? 'page-break-after:always;' : '';
      return `<div style="${breakStyle}font-family:Calibri,sans-serif;font-size:12pt;line-height:1.4;">${content || '&#160;'}</div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Document</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4; margin: 2.54cm; }
  body { font-family: Calibri, sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; }
</style>
</head>
<body>${pageHtml}</body>
</html>`;

  return new TextEncoder().encode(html);
}
