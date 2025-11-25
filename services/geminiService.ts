import { GoogleGenAI } from "@google/genai";
import { DataPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeExperimentData = async (
  data: DataPoint[],
  userNote: string,
  language: 'en' | 'ko' = 'en',
  promptContext: string = "science experiment"
): Promise<string> => {
  if (data.length === 0) return language === 'ko' ? "분석할 데이터가 없습니다." : "No data available to analyze.";

  // Downsample data if too large to avoid token limits (take every nth item to fit ~50 items)
  const sampleSize = 50;
  const step = Math.max(1, Math.floor(data.length / sampleSize));
  const sampledData = data.filter((_, i) => i % step === 0);

  // Convert to CSV string for the model
  const keys = Object.keys(sampledData[0]).filter(k => k !== 'formattedTime' && k !== 'timestamp');
  
  let csvContent = `Time(s),${keys.join(',')}\n`;
  sampledData.forEach(row => {
    const values = keys.map(k => row[k]);
    csvContent += `${row.timestamp.toFixed(1)},${values.join(',')}\n`;
  });

  let systemPrompt = "";

  if (userNote.trim()) {
    // Mode: Feedback on User's Note
    systemPrompt = language === 'ko'
      ? `당신은 친절하고 유능한 과학 선생님입니다. 학생이 수행한 실험 데이터와 학생이 직접 작성한 관찰 노트가 주어집니다.
         다음 지침에 따라 피드백을 제공해 주세요:
         1. 학생의 관찰 내용이 실제 데이터와 일치하는지 확인하고 칭찬해 주세요.
         2. 학생이 놓친 중요한 데이터 패턴이나 이상치(Outlier)가 있다면 부드럽게 지적해 주세요.
         3. 현상에 대한 과학적 원리를 간단히 덧붙여 설명해 주세요.
         말투는 학생을 지도하듯이 격려하는 어조(존댓말)로 작성하세요.`
      : `You are a supportive and knowledgeable science teacher. You are provided with sensor data from an experiment and a student's observation note.
         Please provide feedback following these guidelines:
         1. Validate the student's observations against the actual data.
         2. Gently point out any significant trends or outliers the student might have missed.
         3. Add a brief scientific explanation for the observed phenomena.
         Keep the tone encouraging and educational.`;
  } else {
    // Mode: Pure Data Analysis
    systemPrompt = language === 'ko' 
      ? `당신은 유능한 AI 과학 실험 조교입니다. 주어진 센서 데이터를 분석하여 다음 내용을 한국어로 제공해 주세요.
         1. 데이터의 경향성 요약 (증가, 감소, 주기적 변화 등)
         2. 발견된 이상치(Outlier) 또는 특이사항
         3. 가능한 과학적 원리 설명 (예: 냉각 곡선, 가속도 운동 등)
         답변은 학생이나 연구자가 보기 편하게 간결하고 명확하게 작성하세요.`
      : `You are a helpful AI lab assistant. Analyze the following sensor data from a ${promptContext}.
         Please provide:
         1. A brief summary of the trend (increasing, decreasing, stable, oscillating).
         2. Any anomalies or outliers detected.
         3. A possible scientific explanation if the pattern matches common physical phenomena.
         Keep the response concise and suitable for a student or researcher dashboard.`;
  }

  const prompt = `
    ${systemPrompt}
    
    [Student's Note]:
    ${userNote || "(No note provided)"}

    [Sensor Data (Sampled CSV)]:
    ${csvContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });
    return response.text || (language === 'ko' ? "분석 결과를 생성할 수 없습니다." : "Could not generate analysis.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'ko' 
      ? "AI 조교와 연결하는 중 오류가 발생했습니다. API 키를 확인해 주세요." 
      : "Error connecting to AI assistant. Please check your API key and try again.";
  }
};