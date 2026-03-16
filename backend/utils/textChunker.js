/**
 * Split text into chunks for better AI processing
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/ +/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }
      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }

  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || !Array.isArray(chunks) || chunks.length === 0 || !query) {
    return [];
  }

  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for", "of", "as", "by", "this", "that", "it"
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Agar chunks Mongoose objects hoy, tobe oiguloke clean object-e convert kora proyojon
  const scoredChunks = chunks.map((chunk, index) => {
    // Check if content exists to prevent crash
    const content = (chunk.content || "").toLowerCase();
    const contentWords = content.split(/\s+/).length || 1;
    let score = 0;

    if (queryWords.length > 0) {
      for (const word of queryWords) {
        const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
        score += exactMatches * 3;
        const partialMatches = (content.match(new RegExp(word, "g")) || []).length;
        score += Math.max(0, partialMatches - exactMatches) * 1.5;
      }
    }

    const uniqueWordsFound = queryWords.filter((word) => content.includes(word)).length;
    if (uniqueWordsFound > 1) score += uniqueWordsFound * 2;

    const normalizedScore = score / Math.sqrt(contentWords);
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber || 0,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      matchedWords: uniqueWordsFound,
    };
  });
  
  // Jodi query khub chhoto hoy, prothom duto/tinty chunk return korbe
  if (queryWords.length === 0) return scoredChunks.slice(0, maxChunks);

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, maxChunks);
};