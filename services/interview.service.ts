import api from "./api";

export type InterviewAnswer = {
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
  strengths?: string[];
  improvements?: string[];
};

export type InterviewRecord = {
  _id: string;
  role: string;
  level: string;
  techStack: string[];
  questions: string[];
  answers: InterviewAnswer[];
  overallScore?: number;
};

export type InterviewTemplateSummary = {
  id: string;
  title: string;
  summary: string;
  role: string;
  level: string;
  techStack: string[];
  questionCount: number;
};

export const getInterviewTemplates = async () => {
  const response = await api.get("/interview/templates");

  return response.data as {
    success: boolean;
    templates: InterviewTemplateSummary[];
  };
};

export const createInterviewFromTemplate = async (templateId: string) => {
  const response = await api.post("/interview/from-template", { templateId });

  return response.data as { success: boolean; interview: InterviewRecord };
};

export const createInterview = async (data: {
  role: string;
  level: string;
  techStack: string[];
}) => {
  const response = await api.post("/interview/create", data);

  return response.data as { success: boolean; interview: InterviewRecord };
};

export const getInterview = async (interviewId: string) => {
  const response = await api.get(`/interview/${interviewId}`);

  return response.data as { success: boolean; interview: InterviewRecord };
};

export const submitAnswer = async (
  interviewId: string,
  data: {
    questionIndex: number;
    answer: string;
  },
) => {
  const response = await api.post(`/interview/${interviewId}/answer`, data);

  return response.data as {
    success: boolean;
    evaluation: {
      score: number;
      feedback: string;
      strengths?: string[];
      improvements?: string[];
    };
    overallScore: number;
  };
};
