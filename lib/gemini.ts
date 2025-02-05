import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function getPronunciationFeedback(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `As an English pronunciation teacher, analyze the following English text and provide feedback in Chinese:
  "${text}"
  
  Please provide feedback in the following format:
  1. 发音准确度评估
  2. 需要改进的音素
  3. 建议的练习方法
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function getSpeakingExercise(): Promise<{
  topic: string;
  questions: string[];
  vocabulary: { word: string; meaning: string }[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a speaking exercise in the following JSON format:
  {
    "topic": "话题名称",
    "questions": ["相关问题1", "相关问题2", "相关问题3"],
    "vocabulary": [
      {"word": "单词1", "meaning": "中文含义"},
      {"word": "单词2", "meaning": "中文含义"}
    ]
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
} 