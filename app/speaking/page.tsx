'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPronunciationFeedback, getSpeakingExercise } from '@/lib/gemini';

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeakingExercise {
  topic: string;
  questions: string[];
  vocabulary: { word: string; meaning: string }[];
}

export default function SpeakingPractice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [exercise, setExercise] = useState<SpeakingExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          setTranscript(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionError) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, []);

  useEffect(() => {
    loadExercise();
  }, []);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      const newExercise = await getSpeakingExercise();
      setExercise(newExercise);
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
      setFeedback('');
    }
  };

  const stopListening = async () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      
      if (transcript) {
        try {
          setIsLoading(true);
          const feedback = await getPronunciationFeedback(transcript);
          setFeedback(feedback);
        } catch (error) {
          console.error('Failed to get feedback:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">英语口语练习</h1>
      
      {exercise && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{exercise.topic}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">练习问题：</h3>
              <ul className="list-disc pl-5">
                {exercise.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">相关词汇：</h3>
              <div className="grid grid-cols-2 gap-2">
                {exercise.vocabulary.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{item.word}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">实时语音识别</h2>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              disabled={isLoading}
            >
              {isListening ? '停止录音' : '开始录音'}
            </Button>
            <Button
              onClick={loadExercise}
              variant="outline"
              disabled={isLoading}
            >
              换个话题
            </Button>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg min-h-[100px]">
            {transcript || '请点击"开始录音"按钮并说话...'}
          </div>
          {feedback && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">AI 反馈：</h3>
              <div className="whitespace-pre-line">{feedback}</div>
            </div>
          )}
          {isLoading && (
            <div className="mt-4 text-center text-gray-600">
              正在处理...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 