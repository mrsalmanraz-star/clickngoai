import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Smartphone,
  Globe,
  Monitor,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Palette,
  CheckCircle2,
} from "lucide-react";

const appTypes = [
  { id: "hybrid", name: "Hybrid App", icon: Smartphone, description: "Android + iOS + Web" },
  { id: "android", name: "Android", icon: Smartphone, description: "Native Android APK" },
  { id: "ios", name: "iOS", icon: Smartphone, description: "Native iOS IPA" },
  { id: "pwa", name: "PWA", icon: Globe, description: "Progressive Web App" },
  { id: "web", name: "Web App", icon: Globe, description: "Responsive Website" },
  { id: "desktop", name: "Desktop", icon: Monitor, description: "Windows/Mac/Linux" },
];

export default function CreateProject() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt: "",
    appType: "hybrid",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
  });

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      navigate(`/project/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const aiGenerateMutation = trpc.ai.generateAppIdea.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        name: data.name,
        description: data.description,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      }));
      toast.success("AI generated app details!");
    },
    onError: () => {
      toast.error("Failed to generate app details");
    },
  });

  const handleGenerateWithAI = () => {
    if (!formData.prompt || formData.prompt.length < 10) {
      toast.error("Please provide a more detailed description (at least 10 characters)");
      return;
    }
    aiGenerateMutation.mutate({ prompt: formData.prompt });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Please provide an app name");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      prompt: formData.prompt,
      appType: formData.appType as any,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s
                    ? "gradient-bg text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-2 rounded ${
                    step > s ? "gradient-bg" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Describe Your App */}
        {step === 1 && (
          <Card className="glass-card border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Describe Your App</CardTitle>
              <CardDescription>
                Tell us about your app idea in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">What do you want to build?</Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., A food delivery app with restaurant listings, order tracking, and payment integration..."
                  className="min-h-[150px] glass-card border-0"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                />
              </div>

              <Button
                className="w-full glass-button"
                onClick={handleGenerateWithAI}
                disabled={aiGenerateMutation.isPending}
              >
                {aiGenerateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Generate with AI
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or fill manually</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">App Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome App"
                    className="glass-card border-0"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your app..."
                    className="glass-card border-0"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="btn-premium"
                  onClick={() => setStep(2)}
                  disabled={!formData.name}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Platform */}
        {step === 2 && (
          <Card className="glass-card border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Choose Platform</CardTitle>
              <CardDescription>
                Select the platforms you want to target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.appType}
                onValueChange={(value) => setFormData({ ...formData, appType: value })}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {appTypes.map((type) => (
                  <div key={type.id}>
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.id}
                      className="flex flex-col items-center justify-center p-6 rounded-xl glass-card border-2 border-transparent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted/50"
                    >
                      <type.icon className="w-8 h-8 mb-2 text-primary" />
                      <span className="font-semibold">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" className="glass-button" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button className="btn-premium" onClick={() => setStep(3)}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customize & Create */}
        {step === 3 && (
          <Card className="glass-card border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Customize Your App</CardTitle>
              <CardDescription>
                Choose colors and finalize your app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Card */}
              <div 
                className="p-6 rounded-xl text-white text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` 
                }}
              >
                <h3 className="text-2xl font-bold mb-2">{formData.name || "Your App"}</h3>
                <p className="text-white/80">{formData.description || "App description"}</p>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="glass-card border-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="glass-card border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <h4 className="font-semibold">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">App Name:</span>
                  <span>{formData.name}</span>
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="capitalize">{formData.appType}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" className="glass-button" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="btn-premium" 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Create App
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
