import JSZip from "jszip";

export interface ExtractedFile {
  path: string;
  filename: string;
  language: string;
  content: string;
  lineCount: number;
}

/**
 * Extracts distinct code files from an artifact markdown document.
 * Looks for pattern:
 * ```lang
 * // path/to/file.ext
 * content...
 * ```
 * or
 * ## Heading (path/to/file.ext)
 */
export function parseArtifactFiles(markdownContent: string): ExtractedFile[] {
  if (!markdownContent) return [];

  const files: ExtractedFile[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  let fileIndex = 1;

  while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
    const language = (match[1] || "typescript").trim();
    const rawCode = match[2] || "";

    // Skip shell/bash commands if they are just 1-2 lines of npm install
    if (
      (language === "bash" || language === "sh") &&
      rawCode.trim().split("\n").length <= 3 &&
      (rawCode.includes("npm ") || rawCode.includes("npx ") || rawCode.includes("yarn ") || rawCode.includes("pnpm "))
    ) {
      continue;
    }

    // Try to extract filename from the first few lines of the code block
    // e.g. "// types/examClassifier.ts", "/* lib/difficultyEngine.ts */", "# data/sample.json"
    let filePath = "";
    const lines = rawCode.split("\n");
    const firstLine = lines[0]?.trim() || "";
    const secondLine = lines[1]?.trim() || "";

    const pathMatches = [
      firstLine.match(/^\/\/\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/),
      firstLine.match(/^\/\*\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)\s*\*\//),
      firstLine.match(/^#\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/),
      firstLine.match(/^[<#*]{0,3}\s*([a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx|json|py|css|html|sql|md))/i),
      secondLine.match(/^\/\/\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/),
    ];

    for (const pm of pathMatches) {
      if (pm && pm[1]) {
        filePath = pm[1].trim();
        break;
      }
    }

    // If still not found, check the text preceding the code block in markdown
    if (!filePath) {
      const textBefore = markdownContent.substring(0, match.index);
      const precedingHeadingMatch = textBefore.match(
        /[`(]([a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx|json|py|css|html|sql|md))[`)](?:[^\n]*\n)*$/i
      );
      if (precedingHeadingMatch && precedingHeadingMatch[1]) {
        filePath = precedingHeadingMatch[1].trim();
      }
    }

    // Default fallback based on language
    if (!filePath) {
      const ext =
        language === "tsx"
          ? "tsx"
          : language === "jsx"
          ? "jsx"
          : language === "javascript" || language === "js"
          ? "js"
          : language === "json"
          ? "json"
          : language === "python" || language === "py"
          ? "py"
          : language === "css"
          ? "css"
          : language === "html"
          ? "html"
          : "ts";
      filePath = `src/module_${fileIndex}.${ext}`;
    }

    // Clean up filename
    const filename = filePath.split("/").pop() || filePath;

    files.push({
      path: filePath,
      filename,
      language: language || "typescript",
      content: rawCode,
      lineCount: lines.length,
    });

    fileIndex++;
  }

  return files;
}

/**
 * Trigger browser download of a single text file
 */
export function downloadSingleFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete ZIP package of all extracted files
 */
export async function downloadProjectZip(
  projectName: string,
  fullMarkdownContent: string,
  extraFiles?: Record<string, string>
) {
  const zip = new JSZip();
  const files = parseArtifactFiles(fullMarkdownContent);

  const cleanProjectName =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "multi-ai-project";

  // 1. Add all parsed code files
  if (files.length > 0) {
    for (const f of files) {
      zip.file(f.path, f.content);
    }
  }

  // 2. Add extra files if provided
  if (extraFiles) {
    for (const [path, content] of Object.entries(extraFiles)) {
      zip.file(path, content);
    }
  }

  // 3. Add README.md
  const readmeContent = `# ${projectName}

> Dự án được tạo tự động bởi Multi-AI Workspace Orchestrator.
> Bao gồm đầy đủ mã nguồn chuẩn, thuật toán và tài liệu kỹ thuật có thể chạy ngay.

## Danh sách tệp nguồn đã xuất:
${files.map((f) => `- \`${f.path}\` (${f.lineCount} dòng)`).join("\n")}

## Hướng dẫn cài đặt & Khởi chạy nhanh:

\`\`\`bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển
npm run dev
\`\`\`

---
## Toàn bộ đặc tả kỹ thuật:
${fullMarkdownContent}
`;
  zip.file("README.md", readmeContent);

  // 4. Add package.json if not already present
  if (!files.some((f) => f.path.includes("package.json"))) {
    const packageJson = {
      name: cleanProjectName,
      version: "1.0.0",
      description: projectName,
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "lucide-react": "^1.48.0",
        clsx: "^2.1.1",
        "tailwind-merge": "^3.7.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
        "@types/react": "^19.0.0",
        "@types/node": "^20.0.0",
        tailwindcss: "^4.0.0",
      },
    };
    zip.file("package.json", JSON.stringify(packageJson, null, 2));
  }

  // 5. Generate zip blob and download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanProjectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
