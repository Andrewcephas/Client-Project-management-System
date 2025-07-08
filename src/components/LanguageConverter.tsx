import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Copy, Volume2, Globe } from "lucide-react";
import { toast } from "sonner";

const LanguageConverter = () => {
  const [englishText, setEnglishText] = useState("");
  const [kiswahiliText, setKiswahiliText] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  // Simple translation dictionary for common phrases
  const translations: Record<string, string> = {
    "hello": "habari",
    "good morning": "habari ya asubuhi",
    "good afternoon": "habari ya mchana", 
    "good evening": "habari ya jioni",
    "thank you": "asante",
    "please": "tafadhali",
    "yes": "ndiyo",
    "no": "hapana",
    "water": "maji",
    "food": "chakula",
    "house": "nyumba",
    "project": "mradi",
    "work": "kazi",
    "money": "pesa",
    "time": "wakati",
    "day": "siku",
    "week": "wiki",
    "month": "mwezi",
    "year": "mwaka",
    "client": "mteja",
    "company": "kampuni",
    "meeting": "mkutano",
    "report": "ripoti",
    "budget": "bajeti",
    "progress": "maendeleo",
    "complete": "kukamilika",
    "pending": "inasubiri",
    "approved": "imeidhinishwa"
  };

  const convertToKiswahili = () => {
    setIsConverting(true);
    
    // Simple word-by-word translation
    const words = englishText.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = word.replace(/[.,!?;]/g, '');
      return translations[cleanWord] || word;
    });
    
    setTimeout(() => {
      setKiswahiliText(translatedWords.join(' '));
      setIsConverting(false);
      toast.success("Translation completed!");
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const speakText = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'sw-KE';
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Globe className="w-6 h-6" />
          English to Kiswahili Converter
        </CardTitle>
        <CardDescription>
          Translate English text to Kiswahili (Basic word translation)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* English Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">English</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(englishText, 'en')}
                  disabled={!englishText}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(englishText)}
                  disabled={!englishText}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Enter English text here..."
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>

          {/* Kiswahili Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Kiswahili</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(kiswahiliText, 'sw')}
                  disabled={!kiswahiliText}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => copyToClipboard(kiswahiliText)}
                  disabled={!kiswahiliText}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Kiswahili translation will appear here..."
              value={kiswahiliText}
              readOnly
              className="min-h-[150px] resize-none bg-muted"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={convertToKiswahili}
            disabled={!englishText.trim() || isConverting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isConverting ? (
              <>Converting...</>
            ) : (
              <>
                Convert to Kiswahili
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Note: This is a basic word-by-word translation tool for common phrases and may not provide accurate grammar or context.
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageConverter;